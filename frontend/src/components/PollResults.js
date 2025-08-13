import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./PollResults.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PollResults = ({ poll, students, onEndPoll }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!poll || !poll.isActive) return;

    const calculateTimeRemaining = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(poll.endTime) - new Date()) / 1000)
      );
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        onEndPoll();
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [poll, onEndPoll]);

  if (!poll) {
    return (
      <div className="poll-results">
        <div className="no-poll">
          <h2>No Active Poll</h2>
          <p>Create a poll to see results here</p>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );
  const votedStudents = students.filter((student) => student.hasVoted).length;

  const chartData = {
    labels: poll.options.map((option) => option.text),
    datasets: [
      {
        label: "Votes",
        data: poll.options.map((option) => option.votes),
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="poll-results">
      <div className="poll-header">
        <h2>Poll Results</h2>
        {poll.isActive && (
          <div className="poll-controls">
            <div className="time-remaining">
              Time Remaining: {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, "0")}
            </div>
            <button onClick={onEndPoll} className="end-poll-btn">
              End Poll Now
            </button>
          </div>
        )}
      </div>

      <div className="poll-question">
        <h3>{poll.question}</h3>
      </div>

      <div className="results-summary">
        <div className="summary-item">
          <span className="summary-label">Total Responses:</span>
          <span className="summary-value">{totalVotes}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Students Voted:</span>
          <span className="summary-value">
            {votedStudents}/{students.length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Response Rate:</span>
          <span className="summary-value">
            {students.length > 0
              ? Math.round((votedStudents / students.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      {totalVotes > 0 ? (
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-votes">
          <p>No votes yet. Waiting for student responses...</p>
        </div>
      )}

      <div className="detailed-results">
        {poll.options.map((option, index) => (
          <div key={index} className="result-item">
            <div className="option-text">{option.text}</div>
            <div className="vote-stats">
              <div className="vote-count">{option.votes} votes</div>
              <div className="vote-percentage">
                {totalVotes > 0
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width:
                    totalVotes > 0
                      ? `${(option.votes / totalVotes) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollResults;
