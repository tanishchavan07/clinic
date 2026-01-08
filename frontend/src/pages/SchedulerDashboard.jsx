import React, { useState, useEffect } from 'react';

import { getToken, removeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
const SchedulerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [showProfile, setShowProfile] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchPendingAppointments();
    } else if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'reports') {
      fetchReportTypes();
    }
  }, [activeTab]);

  const fetchPendingAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5000/scheduler/pending', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setPendingAppointments(data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/scheduler/patients', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setPatients(data.patients);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const res = await fetch('http://localhost:5000/scheduler/report-types', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setReportTypes(data.reportTypes);
    } catch (err) {
      console.error('Error fetching report types:', err);
    }
  };

  const handleUpdateStatus = async (appointmentId, action) => {
    try {
      const res = await fetch('http://localhost:5000/scheduler/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ appointmentId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPendingAppointments();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      const res = await fetch(`http://localhost:5000/scheduler/patient/${patientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPatients();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting patient');
    }
  };

  const handleViewPatientAppointments = async (patientEmail) => {
    try {
      const res = await fetch(`http://localhost:5000/scheduler/patient/${patientEmail}/appointments`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setPatientAppointments(data.appointments);
        setSelectedPatient(patientEmail);
      }
    } catch (err) {
      alert('Error fetching patient appointments');
    }
  };

  const handleViewReports = async (type) => {
    try {
      const res = await fetch(`http://localhost:5000/scheduler/reports/${type}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
        setSelectedReportType(type);
      }
    } catch (err) {
      alert('Error fetching reports');
    }
  };

  const handleViewSingleReport = async (appointmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/patient/report/${appointmentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/patient/report/${appointmentId}`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error fetching report');
    }
  };

  const filteredAppointments = pendingAppointments.filter(apt =>
    apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReportTypes = reportTypes.filter(type =>
    type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { background: #f5f7fa; }
        .dashboard-container { display: flex; min-height: 100vh; }
        .sidebar { width: 280px; background: linear-gradient(180deg, #00d4aa 0%, #00b894 100%); padding: 30px 20px; box-shadow: 4px 0 10px rgba(0,0,0,0.1); }
        .logo-container { text-align: center; margin-bottom: 40px; }
        .logo-icon { width: 100px; height: 100px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .logo { font-size: 32px; font-weight: 800; color: #fff; }
        .logo span { color: #ffd93d; }
        .nav-menu { display: flex; flex-direction: column; gap: 12px; }
        .nav-item { display: flex; align-items: center; gap: 15px; padding: 15px 20px; background: rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; }
        .nav-item:hover { background: rgba(255,255,255,0.2); transform: translateX(5px); }
        .nav-item.active { background: #fff; color: #00b894; border: 2px solid #00b894; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .main-content { flex: 1; padding: 40px; overflow-y: auto; position: relative; }
        .profile-icon { position: absolute; top: 20px; right: 40px; width: 50px; height: 50px; background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,180,148,0.3); transition: all 0.3s; }
        .profile-icon:hover { transform: scale(1.1); }
        .content-section { max-width: 1200px; margin: 0 auto; padding-top: 60px; }
        .page-title { font-size: 36px; color: #2d3748; margin-bottom: 30px; padding-left: 15px; border-left: 5px solid #00b894; }
        .search-bar { width: 100%; padding: 14px 18px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; margin-bottom: 24px; background: #fff; transition: all 0.3s; }
        .search-bar:focus { outline: none; border-color: #00b894; box-shadow: 0 0 0 3px rgba(0,180,148,0.1); }
        .empty-state { background: #fff; border-radius: 20px; padding: 60px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .empty-state p { font-size: 18px; color: #718096; }
        .appointments-grid { display: grid; gap: 20px; }
        .appointment-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: all 0.3s; display: flex; justify-content: space-between; align-items: center; }
        .appointment-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
        .apt-info h3 { color: #00b894; font-size: 20px; margin-bottom: 8px; }
        .apt-info p { margin-bottom: 6px; color: #4a5568; font-size: 14px; }
        .apt-actions { display: flex; gap: 10px; }
        .accept-btn, .reject-btn { padding: 10px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 6px; }
        .accept-btn { background: #00b894; color: #fff; }
        .accept-btn:hover { background: #00a080; }
        .reject-btn { background: #fc8181; color: #fff; }
        .reject-btn:hover { background: #f56565; }
        .table-container { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .table { width: 100%; border-collapse: collapse; }
        .table thead { background: #00b894; color: #fff; }
        .table th { padding: 16px; text-align: left; font-weight: 600; font-size: 14px; }
        .table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px; }
        .table tbody tr:hover { background: #f7fafc; }
        .action-icons { display: flex; gap: 12px; }
        .icon-btn { background: none; border: none; cursor: pointer; font-size: 18px; transition: all 0.3s; padding: 4px; }
        .icon-btn:hover { transform: scale(1.2); }
        .view-icon { color: #4299e1; }
        .delete-icon { color: #fc8181; }
        .report-list { display: grid; gap: 16px; }
        .report-item { background: #fff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; cursor: pointer; }
        .report-item:hover { transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .report-name { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 600; color: #00b894; }
        .view-btn { padding: 8px 20px; background: #00b894; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .view-btn:hover { background: #00a080; }
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #fff; border-radius: 20px; padding: 40px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h3 { color: #2d3748; font-size: 24px; }
        .close-btn { background: #e2e8f0; color: #4a5568; padding: 8px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .close-btn:hover { background: #cbd5e0; }
        .back-btn { background: #00b894; color: #fff; padding: 10px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-bottom: 20px; }
        .back-btn:hover { background: #00a080; }
        @media (max-width: 968px) {
          .dashboard-container { flex-direction: column; }
          .sidebar { width: 100%; padding: 20px; }
          .nav-menu { flex-direction: row; overflow-x: auto; }
          .nav-item { min-width: 200px; }
        }
      `}</style>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="logo-container">
            <div className="logo-icon">🏥</div>
            <div className="logo"><span>SAI</span> Clinic</div>
          </div>
          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => { setActiveTab('appointments'); setSearchQuery(''); }}>
              <span>📋</span> Appointments
            </div>
            <div className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => { setActiveTab('patients'); setSearchQuery(''); setSelectedPatient(null); }}>
              <span>👥</span> Patient List
            </div>
            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setSearchQuery(''); setSelectedReportType(null); }}>
              <span>📊</span> View Reports
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <div className="profile-icon" onClick={() => setShowProfile(true)}>👤</div>

          {activeTab === 'appointments' && (
            <div className="content-section">
              <h2 className="page-title">Patient Appointments</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredAppointments.length === 0 ? (
                <div className="empty-state"><p>No pending appointments</p></div>
              ) : (
                <div className="appointments-grid">
                  {filteredAppointments.map((apt) => (
                    <div key={apt._id} className="appointment-card">
                      <div className="apt-info">
                        <h3>{apt.patientName}</h3>
                        <p><strong>Time:</strong> {apt.appointmentTime}</p>
                        <p><strong>Date:</strong> {new Date(apt.createdAt).toLocaleDateString()}</p>
                        <p><strong>Email:</strong> {apt.patientEmail}</p>
                      </div>
                      <div className="apt-actions">
                        <button className="accept-btn" onClick={() => handleUpdateStatus(apt._id, 'approve')}>
                          ✓ Accept
                        </button>
                        <button className="reject-btn" onClick={() => handleUpdateStatus(apt._id, 'reject')}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && !selectedPatient && (
            <div className="content-section">
              <h2 className="page-title">Patient List</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search patient by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredPatients.length === 0 ? (
                <div className="empty-state"><p>No patients found</p></div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient, idx) => (
                        <tr key={patient._id} style={{ cursor: 'pointer' }} onClick={() => handleViewPatientAppointments(patient.email)}>
                          <td>P{String(idx + 1).padStart(3, '0')}</td>
                          <td>{patient.name}</td>
                          <td>{patient.age}</td>
                          <td>{patient.gender}</td>
                          <td>{patient.phone}</td>
                          <td className="action-icons" onClick={(e) => e.stopPropagation()}>
                            <button className="icon-btn delete-icon" onClick={() => handleDeletePatient(patient._id)} title="Delete Patient">
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && selectedPatient && (
            <div className="content-section">
              <button className="back-btn" onClick={() => setSelectedPatient(null)}>← Back to Patient List</button>
              <h2 className="page-title">Patient Appointments</h2>
              {patientAppointments.length === 0 ? (
                <div className="empty-state"><p>No appointments found</p></div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientAppointments.map((apt) => (
                        <tr key={apt._id}>
                          <td>{apt.patientName}</td>
                          <td>
                            <span style={{ 
                              color: apt.status === 'Approved' ? '#00b894' : apt.status === 'Reported' ? '#2196f3' : '#0284c7', 
                              fontWeight: '600',
                              padding: '4px 12px',
                              background: apt.status === 'Approved' ? '#e6fffa' : apt.status === 'Reported' ? '#e3f2fd' : '#f0f9ff',
                              borderRadius: '12px',
                              display: 'inline-block'
                            }}>
                              {apt.status}
                            </span>
                          </td>
                          <td>{apt.appointmentTime}</td>
                          <td>{apt.address}</td>
                          <td>
                            {apt.status === 'Reported' || apt.status === 'Paid' ? (
                              <button 
                                className="view-btn" 
                                style={{ padding: '6px 16px', fontSize: '13px' }}
                                onClick={() => handleViewSingleReport(apt._id)}
                              >
                                View Report
                              </button>
                            ) : (
                              <span style={{ color: '#a0aec0', fontSize: '13px' }}>No Report</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && !selectedReportType && (
            <div className="content-section">
              <h2 className="page-title">Available Reports</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search report type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredReportTypes.length === 0 ? (
                <div className="empty-state"><p>No report types available</p></div>
              ) : (
                <div className="report-list">
                  {filteredReportTypes.map((type, idx) => (
                    <div key={idx} className="report-item" onClick={() => handleViewReports(type)}>
                      <div className="report-name">
                        <span>{['🦷', '🤒', '🩻', '🫁', '💉', '🧠'][idx % 6]}</span>
                        {type}
                      </div>
                      <button className="view-btn">View</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && selectedReportType && !selectedReport && (
            <div className="content-section">
              <button className="back-btn" onClick={() => setSelectedReportType(null)}>← Back to Report Types</button>
              <h2 className="page-title">{selectedReportType} Reports</h2>
              {reports.length === 0 ? (
                <div className="empty-state"><p>No reports found</p></div>
              ) : (
                <div className="appointments-grid">
                  {reports.map((report) => (
                    <div 
                      key={report._id} 
                      className="appointment-card" 
                      style={{ display: 'block', cursor: 'pointer' }}
                      onClick={() => handleViewSingleReport(report.appointmentId)}
                    >
                      <div className="apt-info">
                        <h3 style={{ color: '#00b894', marginBottom: '12px' }}>Report - {report.appointmentId?.slice(-6) || 'N/A'}</h3>
                        <p><strong>Patient Name:</strong> {report.patientName || 'N/A'}</p>
                        <p><strong>Patient Email:</strong> {report.patientEmail || 'N/A'}</p>
                        <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                        <p style={{ color: '#00b894', fontWeight: '600', marginTop: '12px' }}>Click to view details →</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && selectedReport && (
            <div className="content-section">
              <button className="back-btn" onClick={() => setSelectedReport(null)}>← Back to Reports</button>
              <h2 className="page-title">Report Details</h2>
              <div className="appointment-card" style={{ display: 'block', maxWidth: '800px', margin: '0 auto' }}>
                <div className="apt-info">
                  <h3 style={{ color: '#00b894', marginBottom: '20px', fontSize: '24px' }}>Medical Report</h3>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Patient Name:</strong> {selectedReport.patientName || 'N/A'}</p>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Patient Email:</strong> {selectedReport.patientEmail || 'N/A'}</p>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Patient Phone:</strong> {selectedReport.patientPhone || 'N/A'}</p>
                  <hr style={{ margin: '20px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Diagnosis:</strong> {selectedReport.diagnosis}</p>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Prescription:</strong> {selectedReport.prescription}</p>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Notes:</strong> {selectedReport.notes}</p>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Report Type:</strong> {selectedReport.reportType || 'N/A'}</p>
                  <p style={{ marginBottom: '14px', fontSize: '16px' }}><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showProfile && (
        <div className="modal" onClick={() => setShowProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Scheduler Profile</h3>
              <button className="close-btn" onClick={() => setShowProfile(false)}>Close</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Role:</strong> Scheduler</p>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Email:</strong> scheduler@saiclinic.com</p>
            </div>
            <button 
              style={{ width: '100%', padding: '14px', background: '#fc8181', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
              onClick={() => { removeToken(); window.location.href = '/'; }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SchedulerDashboard;