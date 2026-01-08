import React, { useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('request');
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    address: '',
    appointmentTime: ''
  });
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    createdAt: ''
  });
  
  const [profileEditData, setProfileEditData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    oldPassword: '',
    newPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [rejectedAppointments, setRejectedAppointments] = useState([]);
  const [activeAppointments, setActiveAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (activeTab === 'approved') {
      fetchApprovedAppointments();
    } else if (activeTab === 'pending') {
      fetchPendingAppointments();
    } else if (activeTab === 'rejected') {
      fetchRejectedAppointments();
    } else if (activeTab === 'bill') {
      fetchActiveAppointments();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/patient/profile', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProfileData(data.patient);
        setProfileEditData({
          name: data.patient.name,
          phone: data.patient.phone,
          age: data.patient.age,
          gender: data.patient.gender,
          oldPassword: '',
          newPassword: ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    fetchProfile();
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/';
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/patient/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(profileEditData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setIsEditingProfile(false);
        fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/patient/view-approved', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setApprovedAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error fetching approved appointments:', err);
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/patient/pending', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const pending = data.appointments.filter(apt => apt.status === 'Pending');
        setPendingAppointments(pending);
      }
    } catch (err) {
      console.error('Error fetching pending appointments:', err);
    }
  };

  const fetchRejectedAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/patient/pending', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const rejected = data.appointments.filter(apt => apt.status === 'Rejected');
        setRejectedAppointments(rejected);
      }
    } catch (err) {
      console.error('Error fetching rejected appointments:', err);
    }
  };

  const fetchActiveAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/patient/appointments/active', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setActiveAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error fetching active appointments:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/patient/history', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.appointments);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/patient/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setFormData({
          patientName: '',
          age: '',
          address: '',
          appointmentTime: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/patient/appointment/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        if (activeTab === 'approved') {
          fetchApprovedAppointments();
        } else if (activeTab === 'pending') {
          fetchPendingAppointments();
        } else if (activeTab === 'rejected') {
          fetchRejectedAppointments();
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting appointment');
    }
  };

  const handleViewBill = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/patient/bill/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedBill(data.bill);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error fetching bill');
    }
  };

  const handlePayBill = async (appointmentId) => {
    try {
      const response = await fetch('http://localhost:5000/patient/pay-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ appointmentId })
      });

      const data = await response.json();

      if (data.success) {
         navigate(`/patient/report/${appointmentId}`);
        alert(data.message);
        setSelectedBill(null);
        fetchActiveAppointments();
        fetchHistory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Payment failed');
    }
  };

  const handleViewReport = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/patient/report/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/patient/report/${appointmentId}`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error fetching report');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileInputChange = (field, value) => {
    setProfileEditData(prev => ({ ...prev, [field]: value }));
  };

  const renderRequestAppointment = () => {
    return (
      <div className="content-section">
        <h2 className="page-title">Request Appointment</h2>
        
        <div className="form-card">
          <div className="form-section">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Tanish Chavan"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="32"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="123, Main St., City, State"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Appointment Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
              />
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}
            {success && <div className="alert alert-success">✓ {success}</div>}

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>

          <div className="illustration">
            <img 
              src="https://wpamigo.com/wp-content/uploads/2025/05/48-wp-amigo-mantenimiento-web-panama.webp" 
              alt="Patient Illustration"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderApprovedAppointments = () => {
    return (
      <div className="content-section">
        <h2 className="page-title">Approved Appointments</h2>
        {approvedAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No approved appointments yet</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {approvedAppointments.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="apt-header">
                  <span className="apt-status approved">Approved</span>
                </div>
                <div className="apt-info">
                  <p><strong>Name:</strong> {apt.patientName}</p>
                  <p><strong>Age:</strong> {apt.age}</p>
                  <p><strong>Time:</strong> {apt.appointmentTime}</p>
                  <p><strong>Address:</strong> {apt.address}</p>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteAppointment(apt._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPendingAppointments = () => {
    return (
      <div className="content-section">
        <h2 className="page-title">Pending Appointments</h2>
        {pendingAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No pending appointments</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {pendingAppointments.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="apt-header">
                  <span className="apt-status pending">Pending</span>
                </div>
                <div className="apt-info">
                  <p><strong>Name:</strong> {apt.patientName}</p>
                  <p><strong>Age:</strong> {apt.age}</p>
                  <p><strong>Time:</strong> {apt.appointmentTime}</p>
                  <p><strong>Address:</strong> {apt.address}</p>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteAppointment(apt._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRejectedAppointments = () => {
    return (
      <div className="content-section">
        <h2 className="page-title">Rejected Appointments</h2>
        {rejectedAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No rejected appointments</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {rejectedAppointments.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="apt-header">
                  <span className="apt-status rejected">Rejected</span>
                </div>
                <div className="apt-info">
                  <p><strong>Name:</strong> {apt.patientName}</p>
                  <p><strong>Age:</strong> {apt.age}</p>
                  <p><strong>Time:</strong> {apt.appointmentTime}</p>
                  <p><strong>Address:</strong> {apt.address}</p>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteAppointment(apt._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBillReport = () => {
    return (
      <div className="content-section">
        <h2 className="page-title">View Bill & Report</h2>
        {activeAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No bills or reports available</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {activeAppointments.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="apt-header">
                  <span className="apt-status reported">Reported</span>
                </div>
                <div className="apt-info">
                  <p><strong>Name:</strong> {apt.patientName}</p>
                  <p><strong>Age:</strong> {apt.age}</p>
                  <p><strong>Time:</strong> {apt.appointmentTime}</p>
                </div>
                <div className="apt-actions">
                  {apt.billAvailable && (
                    <button 
                      className="action-btn"
                      onClick={() => handleViewBill(apt._id)}
                    >
                      View Bill & Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBill && (
  <div className="modal" onClick={() => setSelectedBill(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Bill Details</h3>

      <p><strong>Consultation Fees:</strong> ₹{selectedBill.consultationFees}</p>

      <h4>Medicines</h4>
      <table style={{ width: "100%", marginBottom: "15px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {selectedBill.medicines.map((med, i) => (
            <tr key={i}>
              <td>{med.name}</td>
              <td>₹{med.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p><strong>Medicines Total:</strong> ₹{selectedBill.medicinesTotal}</p>
      <p><strong>Total Amount:</strong> ₹{selectedBill.totalAmount}</p>

      <div className="modal-actions">
        {!selectedBill.paid && (
          <button
            className="pay-btn"
            onClick={() => handlePayBill(selectedBill.appointmentId)}
          >
            Pay Now
          </button>
        )}

        <button className="close-btn" onClick={() => setSelectedBill(null)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="content-section">
        <h2 className="page-title">Appointment History</h2>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No appointment history</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {history.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="apt-header">
                  <span className="apt-status paid">Paid</span>
                </div>
                <div className="apt-info">
                  <p><strong>Name:</strong> {apt.patientName}</p>
                  <p><strong>Age:</strong> {apt.age}</p>
                  <p><strong>Time:</strong> {apt.appointmentTime}</p>
                </div>
                <button 
                  className="action-btn"
                  onClick={() => handleViewReport(apt._id)}
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedReport && (
          <div className="modal" onClick={() => setSelectedReport(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Medical Report</h3>
              <div className="report-details">
                <p><strong>Diagnosis:</strong> {selectedReport.diagnosis}</p>
                <p><strong>Prescription:</strong> {selectedReport.prescription}</p>
                <p><strong>Notes:</strong> {selectedReport.notes}</p>
              </div>
              <button 
                className="close-btn"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => {
    if (!showProfile) return null;

    return (
      <div className="modal" onClick={() => setShowProfile(false)}>
        <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
          <h3>{isEditingProfile ? 'Edit Profile' : 'My Profile'}</h3>
          
          {!isEditingProfile ? (
            <>
              <div className="profile-details">
                <p><strong>Name:</strong> {profileData.name}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                <p><strong>Age:</strong> {profileData.age}</p>
                <p><strong>Gender:</strong> {profileData.gender}</p>
                <p><strong>Member Since:</strong> {new Date(profileData.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button 
                  className="close-btn"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-section">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={profileEditData.name}
                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={profileEditData.phone}
                    onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={profileEditData.age}
                    onChange={(e) => handleProfileInputChange('age', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={profileEditData.gender}
                    onChange={(e) => handleProfileInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Old Password (optional)</label>
                  <input
                    type="password"
                    value={profileEditData.oldPassword}
                    onChange={(e) => handleProfileInputChange('oldPassword', e.target.value)}
                    placeholder="Enter if changing password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password (optional)</label>
                  <input
                    type="password"
                    value={profileEditData.newPassword}
                    onChange={(e) => handleProfileInputChange('newPassword', e.target.value)}
                    placeholder="Enter if changing password"
                  />
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}
                {success && <div className="alert alert-success">✓ {success}</div>}
              </div>

              <div className="modal-actions">
                <button 
                  className="pay-btn"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background: #f5f7fa;
        }

        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #00d4aa 0%, #00b894 100%);
          padding: 30px 20px;
          box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .logo {
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 50px;
          text-align: center;
        }

        .logo span {
          color: #ffd93d;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(5px);
        }

        .nav-item.active {
          background: #fff;
          color: #00b894;
          border: 2px solid #00b894;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .nav-icon {
          font-size: 20px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .main-content {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
          position: relative;
        }

        .profile-icon {
          position: absolute;
          top: 20px;
          right: 40px;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 180, 148, 0.3);
          transition: all 0.3s;
        }

        .profile-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 180, 148, 0.4);
        }

        .content-section {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 60px;
        }

        .page-title {
          font-size: 36px;
          color: #2d3748;
          margin-bottom: 30px;
          padding-left: 15px;
          border-left: 5px solid #00b894;
        }

        .form-card {
          background: #fff;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .form-section {
          flex: 1;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #00b894;
          margin-bottom: 10px;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
          background: #f8fafc;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #00b894;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0, 180, 148, 0.1);
        }

        .alert {
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert-error {
          background: #fee;
          color: #c53030;
          border: 2px solid #fc8181;
        }

        .alert-success {
          background: #e6fffa;
          color: #00b894;
          border: 2px solid #00d4aa;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 6px 20px rgba(0, 180, 148, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 180, 148, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
          cursor: not-allowed;
          box-shadow: none;
        }

        .illustration {
          flex: 0 0 350px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .illustration img {
          width: 100%;
          max-width: 350px;
          height: auto;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
        }

        .empty-state {
          background: #fff;
          border-radius: 20px;
          padding: 60px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .empty-state p {
          font-size: 18px;
          color: #718096;
        }

        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .appointment-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .appointment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .apt-header {
          margin-bottom: 16px;
        }

        .apt-status {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .apt-status.approved {
          background: #e6fffa;
          color: #00b894;
        }

        .apt-status.pending {
          background: #fff5e6;
          color: #ff9800;
        }

        .apt-status.rejected {
          background: #fee;
          color: #c53030;
        }

        .apt-status.reported {
          background: #e8f4ff;
          color: #2196f3;
        }

        .apt-status.paid {
          background: #f0f9ff;
          color: #0284c7;
        }

        .apt-info p {
          margin-bottom: 8px;
          color: #4a5568;
          font-size: 14px;
        }

        .apt-info strong {
          color: #2d3748;
        }

        .delete-btn, .action-btn, .edit-btn, .logout-btn {
          width: 100%;
          margin-top: 16px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delete-btn {
          background: #fee;
          color: #c53030;
        }

        .delete-btn:hover {
          background: #fc8181;
          color: #fff;
        }

        .action-btn {
          background: #00b894;
          color: #fff;
        }

        .action-btn:hover {
          background: #00a080;
        }

        .edit-btn {
          background: #4299e1;
          color: #fff;
        }

        .edit-btn:hover {
          background: #3182ce;
        }

        .logout-btn {
          background: #fc8181;
          color: #fff;
        }

        .logout-btn:hover {
          background: #f56565;
        }

        .apt-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .profile-modal {
          max-width: 600px;
        }

        .modal-content h3 {
          color: #2d3748;
          margin-bottom: 24px;
          font-size: 24px;
        }

        .bill-details, .report-details, .profile-details {
          margin-bottom: 24px;
        }

        .bill-details p, .report-details p, .profile-details p {
          margin-bottom: 12px;
          color: #4a5568;
          font-size: 16px;
        }

        .bill-details strong, .report-details strong, .profile-details strong {
          color: #2d3748;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pay-btn, .close-btn {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 120px;
        }

        .pay-btn {
          background: #00b894;
          color: #fff;
        }

        .pay-btn:hover {
          background: #00a080;
        }

        .pay-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .close-btn {
          background: #e2e8f0;
          color: #4a5568;
        }

        .close-btn:hover {
          background: #cbd5e0;
        }

        @media (max-width: 968px) {
          .dashboard-container {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            padding: 20px;
          }

          .nav-menu {
            flex-direction: row;
            overflow-x: auto;
          }

          .nav-item {
            min-width: 200px;
          }

          .form-card {
            flex-direction: column;
          }

          .illustration {
            flex: 0 0 250px;
          }

          .illustration img {
            max-width: 250px;
          }

          .appointments-grid {
            grid-template-columns: 1fr;
          }

          .profile-icon {
            top: 10px;
            right: 20px;
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .content-section {
            padding-top: 80px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="logo">
            <span>SAI</span> Clinic
          </div>

          <nav className="nav-menu">
            <div 
              className={`nav-item ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
            >
              <span className="nav-icon">📋</span>
              Request Appointment
            </div>

            <div 
              className={`nav-item ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              <span className="nav-icon">✅</span>
              Approved
            </div>

            <div 
              className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <span className="nav-icon">⏳</span>
              Pending
            </div>

            <div 
              className={`nav-item ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              <span className="nav-icon">❌</span>
              Rejected
            </div>

            <div 
              className={`nav-item ${activeTab === 'bill' ? 'active' : ''}`}
              onClick={() => setActiveTab('bill')}
            >
              <span className="nav-icon">📄</span>
              View Bill & Report
            </div>

            <div 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="nav-icon">📚</span>
              History
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <div className="profile-icon" onClick={handleProfileClick}>
            👤
          </div>

          {activeTab === 'request' && renderRequestAppointment()}
          {activeTab === 'approved' && renderApprovedAppointments()}
          {activeTab === 'pending' && renderPendingAppointments()}
          {activeTab === 'rejected' && renderRejectedAppointments()}
          {activeTab === 'bill' && renderBillReport()}
          {activeTab === 'history' && renderHistory()}
        </main>
      </div>

      {renderProfile()}
    </>
  );
};

export default PatientDashboard;