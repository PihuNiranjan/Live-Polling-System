// import React, { useState, useEffect } from "react";
// import { useSocket } from "../context/SocketContext";
// import StudentNameEntry from "./StudentNameEntry";
// import PollVoting from "./PollVoting";
// import PollResultsView from "./PollResultsView";
// import ChatPanel from "./ChatPanel";
// import "./StudentInterface.css";

// const StudentInterface = () => {
//   const { socket, connected } = useSocket();
//   const [studentName, setStudentName] = useState("");
//   const [hasJoined, setHasJoined] = useState(false);
//   const [currentPoll, setCurrentPoll] = useState(null);
//   const [hasVoted, setHasVoted] = useState(false);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [showResults, setShowResults] = useState(false);
//   const [showChat, setShowChat] = useState(false);

//   useEffect(() => {
//     // Check if name exists in sessionStorage
//     const savedName = sessionStorage.getItem("studentName");
//     if (savedName) {
//       setStudentName(savedName);
//       setHasJoined(true);
//       if (socket) {
//         socket.emit("join-student", { name: savedName });
//       }
//     }
//   }, [socket]);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("current-poll", (data) => {
//       setCurrentPoll(data.poll);
//       setHasVoted(data.hasVoted || false);
//       setTimeRemaining(data.timeRemaining || 0);
//       setShowResults(data.poll && (!data.poll.isActive || data.hasVoted));
//     });

//     socket.on("new-poll", (data) => {
//       setCurrentPoll(data.poll);
//       setHasVoted(false);
//       setTimeRemaining(data.timeRemaining);
//       setShowResults(false);
//     });

//     socket.on("poll-results", (data) => {
//       setCurrentPoll(data.poll);
//       if (hasVoted || !data.poll.isActive) {
//         setShowResults(true);
//       }
//     });

//     socket.on("poll-ended", (data) => {
//       setCurrentPoll(data.poll);
//       setShowResults(true);
//     });

//     socket.on("vote-recorded", (data) => {
//       setHasVoted(true);
//       setCurrentPoll(data.poll);
//       setShowResults(true);
//     });

//     socket.on("error", (error) => {
//       alert(error.message);
//     });

//     return () => {
//       socket.off("current-poll");
//       socket.off("new-poll");
//       socket.off("poll-results");
//       socket.off("poll-ended");
//       socket.off("vote-recorded");
//       socket.off("error");
//     };
//   }, [socket, hasVoted]);

//   // Timer countdown
//   useEffect(() => {
//     if (timeRemaining <= 0 || hasVoted || !currentPoll?.isActive) return;

//     const timer = setInterval(() => {
//       setTimeRemaining((prev) => {
//         if (prev <= 1) {
//           setShowResults(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeRemaining, hasVoted, currentPoll]);

//   const joinAsStudent = (name) => {
//     setStudentName(name);
//     setHasJoined(true);
//     sessionStorage.setItem("studentName", name);
//     socket.emit("join-student", { name });
//   };

//   const submitVote = (optionId) => {
//     socket.emit("submit-vote", { optionId });
//   };

//   if (!connected) {
//     return (
//       <div className="student-interface">
//         <div className="connection-status">
//           <div className="loading">Connecting to server...</div>
//         </div>
//       </div>
//     );
//   }

//   if (!hasJoined) {
//     return <StudentNameEntry onJoin={joinAsStudent} />;
//   }

//   return (
//     <div className="student-interface">
//       <header className="student-header">
//         <div className="student-info">
//           <h1>Welcome, {studentName}!</h1>
//           <div className="connection-indicator connected">
//             <span className="indicator-dot"></span>
//             Connected
//           </div>
//         </div>
//         <button className="chat-toggle" onClick={() => setShowChat(!showChat)}>
//           💬 Chat
//         </button>
//       </header>

