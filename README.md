# 🏥 Clinic Management System

A full-stack **Clinic Management System** built using the MERN stack to streamline healthcare operations like appointment booking, patient management, billing, and medical records.

---

## 🚀 Features

* 👨‍⚕️ **Role-Based Access Control**

  * Patients, Doctors, Receptionists, and Schedulers
  * Secure authentication using JWT

* 📅 **Appointment Management**

  * Book, approve, reschedule, and cancel appointments
  * Complete appointment lifecycle tracking

* 📄 **Medical Reports**

  * Doctors can generate and manage patient reports
  * Download reports as PDF

* 💳 **Billing & Payments**

  * Dynamic bill generation
  * Payment tracking system

* 📊 **Dashboard**

  * Real-time updates for all roles
  * Clean and responsive UI

* 🔐 **Authentication & Security**

  * JWT-based authentication
  * Password hashing using bcrypt


---    
Project Url : https://clinic-one-rosy.vercel.app/
---

## 🛠️ Tech Stack

**Frontend**

* React.js
* Axios
* CSS

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB (Mongoose)

**Authentication**

* JWT (JSON Web Token)
* bcrypt

---

## 📂 Project Structure

```
clinic-management-system/
│── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
│── frontend/
│   ├── components/
│   ├── pages/
│   └── App.js
│
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/tanishchavan07/clinic.git
cd clinic
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in backend:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🌐 API Features

* User Authentication (Register/Login)
* Appointment APIs
* Patient & Doctor Management
* Billing APIs
* Report Generation

---

## 📸 Screenshots

*Add screenshots of your project here (Dashboard, Login, Appointments, etc.)*

---

## 🧠 Learnings

* Built a scalable MERN architecture
* Implemented secure authentication using JWT
* Designed RESTful APIs
* Handled real-world workflows like appointments & billing

---

## 🔗 GitHub Repository

👉 https://github.com/tanishchavan07/clinic

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Tanish Chavan**
