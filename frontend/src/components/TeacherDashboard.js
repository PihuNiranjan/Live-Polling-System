// import React, { useState, useEffect } from "react";
// import { useSocket } from "../context/SocketContext";
// import PollCreator from "./PollCreator";
// import PollResults from "./PollResults";
// import StudentsList from "./StudentsList";
// import PollHistory from "./PollHistory";
// import ChatPanel from "./ChatPanel";
// import "./TeacherDashboard.css";

// const TeacherDashboard = () => {
//   const { socket, connected } = useSocket();
//   const [currentPoll, setCurrentPoll] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [votes, setVotes] = useState({});
//   const [pollHistory, setPollHistory] = useState([]);
//   const [activeTab, setActiveTab] = useState("create");
//   const [showChat, setShowChat] = useState(false);

//   useEffect(() => {
//     if (!socket) return;

//     // Join teacher room
//     socket.emit("join-teacher");

//     // Listen for events
//     socket.on("current-poll", (data) => {
//       setCurrentPoll(data.poll);
//       setStudents(data.students || []);
//       setVotes(data.votes || {});
//       setPollHistory(data.history || []);
//     });

//     socket.on("poll-created", (data) => {
//       setCurrentPoll(data.poll);
//       setStudents(data.students || []);
//       setActiveTab("results");
//     });

//     socket.on("students-updated", (studentList) => {
//       setStudents(studentList);
//     });

//     socket.on("poll-results", (data) => {
//       setCurrentPoll(data.poll);
//     });

//     socket.on("poll-ended", (data) => {
//       setCurrentPoll(data.poll);
//       setPollHistory((prev) => [data, ...prev.slice(0, 9)]);
//     });

//     socket.on("error", (error) => {
//       alert(error.message);
//     });

//     return () => {
//       socket.off("current-poll");
//       socket.off("poll-created");
//       socket.off("students-updated");
//       socket.off("poll-results");
//       socket.off("poll-ended");
//       socket.off("error");
//     };
//   }, [socket]);

//   const createPoll = (pollData) => {
//     socket.emit("create-poll", pollData);
//   };

//   const endPoll = () => {
//     socket.emit("end-poll");
//   };

//   const removeStudent = (studentId) => {
//     socket.emit("remove-student", { studentId });
//   };

//   if (!connected) {
//     return (
//       <div className="teacher-dashboard">
//         <div className="connection-status">
//           <div className="loading">Connecting to server...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="teacher-dashboard">
//       <header className="dashboard-header">
//         <h1>Teacher Dashboard</h1>
//         <div className="header-controls">
//           <div className="connection-indicator connected">
//             <span className="indicator-dot"></span>
//             Connected ({students.length} students)
//           </div>
//           <button
//             className="chat-toggle"
//             onClick={() => setShowChat(!showChat)}
//           >
//             💬 Chat
//           </button>
//         </div>
//       </header>

//       <nav className="dashboard-nav">
//         <button
//           className={`nav-tab ${activeTab === "create" ? "active" : ""}`}
//           onClick={() => setActiveTab("create")}
//         >
//           Create Poll
//         </button>
//         <button
//           className={`nav-tab ${activeTab === "results" ? "active" : ""}`}
//           onClick={() => setActiveTab("results")}
//         >
//           Live Results
//         </button>
//         <button
//           className={`nav-tab ${activeTab === "students" ? "active" : ""}`}
//           onClick={() => setActiveTab("students")}
//         >
//           Students ({students.length})
//         </button>
//         <button
//           className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
//           onClick={() => setActiveTab("history")}
//         >
//           History
//         </button>
//       </nav>

//       <main className="dashboard-content">
//         {activeTab === "create" && (
//           <PollCreator
//             onCreatePoll={createPoll}
//             currentPoll={currentPoll}
//             studentsCount={students.length}
//           />
//         )}

//         {activeTab === "results" && (
//           <PollResults
//             poll={currentPoll}
//             students={students}
//             votes={votes}
//             onEndPoll={endPoll}
//           />
//         )}

//         {activeTab === "students" && (
//           <StudentsList students={students} onRemoveStudent={removeStudent} />
//         )}

//         {activeTab === "history" && <PollHistory history={pollHistory} />}
//       </main>

//       {showChat && (
//         <ChatPanel role="teacher" onClose={() => setShowChat(false)} />
//       )}
//     </div>
//   );
// };

// export default TeacherDashboard;

import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import PollCreator from "./PollCreator";
import PollResults from "./PollResults";
import StudentsList from "./StudentsList";
import PollHistory from "./PollHistory";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const { pollService, connected } = useSocket();
  const [currentPoll, setCurrentPoll] = useState(pollService.getCurrentPoll());
  const [students, setStudents] = useState(pollService.getStudents());
  const [votes, setVotes] = useState(pollService.getVotes());
  const [pollHistory, setPollHistory] = useState(pollService.getPollHistory());
  const [activeTab, setActiveTab] = useState("create");

  
  useEffect(() => {
    const refreshData = () => {
      setCurrentPoll(pollService.getCurrentPoll());
      setStudents(pollService.getStudents());
      setVotes(pollService.getVotes());
      setPollHistory(pollService.getPollHistory());
    };

    // Refresh every 2 seconds to simulate real-time updates
    const interval = setInterval(refreshData, 2000);

    return () => clearInterval(interval);
  }, [pollService]);

  const createPoll = (pollData) => {
    const poll = pollService.createPoll(pollData);
    setCurrentPoll(poll);
    setStudents(pollService.getStudents());
    setActiveTab("results");
  };

  const endPoll = () => {
    pollService.endPoll();
    setCurrentPoll(null);
    setPollHistory(pollService.getPollHistory());
  };

  const removeStudent = (studentId) => {
    pollService.removeStudent(studentId);
    setStudents(pollService.getStudents());
  };

  const refreshResults = () => {
    setCurrentPoll(pollService.getCurrentPoll());
    setVotes(pollService.getVotes());
    setStudents(pollService.getStudents());
  };

  if (!connected) {
    return (
      <div className="teacher-dashboard">
        <div className="connection-status">
          <div className="loading">Loading polling system...</div>
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
            Local Mode ({students.length} students)
          </div>
          <button
            className="refresh-btn"
            onClick={refreshResults}
            title="Refresh data"
          >
            🔄 Refresh
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
            votes={votes}
            onEndPoll={endPoll}
            onRefresh={refreshResults}
          />
        )}

        {activeTab === "students" && (
          <StudentsList
            students={students}
            onRemoveStudent={removeStudent}
            onRefresh={refreshResults}
          />
        )}

        {activeTab === "history" && (
          <PollHistory
            history={pollHistory}
            onRefresh={() => setPollHistory(pollService.getPollHistory())}
          />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
