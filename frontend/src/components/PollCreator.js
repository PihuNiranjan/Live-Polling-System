import React, { useState } from "react";
import "./PollCreator.css";

const PollCreator = ({ onCreatePoll, currentPoll, studentsCount }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timeLimit, setTimeLimit] = useState(60);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    onCreatePoll({
      question: question.trim(),
      options: validOptions,
      timeLimit,
    });

    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setTimeLimit(60);
  };

  const canCreatePoll = !currentPoll || !currentPoll.isActive;

  return (
    <div className="poll-creator">
      <div className="creator-header">
        <h2>Create New Poll</h2>
        <div className="students-info">Connected Students: {studentsCount}</div>
      </div>

      {!canCreatePoll && (
        <div className="poll-active-notice">
          <p>
            ⚠️ A poll is currently active. You can create a new poll when all
            students have voted or the current poll ends.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label htmlFor="question">Poll Question *</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question here..."
            rows={3}
            disabled={!canCreatePoll}
          />
        </div>

        <div className="form-group">
          <label>Answer Options *</label>
          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={!canCreatePoll}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-option"
                    disabled={!canCreatePoll}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="add-option"
              disabled={!canCreatePoll}
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="timeLimit">Time Limit (seconds)</label>
          <select
            id="timeLimit"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            disabled={!canCreatePoll}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={120}>2 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>

        <button
          type="submit"
          className="create-poll-btn"
          disabled={!canCreatePoll}
        >
          Create Poll
        </button>
      </form>
    </div>
  );
};

export default PollCreator;
