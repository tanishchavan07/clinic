import React, { useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/auth';


const ReceptionistDashboard = () => {
  //const [token] = useState('demo-token'); // Store token in state instead of localStorage
  const [activeTab, setActiveTab] = useState('appointments');
  const [showProfile, setShowProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [medicinePrices, setMedicinePrices] = useState([]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'pending') {
      fetchPendingPayments();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5000/receptionist/appointments', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments. Make sure the backend is running.');
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch('http://localhost:5000/receptionist/Unpaid', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setPendingPayments(data.appointments);
    } catch (err) {
      console.error('Error fetching pending payments:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/receptionist/history', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setHistory(data.appointments);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchReport = async (appointmentId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/receptionist/get-report-for-billing/${appointmentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      
      if (data.success && data.report) {
        setReportData(data.report);
        // Initialize medicine prices
        const prices = data.report.medicines.map(med => ({
          name: med.name,
          price: 0
        }));
        setMedicinePrices(prices);
      } else {
        setError(data.message || 'Failed to fetch report. The doctor may not have submitted a report yet.');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Error fetching report. Please make sure the backend is running and the appointment has a report.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeBill = (appointment) => {
    setSelectedAppointment(appointment);
    setShowBillForm(true);
    setError('');
    setSuccess('');
    setReportData(null);
    setMedicinePrices([]);
    // Fetch report after modal opens
    fetchReport(appointment._id);
  };

  const handlePriceChange = (index, value) => {
    const newPrices = [...medicinePrices];
    newPrices[index].price = parseFloat(value) || 0;
    setMedicinePrices(newPrices);
  };

  const calculateTotal = () => {
    const medicinesTotal = medicinePrices.reduce((sum, med) => sum + med.price, 0);
    const consultationFees = reportData?.fees || 0;
    return consultationFees + medicinesTotal;
  };

  const handleSubmitBill = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/receptionist/create-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          medicinePrices
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowBillForm(false);
          setSelectedAppointment(null);
          setReportData(null);
          fetchAppointments();
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error creating bill. Please check your connection.');
      console.error('Error creating bill:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (appointmentId, email) => {
    try {
      const res = await fetch('http://localhost:5000/receptionist/send-payment-reminder', {
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
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error sending reminder');
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = pendingPayments.filter(apt =>
    apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(apt =>
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
        .bill-btn, .remind-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .bill-btn { background: #00b894; color: #fff; }
        .bill-btn:hover { background: #00a080; }
        .remind-btn { background: #f59e0b; color: #fff; }
        .remind-btn:hover { background: #d97706; }
        .status-badge { padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
        .status-paid { background: #e6fffa; color: #00b894; }
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #fff; border-radius: 20px; padding: 40px; max-width: 900px; width: 90%; max-height: 85vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h3 { color: #2d3748; font-size: 24px; }
        .close-icon { background: none; border: none; font-size: 24px; cursor: pointer; color: #718096; }
        .close-icon:hover { color: #2d3748; }
        .info-card { background: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
        .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
        .info-item { display: flex; flex-direction: column; }
        .info-label { font-size: 13px; color: #718096; margin-bottom: 4px; font-weight: 600; }
        .info-value { font-size: 16px; color: #2d3748; font-weight: 500; }
        .section-title { font-size: 20px; color: #2d3748; margin-bottom: 16px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        .medicine-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .medicine-item { background: #fff; border: 2px solid #e2e8f0; padding: 16px; border-radius: 12px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: center; }
        .medicine-item:hover { border-color: #00b894; }
        .medicine-field { display: flex; flex-direction: column; }
        .medicine-label { font-size: 12px; color: #718096; margin-bottom: 4px; font-weight: 600; }
        .medicine-value { font-size: 14px; color: #2d3748; font-weight: 500; }
        .medicine-input { padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.3s; }
        .medicine-input:focus { outline: none; border-color: #00b894; }
        .summary-card { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); padding: 24px; border-radius: 16px; color: #fff; margin-bottom: 24px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); }
        .summary-row:last-child { border-bottom: none; margin-bottom: 0; }
        .summary-label { font-size: 16px; font-weight: 500; }
        .summary-value { font-size: 16px; font-weight: 700; }
        .summary-total { font-size: 24px; font-weight: 800; }
        .alert { padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; font-weight: 500; }
        .alert-error { background: #fee; color: #c53030; border: 2px solid #fc8181; }
        .alert-success { background: #e6fffa; color: #00b894; border: 2px solid #00d4aa; }
        .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .submit-btn, .close-btn { flex: 1; padding: 16px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .submit-btn { background: #00b894; color: #fff; }
        .submit-btn:hover { background: #00a080; }
        .submit-btn:disabled { background: #cbd5e0; cursor: not-allowed; }
        .close-btn { background: #e2e8f0; color: #4a5568; }
        .close-btn:hover { background: #cbd5e0; }
        .loading-spinner { text-align: center; padding: 40px; color: #00b894; font-size: 18px; }
        @media (max-width: 968px) {
          .dashboard-container { flex-direction: column; }
          .sidebar { width: 100%; padding: 20px; }
          .nav-menu { flex-direction: row; overflow-x: auto; }
          .nav-item { min-width: 200px; }
          .info-row { grid-template-columns: 1fr; }
          .medicine-item { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="logo-container">
            <div className="logo-icon">💼</div>
            <div className="logo"><span>SAI</span> Clinic</div>
          </div>
          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => { setActiveTab('appointments'); setSearchQuery(''); }}>
              <span>📋</span> Appointments
            </div>
            <div className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => { setActiveTab('pending'); setSearchQuery(''); }}>
              <span>⏳</span> Pending Payment
            </div>
            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setSearchQuery(''); }}>
              <span>📚</span> History
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <div className="profile-icon" onClick={() => setShowProfile(true)}>👤</div>

          {activeTab === 'appointments' && (
            <div className="content-section">
              <h2 className="page-title">Reported Appointments</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredAppointments.length === 0 ? (
                <div className="empty-state"><p>No reported appointments</p></div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Date of Birth</th>
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
                          <td>{new Date(apt.dob).toLocaleDateString()}</td>
                          <td>{apt.patientEmail}</td>
                          <td>{apt.appointmentTime}</td>
                          <td>{apt.address}</td>
                          <td>
                            <button className="bill-btn" onClick={() => handleMakeBill(apt)}>
                              Make Bill
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

          {activeTab === 'pending' && (
            <div className="content-section">
              <h2 className="page-title">Pending Payments</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredPending.length === 0 ? (
                <div className="empty-state"><p>No pending payments</p></div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Date of Birth</th>
                        <th>Email</th>
                        <th>Time</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPending.map((apt) => (
                        <tr key={apt._id}>
                          <td>{apt.patientName}</td>
                          <td>{new Date(apt.dob).toLocaleDateString()}</td>
                          <td>{apt.patientEmail}</td>
                          <td>{apt.appointmentTime}</td>
                          <td>{apt.address}</td>
                          <td>
                            <button 
                              className="remind-btn" 
                              onClick={() => handleSendReminder(apt._id, apt.patientEmail)}
                            >
                              Send Reminder
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

          {activeTab === 'history' && (
            <div className="content-section">
              <h2 className="page-title">Payment History</h2>
              <input
                type="text"
                className="search-bar"
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredHistory.length === 0 ? (
                <div className="empty-state"><p>No payment history</p></div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Date of Birth</th>
                        <th>Email</th>
                        <th>Time</th>
                        <th>Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((apt) => (
                        <tr key={apt._id}>
                          <td>{apt.patientName}</td>
                          <td>{apt.age}</td>
                          <td>{apt.patientEmail}</td>
                          <td>{apt.appointmentTime}</td>
                          <td>{apt.address}</td>
                          <td>
                            <span className="status-badge status-paid">Paid</span>
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

      {showBillForm && selectedAppointment && (
        <div className="modal" onClick={() => setShowBillForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Bill</h3>
              <button className="close-icon" onClick={() => setShowBillForm(false)}>×</button>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}
            {success && <div className="alert alert-success">✓ {success}</div>}

            {loading && !reportData && (
              <div className="loading-spinner">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <div>Loading report data...</div>
              </div>
            )}

            {!loading && !reportData && error && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ color: '#718096', marginBottom: '16px' }}>Unable to load report data</p>
                <button 
                  className="submit-btn" 
                  style={{ maxWidth: '200px', margin: '0 auto' }}
                  onClick={() => fetchReport(selectedAppointment._id)}
                >
                  Retry
                </button>
              </div>
            )}

            {reportData && reportData.medicines && reportData.medicines.length > 0 && (
              <>
                <div className="info-card">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Patient Name</span>
                      <span className="info-value">{selectedAppointment.patientName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">{new Date(selectedAppointment.dob).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedAppointment.patientEmail}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Address</span>
                      <span className="info-value">{selectedAppointment.address}</span>
                    </div>
                  </div>
                </div>

                <div className="section-title">Enter Medicine Prices</div>
                <div className="medicine-list">
                  {reportData.medicines.map((medicine, index) => (
                    <div key={index} className="medicine-item">
                      <div className="medicine-field">
                        <span className="medicine-label">Medicine Name</span>
                        <span className="medicine-value">{medicine.name}</span>
                      </div>
                      <div className="medicine-field">
                        <span className="medicine-label">Dosage</span>
                        <span className="medicine-value">{medicine.dosage}</span>
                      </div>
                      <div className="medicine-field">
                        <span className="medicine-label">Timing</span>
                        <span className="medicine-value">{medicine.timing}</span>
                      </div>
                      <div className="medicine-field">
                        <span className="medicine-label">Price (₹)</span>
                        <input
                          type="number"
                          className="medicine-input"
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                          value={medicinePrices[index]?.price || ''}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-card">
                  <div className="summary-row">
                    <span className="summary-label">Consultation Fees</span>
                    <span className="summary-value">₹{reportData.fees || 0}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Medicines Total</span>
                    <span className="summary-value">₹{medicinePrices.reduce((sum, med) => sum + (med.price || 0), 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Total Amount</span>
                    <span className="summary-total">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="submit-btn" onClick={handleSubmitBill} disabled={loading}>
                    {loading ? 'Creating Bill...' : 'Create Bill'}
                  </button>
                  <button className="close-btn" onClick={() => setShowBillForm(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal" onClick={() => setShowProfile(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Receptionist Profile</h3>
              <button className="close-icon" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Role:</strong> Receptionist</p>
              <p style={{ marginBottom: '12px', color: '#4a5568', fontSize: '16px' }}><strong>Email:</strong> receptionist@saiclinic.com</p>
            </div>
            <button 
              style={{ width: '100%', padding: '14px', background: '#fc8181', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
              onClick={() => { removeToken(); window.location.href="/"; }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceptionistDashboard;