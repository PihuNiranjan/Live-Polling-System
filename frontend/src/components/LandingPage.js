import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="header">
          <h1 className="title">Live Polling System</h1>
         
        </div>

        <div className="role-selection">
          <div
            className="role-card teacher-card"
            onClick={() => navigate("/teacher")}
          >
            <div className="role-icon">👨‍🏫</div>
            <h2>Teacher</h2>
            
            <button className="role-button teacher-button">
              Enter as Teacher
            </button>
          </div>

          <div
            className="role-card student-card"
            onClick={() => navigate("/student")}
          >
            <div className="role-icon">🎓</div>
            <h2>Student</h2>
             <button className="role-button student-button">
              Enter as Student
            </button>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default LandingPage;
