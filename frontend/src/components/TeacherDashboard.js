import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import PollCreator from "./PollCreator";
import PollResults from "./PollResults";
import StudentsList from "./StudentsList";
import PollHistory from "./PollHistory";
import ChatPanel from "./ChatPanel";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const { socket, connected } = useSocket();
  const [currentPoll, setCurrentPoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [votes, setVotes] = useState({});
  const [pollHistory, setPollHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Join teacher room
    socket.emit("join-teacher");

    // Listen for events
    socket.on("current-poll", (data) => {
      setCurrentPoll(data.poll);
      setStudents(data.students || []);
      setVotes(data.votes || {});
      setPollHistory(data.history || []);
    });

    socket.on("poll-created", (data) => {
      setCurrentPoll(data.poll);
      setStudents(data.students || []);
      setActiveTab("results");
    });

    socket.on("students-updated", (studentList) => {
      setStudents(studentList);
    });

    socket.on("poll-results", (data) => {
      setCurrentPoll(data.poll);
    });

    socket.on("poll-ended", (data) => {
      setCurrentPoll(data.poll);
      setPollHistory((prev) => [data, ...prev.slice(0, 9)]);
    });

    socket.on("error", (error) => {
      alert(error.message);
    });

    return () => {
      socket.off("current-poll");
      socket.off("poll-created");
      socket.off("students-updated");
      socket.off("poll-results");
      socket.off("poll-ended");
      socket.off("error");
    };
  }, [socket]);

  const createPoll = (pollData) => {
    socket.emit("create-poll", pollData);
  };

  const endPoll = () => {
    socket.emit("end-poll");
  };

  const removeStudent = (studentId) => {
    socket.emit("remove-student", { studentId });
  };

  if (!connected) {
    return (
      <div className="teacher-dashboard">
        <div className="connection-status">
          <div className="loading">Connecting to server...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-controls">
          <div className="connection-indicator connected">
            <span className="indicator-dot"></span>
            Connected ({students.length} students)
          </div>
          <button
            className="chat-toggle"
            onClick={() => setShowChat(!showChat)}
          >
            💬 Chat
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create Poll
        </button>
        <button
          className={`nav-tab ${activeTab === "results" ? "active" : ""}`}
          onClick={() => setActiveTab("results")}
        >
          Live Results
        </button>
        <button
          className={`nav-tab ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Students ({students.length})
        </button>
        <button
          className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "create" && (
          <PollCreator
            onCreatePoll={createPoll}
            currentPoll={currentPoll}
            studentsCount={students.length}
          />
        )}

        {activeTab === "results" && (
          <PollResults
            poll={currentPoll}
            students={students}
            onEndPoll={endPoll}
          />
        )}

        {activeTab === "students" && (
          <StudentsList students={students} onRemoveStudent={removeStudent} />
        )}

        {activeTab === "history" && <PollHistory history={pollHistory} />}
      </main>

      {showChat && (
        <ChatPanel role="teacher" onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default TeacherDashboard;
