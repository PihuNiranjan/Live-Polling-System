import React, { useState } from "react";
import "./StudentNameEntry.css";

const StudentNameEntry = ({ onJoin }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (name.length < 2) {
      alert("Name must be at least 2 characters long");
      return;
    }

    if (name.length > 20) {
      alert("Name must be less than 20 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await onJoin(name.trim());
    } catch (error) {
      console.error("Error joining:", error);
      alert("Failed to join. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-name-entry">
      <div className="entry-container">
        <div className="entry-header">
          <h1>Join Live Poll</h1>
          <p>Enter your name to participate in the poll</p>
        </div>

        <form onSubmit={handleSubmit} className="name-form">
          <div className="form-group">
            <label htmlFor="studentName">Your Name</label>
            <input
              id="studentName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              maxLength={20}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="join-button"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? "Joining..." : "Join Poll"}
          </button>
        </form>

        <div className="entry-info">
          <h4>Important Notes:</h4>
          <ul>
            <li>Your name will be visible to the teacher</li>
            <li>You can only vote once per poll</li>
            <li>Polls have a time limit of 60 seconds</li>
            <li>Results are shown in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentNameEntry;
