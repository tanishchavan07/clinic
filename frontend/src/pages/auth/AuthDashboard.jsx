import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {setToken} from '../../utils/auth';

const App = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slideDirection, setSlideDirection] = useState('');

  const handleViewChange = (newView) => {
    if (newView === 'patientSignup' && view === 'patientLogin') {
      setSlideDirection('slide-left');
    } else if (newView === 'patientLogin' && view === 'patientSignup') {
      setSlideDirection('slide-right');
    } else {
      setSlideDirection('');
    }
    setTimeout(() => setView(newView), 50);
  };

  const PatientLoginForm = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });

    const handleSubmit = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await fetch('http://localhost:5000/auth/patient/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
              
          },
          //credentials: 'include', // Important for cookies
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess('Login successful! Redirecting...');
            setToken(data.token);
          // Store user info in sessionStorage
          sessionStorage.setItem('userEmail', data.user.email);
          sessionStorage.setItem('userName', data.user.name);
          sessionStorage.setItem('userRole', 'patient');
          
          console.log('Login success:', data);
          
         
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            navigate("/patient/dashboard");
          }, 1000);
          
        } else {
          setError(data.message || 'Login failed');
          setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        setError('Network error. Please ensure backend is running on port 5000.');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="form-container">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="xyz@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <div className="signup">
          Don't have an account? <span className="link" onClick={() => handleViewChange('patientSignup')}>Sign Up</span>
        </div>
      </div>
    );
  };

  const PatientSignupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      age: '',
      mobile: '',
      gender: '',
      email: '',
      password: ''
    });

    const handleSubmit = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await fetch('http://localhost:5000/auth/patient/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
             
          },
         // credentials: 'include',
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
           setToken(data.token);
          setSuccess('Account created successfully! Redirecting to login...');
          setFormData({
            name: '',
            age: '',
            mobile: '',
            gender: '',
            email: '',
            password: ''
          });
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            navigate("/patient/dashboard");
          }, 1000);

          setTimeout(() => {
            setSuccess('');
            handleViewChange('patientLogin');

          }, 2000);
          
        } else {
          setError(data.message || 'Registration failed');
          setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        setError('Network error. Please ensure backend is running on port 5000.');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="form-container signup-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>Age</label>
            <input
              type="number"
              placeholder="25"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>
          <div className="form-group half">
            <label>Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            placeholder="+1 234 567 8900"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <div className="signup">
          Already have an account? <span className="link" onClick={() => handleViewChange('patientLogin')}>Log In</span>
        </div>
      </div>
    );
  };

  const StaffLoginForm = () => {
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      role: ''
    });

    const handleSubmit = async () => {
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const response = await fetch('http://localhost:5000/auth/staff/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${setToken()}`
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setSuccess('Login successful! Redirecting...');

      // 🔐 Store token
      setToken(data.token);

      // 🧠 Store staff info
      sessionStorage.setItem('username', data.user.username);
      sessionStorage.setItem('userRole', data.user.role);

      console.log('Staff login success:', data);

      // 🎯 ROLE BASED REDIRECT
      setTimeout(() => {
        switch (data.user.role) {
          case 'doctor':
            navigate('/doctor/dashboard');
            break;

          case 'scheduler':
            navigate('/scheduler/dashboard');
            break;

          case 'receptionist':
            navigate('/receptionist/dashboard');
            break;

          case 'admin':
            navigate('/admin/dashboard');
            break;

          default:
            navigate('/staff-dashboard'); // fallback
        }
      }, 1000);

    } else {
      setError(data.message || 'Login failed');
      setTimeout(() => setError(''), 3000);
    }

  } catch (err) {
    setError('Network error. Please ensure backend is running on port 5000.');
    setTimeout(() => setError(''), 3000);
  } finally {
    setLoading(false);
  }
};


    return (
      <div className="form-container">
        <div className="form-group">
          <label>Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="null">Select your role</option>
            <option value="doctor">Doctor</option>
            <option value="scheduler">Scheduler</option>
            <option value="receptionist">Receptionist</option>
            
          </select>
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="staff_username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    );
  };

  const SelectionView = () => (
    <div className="selection-view">
      <h2>Welcome to <span className="clinic-name">SAI Clinic</span></h2>
      <p>Please select your login type</p>
      <button className="btn" onClick={() => handleViewChange('patientLogin')}>
        Patient Login
      </button>
      <button className="btn" onClick={() => handleViewChange('staffLogin')}>
        Staff Login
      </button>
    </div>
  );

  const isSignup = view === 'patientSignup';
  const leftContent = isSignup ? 'right' : 'left';

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
          background: url('https://static.vecteezy.com/system/resources/thumbnails/049/324/221/small/a-medical-mackground-with-various-medical-items-animation-free-video.jpg') center/cover fixed;
          min-height: 100vh;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(242, 246, 252, 0.85);
          backdrop-filter: blur(8px);
          z-index: -1;
        }
        
        .app-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        
        .container {
          display: flex;
          width: 900px;
          height: 550px;
          border-radius: 16px;
          box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          background: #fff;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .left, .right {
          width: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .left {
          background: linear-gradient(145deg, #7be0cf, #a6e3f2);
          color: #333;
          text-align: center;
          padding: 50px 40px;
          order: ${leftContent === 'left' ? '1' : '2'};
        }
        
        .slide-left .left {
          animation: slideFromRight 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slide-right .left {
          animation: slideFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideFromRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideFromLeft {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .left h1 {
          font-size: 48px;
          margin-bottom: 15px;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
          color: #2d3748;
        }
        
        .left p {
          font-size: 17px;
          opacity: 0.95;
          line-height: 1.6;
          color: #444;
        }
        
        .left img {
          width: 220px;
          margin: 30px auto 0 auto;   /* ✅ centers image horizontally */
  display: block; 
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        
        .right {
          padding: 50px 45px;
          background: #fff;
          order: ${leftContent === 'left' ? '2' : '1'};
        }
        
        .slide-left .right {
          animation: slideContentLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slide-right .right {
          animation: slideContentRight 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideContentLeft {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideContentRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .back-btn {
          margin-bottom: 20px;
          color: #2a7f6f;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .back-btn:hover {
          color: #1f5f52;
          transform: translateX(-3px);
        }
        
        .right h2 {
          font-size: 32px;
          margin-bottom: 25px;
          color: #2d3748;
          font-weight: 700;
        }
        
        .clinic-name {
          background: linear-gradient(145deg, #1FA2FF, #A6FFCB);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }
        
        .form-container {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .form-row {
          display: flex;
          gap: 15px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group.half {
          flex: 1;
        }
        
        .signup-form {
          max-height: 420px;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .signup-form::-webkit-scrollbar {
          width: 6px;
        }
        
        .signup-form::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .signup-form::-webkit-scrollbar-thumb {
          background: #2a7f6f;
          border-radius: 10px;
        }
        
        .form-group label {
          display: block;
          font-size: 14px;
          margin-bottom: 8px;
          color: #4a5568;
          font-weight: 600;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 13px 15px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          font-size: 14px;
          transition: all 0.3s;
          background: #f8fafc;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          border-color: #2a7f6f;
          outline: none;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(42, 127, 111, 0.1);
        }
        
        .btn {
          width: 100%;
          padding: 14px;
          background: #2a7f6f;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(42, 127, 111, 0.3);
        }
        
        .btn:hover {
          background: #25675c;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(42, 127, 111, 0.4);
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        .btn:disabled {
          background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        
        .signup {
          margin-top: 25px;
          font-size: 14px;
          text-align: center;
          color: #718096;
        }
        
        .signup a {
          color: #2a7f6f;
          text-decoration: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .signup a:hover {
          color: #1f5f52;
          text-decoration: underline;
        }
        
        .signup .link {
          color: #2a7f6f;
          text-decoration: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .signup .link:hover {
          color: #1f5f52;
          text-decoration: underline;
        }
        
        .alert {
          padding: 12px 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .alert-error {
          background: #fee;
          color: #c53030;
          border: 2px solid #fc8181;
        }
        
        .alert-success {
          background: #efe;
          color: #2f855a;
          border: 2px solid #68d391;
        }
        
        .selection-view {
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .selection-view h2 {
          font-size: 32px;
          margin-bottom: 15px;
          color: #2d3748;
        }
        
        .selection-view p {
          color: #718096;
          font-size: 16px;
          margin-bottom: 35px;
        }
        
        .selection-view .btn {
          margin-top: 15px;
        }
        
        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            width: 100%;
            height: auto;
          }
          .left, .right {
            width: 100%;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
      
      <div className={`app-container ${slideDirection}`}>
        <div className="container">
          <div className="left">
            <h1>{isSignup ? 'HELLO !' : 'WELCOME !'}</h1>
            <p>
              {isSignup 
                ? 'Create your account to get started with SAI Clinic' 
                : 'Please enter your details to continue'}
            </p>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" 
              alt="Doctor Illustration" 
            />
          </div>
          
          <div className="right">
            {view !== 'select' && (
              <span className="back-btn" onClick={() => handleViewChange('select')}>
                ← Back
              </span>
            )}
            
            <h2>
              {view === 'select' ? '' : <span className="clinic-name">SAI Clinic</span>}
            </h2>
            
            {view === 'select' && <SelectionView />}
            {view === 'patientLogin' && <PatientLoginForm />}
            {view === 'patientSignup' && <PatientSignupForm />}
            {view === 'staffLogin' && <StaffLoginForm />}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;