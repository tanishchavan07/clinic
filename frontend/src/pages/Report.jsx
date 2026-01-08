import React, { useEffect, useState } from "react";

const Report = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get appointmentId from URL - make sure you have React Router setup
  // For React Router v6: import { useParams } from "react-router-dom";
  // const { appointmentId } = useParams();
  
  // For now, you can get it from window location or pass as prop
  const appointmentId = window.location.pathname.split('/').pop() || "appointmentId";

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        
        // Get token - replace this with your actual auth implementation
        const token = localStorage.getItem('token'); // or use your getToken() function
        
        const response = await fetch(`http://localhost:5000/patient/report/${appointmentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setReport(data.report);
        } else {
          setError(data.message || 'Failed to fetch report');
        }
      } catch (err) {
        setError('Failed to load report. Please try again.');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Error Loading Report</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="error-container">
        <div className="error-icon">📄</div>
        <h2>No Report Found</h2>
        <p>The requested report could not be found.</p>
      </div>
    );
  }

  return (
    <div className="report-wrapper">
      <div className="a4">
        {/* Header Section */}
        <div className="header">
          <div className="logo-section">
            <div className="logo-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.5 3.8 9.7 10 11 6.2-1.3 10-5.5 10-11V7l-10-5z"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <div className="clinic-info">
              <h1>SAI CLINIC</h1>
              <p className="tagline">Complete Healthcare Solutions</p>
            </div>
          </div>
          <div className="contact-info">
            <p>📞 +91 98765 43210</p>
            <p>📧 info@saiclinic.com</p>
            <p>📍 Medical District, City</p>
          </div>
        </div>

        <div className="divider"></div>

        {/* Report Title */}
        <div className="report-title">
          <h2>MEDICAL REPORT</h2>
          <p className="report-id">Report ID: #{appointmentId}</p>
        </div>

        {/* Patient Information */}
        <div className="info-section">
          <h3>Patient Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Patient Name:</span>
              <span className="value">{report.patientName}</span>
            </div>
            <div className="info-item">
              <span className="label">Age:</span>
              <span className="value">{report.age} years</span>
            </div>
            <div className="info-item">
              <span className="label">Report Date:</span>
              <span className="value">{report.reportDate}</span>
            </div>
            <div className="info-item">
              <span className="label">Report Type:</span>
              <span className="value">{report.reportType}</span>
            </div>
          </div>
        </div>

        {/* Clinical Findings */}
        <div className="info-section">
          <h3>Clinical Findings</h3>
          <div className="clinical-detail">
            <div className="detail-box diagnosis">
              <span className="detail-label">Diagnosis</span>
              <p className="detail-content">{report.disease}</p>
            </div>
            <div className="detail-box symptoms">
              <span className="detail-label">Symptoms Observed</span>
              <p className="detail-content">{report.symptoms}</p>
            </div>
          </div>
        </div>

        {/* Prescription */}
        <div className="info-section">
          <h3>℞ Prescription</h3>
          <table className="medicine-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Timing</th>
              </tr>
            </thead>
            <tbody>
              {report.medicines.map((med, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="med-name">{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.timing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor Notes */}
        {report.doctorNotes && (
          <div className="info-section">
            <h3>Doctor's Notes & Instructions</h3>
            <div className="notes-box">
              {report.doctorNotes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="footer-section">
          <div className="fees-box">
            <span className="fees-label">Consultation Fees:</span>
            <span className="fees-amount">₹{report.fees}</span>
          </div>
          
          <div className="signature-section">
            <div className="doctor-info">
              <p className="doctor-name">Dr. {report.doctorName}</p>
              <p className="doctor-designation">M.B.B.S, M.D.</p>
              <p className="reg-number">Reg. No: MED/2024/12345</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p className="signature-label">Doctor's Signature</p>
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="verification-footer">
          <p>This is a computer-generated report and does not require a physical signature.</p>
          <p>For verification, please visit: www.saiclinic.com/verify</p>
        </div>
        <button
  style={{
    marginBottom: "20px",
    padding: "10px 20px",
    background: "#00b894",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
  onClick={() => window.print()}
>
  Print / Download PDF
</button>

      </div> 


      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }


        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: #64748b;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top: 5px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container p,
        .error-container p {
          font-size: 1.2rem;
          margin-top: 10px;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .error-container h2 {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .retry-btn {
          margin-top: 20px;
          padding: 12px 30px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .report-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .a4 {
          width: 210mm;
          min-height: 297mm;
          background: white;
          padding: 30mm 20mm;
          font-family: 'Georgia', 'Times New Roman', serif;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          position: relative;
        }

        /* Header Styles */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logo-circle svg {
          width: 35px;
          height: 35px;
        }

        .clinic-info h1 {
          font-size: 28px;
          color: #1e293b;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }

        .tagline {
          color: #64748b;
          font-size: 12px;
          font-style: italic;
        }

        .contact-info {
          text-align: right;
          font-size: 11px;
          color: #475569;
          line-height: 1.6;
        }

        .divider {
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          margin: 20px 0;
        }

        /* Report Title */
        .report-title {
          text-align: center;
          margin: 30px 0;
        }

        .report-title h2 {
          font-size: 24px;
          color: #1e293b;
          letter-spacing: 3px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .report-id {
          color: #64748b;
          font-size: 12px;
        }

        /* Info Sections */
        .info-section {
          margin: 25px 0;
        }

        .info-section h3 {
          font-size: 16px;
          color: #1e293b;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
          letter-spacing: 0.5px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
        }

        /* Clinical Details */
        .clinical-detail {
          display: grid;
          gap: 15px;
        }

        .detail-box {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .detail-box.diagnosis {
          border-left-color: #ef4444;
        }

        .detail-box.symptoms {
          border-left-color: #f59e0b;
        }

        .detail-label {
          display: block;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .detail-content {
          font-size: 14px;
          color: #1e293b;
          line-height: 1.6;
        }

        /* Medicine Table */
        .medicine-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 15px 0;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .medicine-table thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .medicine-table th {
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .medicine-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          color: #334155;
        }

        .medicine-table tbody tr:last-child td {
          border-bottom: none;
        }

        .medicine-table tbody tr:hover {
          background: #f8fafc;
        }

        .med-name {
          font-weight: 600;
          color: #1e293b;
        }

        /* Notes Box */
        .notes-box {
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.7;
          color: #78350f;
        }

        /* Footer Section */
        .footer-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
        }

        .fees-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f0fdf4;
          border: 2px solid #86efac;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .fees-label {
          font-size: 14px;
          color: #166534;
          font-weight: 600;
        }

        .fees-amount {
          font-size: 24px;
          color: #166534;
          font-weight: 700;
        }

        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 40px;
        }

        .doctor-info {
          text-align: left;
        }

        .doctor-name {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .doctor-designation,
        .reg-number {
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }

        .signature-box {
          text-align: center;
          min-width: 200px;
        }

        .signature-line {
          width: 180px;
          height: 60px;
          border-bottom: 2px solid #1e293b;
          margin-bottom: 5px;
        }

        .signature-label {
          font-size: 11px;
          color: #64748b;
          font-style: italic;
        }

        /* Verification Footer */
        .verification-footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px dashed #cbd5e1;
          text-align: center;
        }

        .verification-footer p {
          font-size: 9px;
          color: #94a3b8;
          line-height: 1.5;
        }

        /* Print Styles */
        @media print {
          .report-wrapper {
            background: white;
            padding: 0;
          }

          .a4 {
            box-shadow: none;
            margin: 0;
            width: 100%;
          }
        }
          @media print {
  body * {
    visibility: hidden;
  }
  .a4, .a4 * {
    visibility: visible;
  }
  .a4 {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    height: 297mm;
  }
}

      `}</style>
    </div>
  );
};

export default Report;