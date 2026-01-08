import React, { useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/auth';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [showProfile, setShowProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [reportData, setReportData] = useState({
    disease: '',
    symptoms: '',
    medicines: [{ name: '', dosage: '', timing: '' }],
    doctorNotes: '',
    fees: '',
    reportType: '',
    reportDate: ''
  });

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5000/doctor/appointments', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleMakeReport = (appointment) => {
    setSelectedAppointment(appointment);
    setReportData({
      disease: '',
      symptoms: '',
      medicines: [{ name: '', dosage: '', timing: '' }],
      doctorNotes: '',
      fees: '',
      reportType: '',
      reportDate: new Date().toISOString().split('T')[0]
    });
    setShowReportForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch('http://localhost:5000/doctor/cancel-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ appointmentId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAppointments();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error cancelling appointment');
    }
  };

  const handleAddMedicine = () => {
    setReportData({
      ...reportData,
      medicines: [...reportData.medicines, { name: '', dosage: '', timing: '' }]
    });
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = reportData.medicines.filter((_, i) => i !== index);
    setReportData({ ...reportData, medicines: newMedicines });
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...reportData.medicines];
    newMedicines[index][field] = value;
    setReportData({ ...reportData, medicines: newMedicines });
  };

  const handleSubmitReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!reportData.disease || !reportData.fees || !reportData.reportType || !reportData.reportDate) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/doctor/make-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          ...reportData
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowReportForm(false);
          setSelectedAppointment(null);
          fetchAppointments();
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error creating report');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
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
        .table-container { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .table { width: 100%; border-collapse: collapse; }
        .table thead { background: #00b894; color: #fff; }
        .table th { padding: 16px; text-align: left; font-weight: 600; font-size: 14px; }
        .table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px; }
        .table tbody tr:hover { background: #f7fafc; }
        .action-btns { display: flex; gap: 8px; }
        .report-btn, .cancel-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .report-btn { background: #00b894; color: #fff; }
        .report-btn:hover { background: #00a080; }
        .cancel-btn { background: #fc8181; color: #fff; }
        .cancel-btn:hover { background: #f56565; }
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #fff; border-radius: 20px; padding: 40px; max-width: 800px; width: 90%; max-height: 85vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h3 { color: #2d3748; font-size: 24px; }
        .close-icon { background: none; border: none; font-size: 24px; cursor: pointer; color: #718096; }
        .close-icon:hover { color: #2d3748; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px; }
        .form-group label .required { color: #fc8181; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: all 0.3s; background: #f8fafc; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #00b894; background: #fff; }
        .form-group textarea { min-height: 100px; resize: vertical; }
        .medicine-section { margin-bottom: 24px; }
        .medicine-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .medicine-header h4 { color: #2d3748; font-size: 18px; }
        .add-medicine-btn { padding: 8px 16px; background: #4299e1; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .add-medicine-btn:hover { background: #3182ce; }
        .medicine-item { background: #f7fafc; padding: 16px; border-radius: 12px; margin-bottom: 12px; position: relative; }
        .medicine-item .remove-btn { position: absolute; top: 12px; right: 12px; background: #fc8181; color: #fff; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .medicine-item .remove-btn:hover { background: #f56565; }
        .medicine-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .alert { padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; font-weight: 500; }
        .alert-error { background: #fee; color: #c53030; border: 2px solid #fc8181; }
        .alert-success { background: #e6fffa; color: #00b894; border: 2px solid #00d4aa; }
        .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .submit-btn, .close-btn { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .submit-btn { background: #00b894; color: #fff; }
        .submit-btn:hover { background: #00a080; }
        .submit-btn:disabled { background: #cbd5e0; cursor: not-allowed; }
        .close-btn { background: #e2e8f0; color: #4a5568; }
        .close-btn:hover { background: #cbd5e0; }
        @media (max-width: 968px) {
          .dashboard-container { flex-direction: column; }
          .sidebar { width: 100%; padding: 20px; }
          .nav-menu { flex-direction: row; overflow-x: auto; }
          .nav-item { min-width: 200px; }
          .form-grid { grid-template-columns: 1fr; }
          .medicine-inputs { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="logo-container">
            <div className="logo-icon">👨‍⚕️</div>
            <div className="logo"><span>SAI</span> Clinic</div>
          </div>
          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => { setActiveTab('appointments'); setSearchQuery(''); }}>
              <span>📋</span> Appointments
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <div className="profile-icon" onClick={() => setShowProfile(true)}>👤</div>

          {activeTab === 'appointments' && (
            <div className="content-section">
              <h2 className="page-title">Approved Appointments</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredAppointments.length === 0 ? (
                <div className="empty-state"><p>No approved appointments</p></div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Age</th>
                        <th>Email</th>
                        <th>Time</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => (
                        <tr key={apt._id}>
                          <td>{apt.patientName}</td>
                          <td>{apt.age}</td>
                          <td>{apt.patientEmail}</td>
                          <td>{apt.appointmentTime}</td>
                          <td>{apt.address}</td>
                          <td>
                            <div className="action-btns">
                              <button className="report-btn" onClick={() => handleMakeReport(apt)}>
                                Make Report
                              </button>
                              <button className="cancel-btn" onClick={() => handleCancelAppointment(apt._id)}>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showReportForm && selectedAppointment && (
        <div className="modal" onClick={() => setShowReportForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Medical Report</h3>
              <button className="close-icon" onClick={() => setShowReportForm(false)}>×</button>
            </div>

            <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ marginBottom: '8px', color: '#4a5568' }}><strong>Patient:</strong> {selectedAppointment.patientName}</p>
              <p style={{ marginBottom: '8px', color: '#4a5568' }}><strong>Age:</strong> {selectedAppointment.age}</p>
              <p style={{ color: '#4a5568' }}><strong>Email:</strong> {selectedAppointment.patientEmail}</p>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}
            {success && <div className="alert alert-success">✓ {success}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Disease <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Fever, Malaria"
                  value={reportData.disease}
                  onChange={(e) => setReportData({ ...reportData, disease: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Report Type <span className="required">*</span></label>
                <select
                  value={reportData.reportType}
                  onChange={(e) => setReportData({ ...reportData, reportType: e.target.value })}
                >
                  <option value="">Select Report Type</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="OPD">OPD</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Dental Report">Dental Report</option>
                  <option value="Fever Report">Fever Report</option>
                  <option value="Radiology Report">Radiology Report</option>
                  <option value="Chest X-Ray Report">Chest X-Ray Report</option>
                  <option value="Neurology Report">Neurology Report</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fees <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="e.g., 500"
                  value={reportData.fees}
                  onChange={(e) => setReportData({ ...reportData, fees: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Report Date <span className="required">*</span></label>
                <input
                  type="date"
                  value={reportData.reportDate}
                  onChange={(e) => setReportData({ ...reportData, reportDate: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Symptoms</label>
                <textarea
                  placeholder="Describe symptoms..."
                  value={reportData.symptoms}
                  onChange={(e) => setReportData({ ...reportData, symptoms: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Doctor Notes</label>
                <textarea
                  placeholder="Additional notes..."
                  value={reportData.doctorNotes}
                  onChange={(e) => setReportData({ ...reportData, doctorNotes: e.target.value })}
                />
              </div>
            </div>

            <div className="medicine-section">
              <div className="medicine-header">
                <h4>Medicines</h4>
                <button className="add-medicine-btn" onClick={handleAddMedicine}>
                  + Add Medicine
                </button>
              </div>

              {reportData.medicines.map((medicine, index) => (
                <div key={index} className="medicine-item">
                  {reportData.medicines.length > 1 && (
                    <button className="remove-btn" onClick={() => handleRemoveMedicine(index)}>×</button>
                  )}
                  <div className="medicine-inputs">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Medicine Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Paracetamol"
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Timing</label>
                      <input
                        type="text"
                        placeholder="e.g., After meals"
                        value={medicine.timing}
                        onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="submit-btn" onClick={handleSubmitReport} disabled={loading}>
                {loading ? 'Creating Report...' : 'Create Report'}
              </button>
              <button className="close-btn" onClick={() => setShowReportForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal" onClick={() => setShowProfile(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Doctor Profile</h3>
              <button className="close-icon" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Name:</strong> Dr. Sai Sharma</p>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Role:</strong> Doctor</p>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Email:</strong> doctor@saiclinic.com</p>
            </div>
            <button 
              style={{ width: '100%', padding: '14px', background: '#d12d2dff', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
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

export default DoctorDashboard;