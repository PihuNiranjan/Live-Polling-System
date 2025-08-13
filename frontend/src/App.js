import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentInterface from "./components/StudentInterface";
import LandingPage from "./components/LandingPage";
import { SocketProvider } from "./context/SocketContext";
import "./App.css";

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentInterface />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;