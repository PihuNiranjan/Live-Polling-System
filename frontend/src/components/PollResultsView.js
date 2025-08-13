import React from "react";
import { Bar } from "react-chartjs-2";
import "./PollResultsView.css";

const PollResultsView = ({ poll }) => {
  if (!poll) return null;

  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const chartData = {
    labels: poll.options.map((option) => option.text),
    datasets: [
      {
        label: "Votes",
        data: poll.options.map((option) => option.votes),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
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
    <div className="poll-results-view">
      <div className="results-header">
        <h2>Poll Results</h2>
        <div className={`poll-status ${poll.isActive ? "active" : "ended"}`}>
          {poll.isActive ? "Live Results" : "Final Results"}
        </div>
      </div>

      <div className="poll-question">
        <h3>{poll.question}</h3>
      </div>

      <div className="total-votes">Total Votes: {totalVotes}</div>

      {totalVotes > 0 ? (
        <>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="results-breakdown">
            {poll.options.map((option, index) => (
              <div key={index} className="result-row">
                <div className="option-name">{option.text}</div>
                <div className="vote-info">
                  <span className="vote-count">{option.votes}</span>
                  <span className="vote-percentage">
                    (
                    {totalVotes > 0
                      ? Math.round((option.votes / totalVotes) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="result-bar">
                  <div
                    className="result-fill"
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
        </>
      ) : (
        <div className="no-results">
          <p>No votes have been cast yet.</p>
          {poll.isActive && (
            <p>Results will update in real-time as votes are submitted.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PollResultsView;
