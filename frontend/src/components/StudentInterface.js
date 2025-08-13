import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import StudentNameEntry from "./StudentNameEntry";
import PollVoting from "./PollVoting";
import PollResultsView from "./PollResultsView";
import ChatPanel from "./ChatPanel";
import "./StudentInterface.css";

const StudentInterface = () => {
  const { socket, connected } = useSocket();
  const [studentName, setStudentName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check if name exists in sessionStorage
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      setStudentName(savedName);
      setHasJoined(true);
      if (socket) {
        socket.emit("join-student", { name: savedName });
      }
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("current-poll", (data) => {
      setCurrentPoll(data.poll);
      setHasVoted(data.hasVoted || false);
      setTimeRemaining(data.timeRemaining || 0);
      setShowResults(data.poll && (!data.poll.isActive || data.hasVoted));
    });

    socket.on("new-poll", (data) => {
      setCurrentPoll(data.poll);
      setHasVoted(false);
      setTimeRemaining(data.timeRemaining);
      setShowResults(false);
    });

    socket.on("poll-results", (data) => {
      setCurrentPoll(data.poll);
      if (hasVoted || !data.poll.isActive) {
        setShowResults(true);
      }
    });

    socket.on("poll-ended", (data) => {
      setCurrentPoll(data.poll);
      setShowResults(true);
    });

    socket.on("vote-recorded", (data) => {
      setHasVoted(true);
      setCurrentPoll(data.poll);
      setShowResults(true);
    });

    socket.on("error", (error) => {
      alert(error.message);
    });

    return () => {
      socket.off("current-poll");
      socket.off("new-poll");
      socket.off("poll-results");
      socket.off("poll-ended");
      socket.off("vote-recorded");
      socket.off("error");
    };
  }, [socket, hasVoted]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || hasVoted || !currentPoll?.isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasVoted, currentPoll]);

  const joinAsStudent = (name) => {
    setStudentName(name);
    setHasJoined(true);
    sessionStorage.setItem("studentName", name);
    socket.emit("join-student", { name });
  };

  const submitVote = (optionId) => {
    socket.emit("submit-vote", { optionId });
  };

  if (!connected) {
    return (
      <div className="student-interface">
        <div className="connection-status">
          <div className="loading">Connecting to server...</div>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return <StudentNameEntry onJoin={joinAsStudent} />;
  }

  return (
    <div className="student-interface">
      <header className="student-header">
        <div className="student-info">
          <h1>Welcome, {studentName}!</h1>
          <div className="connection-indicator connected">
            <span className="indicator-dot"></span>
            Connected
          </div>
        </div>
        <button className="chat-toggle" onClick={() => setShowChat(!showChat)}>
          💬 Chat
        </button>
      </header>

      <main className="student-content">
        {!currentPoll ? (
          <div className="waiting-state">
            <div className="waiting-icon">⏳</div>
            <h2>Waiting for poll...</h2>
            <p>Your teacher will start a poll soon</p>
          </div>
        ) : showResults ? (
          <PollResultsView poll={currentPoll} />
        ) : (
          <PollVoting
            poll={currentPoll}
            timeRemaining={timeRemaining}
            onSubmitVote={submitVote}
            hasVoted={hasVoted}
          />
        )}
      </main>

      {showChat && (
        <ChatPanel
          role="student"
          studentName={studentName}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default StudentInterface;
