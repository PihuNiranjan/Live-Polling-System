import React, { useState } from "react";
import "./PollVoting.css";

const PollVoting = ({ poll, timeRemaining, onSubmitVote, hasVoted }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null) {
      alert("Please select an option");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitVote(selectedOption);
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="poll-voting voted">
        <div className="voted-message">
          <div className="check-icon">✓</div>
          <h2>Vote Submitted!</h2>
          <p>
            Thank you for participating. Results will be shown when the poll
            ends.
          </p>
        </div>
      </div>
    );
  }

  if (timeRemaining <= 0) {
    return (
      <div className="poll-voting expired">
        <div className="expired-message">
          <div className="time-icon">⏰</div>
          <h2>Time's Up!</h2>
          <p>The voting period has ended. Results will be shown shortly.</p>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="poll-voting">
      <div className="voting-header">
        <div className="timer">
          <div className="timer-display">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
          <div className="timer-label">Time Remaining</div>
        </div>
      </div>

      <div className="poll-question">
        <h2>{poll.question}</h2>
      </div>

      <div className="voting-options">
        {poll.options.map((option, index) => (
          <div
            key={index}
            className={`option-card ${
              selectedOption === index ? "selected" : ""
            }`}
            onClick={() => setSelectedOption(index)}
          >
            <div className="option-radio">
              <input
                type="radio"
                id={`option-${index}`}
                name="poll-option"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
              />
            </div>
            <label htmlFor={`option-${index}`} className="option-label">
              {option.text}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="submit-vote-btn"
        disabled={selectedOption === null || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Vote"}
      </button>

      <div className="voting-progress">
        <div
          className="progress-bar"
          style={{
            width: `${
              ((poll.timeLimit - timeRemaining) / poll.timeLimit) * 100
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default PollVoting;
