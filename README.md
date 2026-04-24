# 🏢 Hostel Management Portal (Full Stack Web Application)

A full-stack hostel management system designed to simulate real-world student accommodation workflows. The application enables students to request hostel rooms, report issues, and submit complaints, while providing administrators (wardens) with a centralized dashboard to manage and monitor all activities efficiently.

---

## 🚀 Features

### 👨‍🎓 Student Portal

* Submit hostel registration requests
* Choose room preferences
* Raise maintenance requests
* Submit complaints with detailed descriptions

### 🛠 Warden/Admin Dashboard

* Approve or reject student registrations
* Assign rooms (Block & Room Number)
* Track hostel occupancy in real-time
* Manage maintenance tickets
* Handle student complaints
* View completed (solved) requests

---

## 🧠 System Overview

The system follows a **role-based architecture**:

* **Student** → Creates requests (registration, maintenance, complaints)
* **Warden/Admin** → Reviews, processes, and manages all requests

It also implements a **ticket lifecycle system**, where each request moves through states such as:

* `pending`
* `approved / rejected`
* `active`
* `solved`

---

## 🏗️ Project Structure

```
hostel-management-system/
│
├── frontend/          # React (Vite)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # Flask API
│   └── App.py
│
├── README.md
└── .gitignore
```

---

## ⚙️ Tech Stack

### Frontend

* React.js (Vite)
* JavaScript (ES6+)
* CSS

### Backend

* Flask (Python)
* Flask-CORS

### Communication

* REST API (HTTP Requests)

---

## 📡 API Endpoints

| Endpoint                              | Method | Description                 |
| ------------------------------------- | ------ | --------------------------- |
| `/register`                           | POST   | Student registration        |
| `/registration_decision/<student_id>` | POST   | Approve/Reject registration |
| `/maintenance`                        | POST   | Submit maintenance request  |
| `/complaint`                          | POST   | Submit complaint            |
| `/get_tickets`                        | GET    | Retrieve all requests       |
| `/update_ticket/<id>`                 | POST   | Update ticket status        |

---

## ▶️ How to Run the Project

### 1️⃣ Clone Repository

```
git clone https://github.com/YOUR_USERNAME/hostel-management-system.git
cd hostel-management-system
```

---

### 2️⃣ Run Backend (Flask)

```
cd backend
pip install flask flask-cors
python App.py
```

Server will run on:

```
http://127.0.0.1:5000
```

---

### 3️⃣ Run Frontend (React)

```
cd frontend
npm install
npm start
```

Application will run on:

```
http://localhost:3000
```

---

## 🔐 Authentication

* Basic password-based login for Warden (Demo purpose)
* No advanced authentication implemented yet

---

## ⚠️ Limitations

* Uses in-memory database (data resets when server restarts)
* No persistent storage (e.g., SQL/NoSQL)
* Simplified authentication (not production-ready)

---

## 🔮 Future Improvements

* Integrate real database (MySQL / MongoDB)
* Implement secure authentication (JWT)
* Add role-based authorization
* Deploy system (Docker / Cloud)
* Improve UI/UX with modern design frameworks

---

## 📸 Screenshots

> Add screenshots here (Student Portal / Admin Dashboard / Tickets)

---

## 👥 Contributors

* **Yazan Khaled**
* **Muhammad Al Shaban**

---

## 📜 License

This project is for educational purposes and demonstration only.

---

## ⭐ Acknowledgment

This project was developed as a hands-on implementation to simulate enterprise-level hostel management workflows and full-stack integration.