//       <main className="student-content">
//         {!currentPoll ? (
//           <div className="waiting-state">
//             <div className="waiting-icon">⏳</div>
//             <h2>Waiting for poll...</h2>
//             <p>Your teacher will start a poll soon</p>
//           </div>
//         ) : showResults ? (
//           <PollResultsView poll={currentPoll} />
//         ) : (
//           <PollVoting
//             poll={currentPoll}
//             timeRemaining={timeRemaining}
//             onSubmitVote={submitVote}
//             hasVoted={hasVoted}
//           />
//         )}
//       </main>

//       {showChat && (
//         <ChatPanel
//           role="student"
//           studentName={studentName}
//           onClose={() => setShowChat(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default StudentInterface;

import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import StudentNameEntry from "./StudentNameEntry";
import PollVoting from "./PollVoting";
import PollResultsView from "./PollResultsView";
import "./StudentInterface.css";

const StudentInterface = () => {
  const { pollService, connected } = useSocket();
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    const savedId = sessionStorage.getItem("studentId");

    if (savedName && savedId) {
      setStudentName(savedName);
      setStudentId(savedId);
      setHasJoined(true);

      const poll = pollService.getCurrentPoll();
      const votes = pollService.getVotes();

      setCurrentPoll(poll);
      setHasVoted(votes[savedId] !== undefined);
      setShowResults(poll && (!poll.isActive || votes[savedId] !== undefined));
    }
  }, [pollService]);

  useEffect(() => {
    if (!hasJoined) return;

    const refreshData = () => {
      const poll = pollService.getCurrentPoll();
      const votes = pollService.getVotes();

      setCurrentPoll(poll);

      if (poll && studentId) {
        const voted = votes[studentId] !== undefined;
        setHasVoted(voted);
        setShowResults(poll && (!poll.isActive || voted));

        if (poll.isActive && !voted) {
          const elapsed = Math.floor(
            (Date.now() - new Date(poll.startTime)) / 1000
          );
          const remaining = Math.max(0, (poll.timeLimit || 60) - elapsed);
          setTimeRemaining(remaining);

          if (remaining === 0) {
            setShowResults(true);
          }
        }
      }
    };

    const interval = setInterval(refreshData, 1000);

    return () => clearInterval(interval);
  }, [pollService, hasJoined, studentId]);

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
    const student = pollService.addStudent(name);

    setStudentName(name);
    setStudentId(student.id);
    setHasJoined(true);

    sessionStorage.setItem("studentName", name);
    sessionStorage.setItem("studentId", student.id);

    const poll = pollService.getCurrentPoll();
    setCurrentPoll(poll);
    setShowResults(poll && !poll.isActive);
  };

  const submitVote = (optionId) => {
    if (!studentId || !currentPoll) return;

    const success = pollService.submitVote(studentId, optionId);

    if (success) {
      setHasVoted(true);
      setCurrentPoll(pollService.getCurrentPoll());
      setShowResults(true);
    } else {
      alert(
        "Unable to submit vote. You may have already voted or the poll has ended."
      );
    }
  };

  const refreshData = () => {
    const poll = pollService.getCurrentPoll();
    const votes = pollService.getVotes();

    setCurrentPoll(poll);

    if (studentId) {
      setHasVoted(votes[studentId] !== undefined);
      setShowResults(
        poll && (!poll.isActive || votes[studentId] !== undefined)
      );
    }
  };

  if (!connected) {
    return (
      <div className="student-interface">
        <div className="connection-status">
          <div className="loading">Loading polling system...</div>
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
            Local Mode
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={refreshData}
          title="Refresh data"
        >
          🔄 Refresh
        </button>
      </header>

      <main className="student-content">
        {!currentPoll ? (
          <div className="waiting-state">
            <div className="waiting-icon">⏳</div>
            <h2>Waiting for poll...</h2>
            <p>Your teacher will start a poll soon</p>
            <button className="refresh-btn" onClick={refreshData}>
              🔄 Check for polls
            </button>
          </div>
        ) : showResults ? (
          <PollResultsView poll={currentPoll} onRefresh={refreshData} />
        ) : (
          <PollVoting
            poll={currentPoll}
            timeRemaining={timeRemaining}
            onSubmitVote={submitVote}
            hasVoted={hasVoted}
          />
        )}
      </main>
    </div>
  );
};

export default StudentInterface;
