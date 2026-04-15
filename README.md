# 📄 MERN Candidate Document Submission App

A full-stack MERN application where users can submit personal details and upload documents for verification with proper validation and conditional logic.

---

## 🚀 Features

* 🧾 Candidate form submission
* 🎂 Age validation (must be 18+)
* 🏠 Residential & Permanent address logic
* 🔁 "Same as Residential" checkbox handling
* 📎 Upload multiple documents (min 2 required)
* 📄 Supports Image & PDF validation
* 🔗 REST API integration
* ⚡ Fast UI using Vite + React

---

## 🛠️ Tech Stack

* **Frontend:** React.js + Vite + Tailwind CSS
* **Backend:** Node.js + Express.js
* **Database:** MongoDB
* **File Upload:** Multer

---

## 📁 Project Structure

```id="7l1hxb"
root/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── Components/
│   │   │   └── Documentsubmissionform.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── candidateController.js
│   ├── models/
│   │   └── candidate.js
│   ├── routes/
│   │   └── candidateRoutes.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repo

```bash id="b6g6hf"
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2️⃣ Backend Setup

```bash id="q6f7vx"
cd backend
npm install
```

Create `.env` file inside backend:

```env id="phuq76"
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run backend:

```bash id="0j2jfz"
npm start
```

---

### 3️⃣ Frontend Setup

```bash id="a6ujl2"
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

### ➤ Submit Candidate

```id="bc0hhq"
POST /api/candidate
```

**Handles:**

* Form data submission
* File uploads (min 2)
* Validation (age, fields, file types)

---

## 📌 Validation Rules

* All fields are mandatory
* Age must be ≥ 18
* If "Same as Residential" is checked:

  * Permanent address not required
* Otherwise:

  * Permanent address required
* Minimum 2 documents required
* Allowed file types: Image, PDF

---

## 🔐 Environment Variables

Backend `.env`:

```env id="8t6qhm"
MONGO_URI=your_mongodb_url
PORT=5000
```

⚠️ Do not push `.env` to GitHub

---

## 🧪 How It Works

1. User fills form in frontend
2. Data sent to backend API
3. Backend validates data
4. Files stored in `/uploads`
5. Data saved in MongoDB

---

## 🙌 Author

Developed as a MERN stack assignment project.

---

## 📄 License

Free to use for learning and development.
