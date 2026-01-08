import { Routes, Route } from "react-router-dom";

import AuthDashboard from "./pages/auth/AuthDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import SchedulerDashboard from "./pages/SchedulerDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import Report from "./pages/Report";
function App() {
  return (
    
      <Routes>
        <Route path="/" element={<AuthDashboard />} />
        
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        
        <Route path="/patient/report/:appointmentId" element={<Report />} />
        <Route path="/scheduler/dashboard" element={<SchedulerDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
      </Routes>
    
  );
}

export default App;
