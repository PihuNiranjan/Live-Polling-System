import React from "react";
import "./StudentsList.css";

const StudentsList = ({ students, onRemoveStudent }) => {
  if (students.length === 0) {
    return (
      <div className="students-list">
        <div className="list-header">
          <h2>Connected Students</h2>
        </div>
        <div className="no-students">
          <p>No students connected yet</p>
          <p>Students will appear here when they join the poll</p>
        </div>
      </div>
    );
  }

  const formatJoinTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="students-list">
      <div className="list-header">
        <h2>Connected Students ({students.length})</h2>
        <div className="list-stats">
          <span>Voted: {students.filter((s) => s.hasVoted).length}</span>
          <span>Waiting: {students.filter((s) => !s.hasVoted).length}</span>
        </div>
      </div>

      <div className="students-grid">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            <div className="student-info">
              <div className="student-name">{student.name}</div>
              <div className="student-meta">
                <span className="join-time">
                  Joined: {formatJoinTime(student.joinedAt)}
                </span>
                <span
                  className={`vote-status ${
                    student.hasVoted ? "voted" : "waiting"
                  }`}
                >
                  {student.hasVoted ? "✓ Voted" : "⏳ Waiting"}
                </span>
              </div>
            </div>
            <div className="student-actions">
              <button
                onClick={() => onRemoveStudent(student.id)}
                className="remove-btn"
                title="Remove student"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsList;
