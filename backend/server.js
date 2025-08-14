const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://live-polling-system-frontend-91iu.onrender.com", // In production, specify your frontend domain
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
let currentPoll = null;
let students = new Map(); // socketId -> student info
let votes = new Map(); // studentId -> vote
let pollHistory = [];
let chatHistory = [];

// Room constants
const TEACHER_ROOM = 'teacher-room';
const STUDENT_ROOM = 'student-room';

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher joins
  socket.on('join-teacher', () => {
    socket.join(TEACHER_ROOM);
    console.log('Teacher joined:', socket.id);
    
    // Send current poll data to teacher
    socket.emit('current-poll', {
      poll: currentPoll,
      students: Array.from(students.values()),
      votes: Object.fromEntries(votes),
      history: pollHistory
    });
  });

  // Student joins with name
  socket.on('join-student', (data) => {
    const { name } = data;
    
    socket.join(STUDENT_ROOM);
    
    const studentInfo = {
      id: socket.id,
      name: name,
      joinedAt: new Date(),
      hasVoted: votes.has(socket.id)
    };
    
    students.set(socket.id, studentInfo);
    console.log('Student joined:', name, socket.id);
    
    // Send current poll to student
    socket.emit('current-poll', {
      poll: currentPoll,
      hasVoted: votes.has(socket.id),
      timeRemaining: currentPoll ? getRemainingTime() : 0
    });
    
    // Update teacher with new student list
    io.to(TEACHER_ROOM).emit('students-updated', Array.from(students.values()));
  });

  // Teacher creates a new poll
  socket.on('create-poll', (data) => {
    const { question, options, timeLimit = 60 } = data;
    
    // Check if can create new poll
    if (currentPoll && !canCreateNewPoll()) {
      socket.emit('error', { message: 'Cannot create poll. Students are still voting.' });
      return;
    }
    
    // Clear previous votes
    votes.clear();
    
    // Create new poll
    currentPoll = {
      id: Date.now().toString(),
      question,
      options: options.map((option, index) => ({
        id: index,
        text: option,
        votes: 0
      })),
      timeLimit,
      startTime: new Date(),
      endTime: new Date(Date.now() + timeLimit * 1000),
      isActive: true
    };
    
    console.log('New poll created:', currentPoll.question);
    
    // Reset student vote status
    students.forEach((student, socketId) => {
      student.hasVoted = false;
      students.set(socketId, student);
    });
    
    // Send poll to all participants
    io.to(STUDENT_ROOM).emit('new-poll', {
      poll: currentPoll,
      timeRemaining: timeLimit
    });
    
    io.to(TEACHER_ROOM).emit('poll-created', {
      poll: currentPoll,
      students: Array.from(students.values())
    });
    
    // Set timer to end poll
    setTimeout(() => {
      endPoll();
    }, timeLimit * 1000);
  });

  // Student submits vote
  socket.on('submit-vote', (data) => {
    const { optionId } = data;
    
    if (!currentPoll || !currentPoll.isActive) {
      socket.emit('error', { message: 'No active poll' });
      return;
    }
    
    if (votes.has(socket.id)) {
      socket.emit('error', { message: 'You have already voted' });
      return;
    }
    
    if (new Date() > currentPoll.endTime) {
      socket.emit('error', { message: 'Poll has ended' });
      return;
    }
    
    // Record vote
    votes.set(socket.id, optionId);
    
    // Update student status
    const student = students.get(socket.id);
    if (student) {
      student.hasVoted = true;
      students.set(socket.id, student);
    }
    
    // Update poll results
    currentPoll.options[optionId].votes += 1;
    
    console.log(`Vote recorded: ${student?.name} voted for option ${optionId}`);
    
    // Send confirmation to voter
    socket.emit('vote-recorded', { 
      poll: currentPoll,
      hasVoted: true 
    });
    
    // Send real-time results to everyone
    const results = {
      poll: currentPoll,
      totalVotes: votes.size,
      studentsCount: students.size
    };
    
    io.to(TEACHER_ROOM).emit('poll-results', results);
    io.to(STUDENT_ROOM).emit('poll-results', results);
    
    // Check if all students have voted
    if (votes.size === students.size && students.size > 0) {
      setTimeout(() => {
        endPoll();
      }, 1000); // Give a moment for UI updates
    }
  });

  // Teacher ends poll manually
  socket.on('end-poll', () => {
    if (currentPoll && currentPoll.isActive) {
      endPoll();
    }
  });

  // Teacher removes student
  socket.on('remove-student', (data) => {
    const { studentId } = data;
    const studentSocket = io.sockets.sockets.get(studentId);
    
    if (studentSocket) {
      // Remove from data
      students.delete(studentId);
      votes.delete(studentId);
      
      // Disconnect student
      studentSocket.disconnect();
      
      // Update teacher
      io.to(TEACHER_ROOM).emit('students-updated', Array.from(students.values()));
      
      console.log('Student removed:', studentId);
    }
  });

  // Get poll history
  socket.on('get-poll-history', () => {
    socket.emit('poll-history', pollHistory);
  });

  // Chat functionality (Bonus Feature)
  socket.on('send-message', (message) => {
    const chatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    chatHistory.push(chatMessage);
    
    // Keep only last 50 messages
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(-50);
    }
    
    // Broadcast to all connected users
    io.emit('chat-message', chatMessage);
  });

  socket.on('get-chat-history', () => {
    socket.emit('chat-history', chatHistory);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from students if was a student
    if (students.has(socket.id)) {
      students.delete(socket.id);
      votes.delete(socket.id);
      
      // Update teacher
      io.to(TEACHER_ROOM).emit('students-updated', Array.from(students.values()));
    }
  });
});

// Helper functions
function canCreateNewPoll() {
  if (!currentPoll) return true;
  
  // Can create if no question asked yet OR all students have answered
  return !currentPoll.isActive || votes.size === students.size;
}

function endPoll() {
  if (!currentPoll) return;
  
  currentPoll.isActive = false;
  currentPoll.actualEndTime = new Date();
  
  // Calculate final results
  const finalResults = {
    poll: currentPoll,
    totalVotes: votes.size,
    studentsCount: students.size,
    results: currentPoll.options.map(option => ({
      ...option,
      percentage: votes.size > 0 ? Math.round((option.votes / votes.size) * 100) : 0
    }))
  };
  
  // Add to history
  pollHistory.unshift({
    ...finalResults,
    endedAt: new Date()
  });
  
  // Keep only last 10 polls in history
  if (pollHistory.length > 10) {
    pollHistory = pollHistory.slice(0, 10);
  }
  
  console.log('Poll ended:', currentPoll.question);
  
  // Send final results
  io.to(TEACHER_ROOM).emit('poll-ended', finalResults);
  io.to(STUDENT_ROOM).emit('poll-ended', finalResults);
}

function getRemainingTime() {
  if (!currentPoll || !currentPoll.isActive) return 0;
  
  const remaining = Math.max(0, Math.floor((currentPoll.endTime - new Date()) / 1000));
  return remaining;
}

// API endpoints for health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    activeStudents: students.size,
    currentPoll: currentPoll ? currentPoll.question : "None",
  });
});

app.get("/stats", (req, res) => {
  res.json({
    connectedStudents: students.size,
    currentPoll: currentPoll,
    votes: votes.size,
    pollHistory: pollHistory.length,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Live Polling Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
