import React, { useState } from "react";
import "./PollHistory.css";

const PollHistory = ({ history }) => {
  const [expandedPoll, setExpandedPoll] = useState(null);

  if (history.length === 0) {
    return (
      <div className="poll-history">
        <div className="history-header">
          <h2>Poll History</h2>
        </div>
        <div className="no-history">
          <p>No poll history available</p>
          <p>Completed polls will appear here</p>
        </div>
      </div>
    );
  }

  const toggleExpanded = (pollId) => {
    setExpandedPoll(expandedPoll === pollId ? null : pollId);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="poll-history">
      <div className="history-header">
        <h2>Poll History</h2>
        <div className="history-stats">Total Polls: {history.length}</div>
      </div>

      <div className="history-list">
        {history.map((pollData, index) => (
          <div key={pollData.poll.id || index} className="history-item">
            <div
              className="history-summary"
              onClick={() => toggleExpanded(pollData.poll.id || index)}
            >
              <div className="poll-info">
                <h3 className="poll-question">{pollData.poll.question}</h3>
                <div className="poll-meta">
                  <span>Ended: {formatDate(pollData.endedAt)}</span>
                  <span>Responses: {pollData.totalVotes}</span>
                  <span>Students: {pollData.studentsCount}</span>
                </div>
              </div>
              <div className="expand-icon">
                {expandedPoll === (pollData.poll.id || index) ? "▼" : "▶"}
              </div>
            </div>

            {expandedPoll === (pollData.poll.id || index) && (
              <div className="history-details">
                <div className="results-breakdown">
                  {pollData.results.map((result, idx) => (
                    <div key={idx} className="result-item">
                      <div className="option-text">{result.text}</div>
                      <div className="vote-stats">
                        <span className="vote-count">{result.votes} votes</span>
                        <span className="vote-percentage">
                          ({result.percentage}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollHistory;
