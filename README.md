CodeQuiz - Online Assessment Platform 🧠

CodeQuiz is a full-stack web application designed to test programming knowledge through an interactive quiz interface. It features a real-time leaderboard system powered by a cloud database to track and rank user scores.

🚀 Features

Interactive Quiz UI: A clean, responsive interface built with HTML5 and Tailwind CSS.

Dynamic Question Loading: Questions are fetched from the backend via REST API.

Real-time Leaderboard: Scores are saved to a Firebase Firestore database and retrieved instantly.

Server-Side Logic: Ranking and sorting logic is handled by a Node.js/Express server.

Difficulty Levels: Supports Easy, Medium, and Hard difficulty modes.

Single Page Application (SPA) feel: Smooth transitions between start, quiz, and result screens.

🛠️ Tech Stack

Frontend:

HTML5 & CSS3

Tailwind CSS (Styling)

Vanilla JavaScript (DOM Manipulation, Fetch API)

Backend:

Node.js (Runtime)

Express.js (Web Framework)

REST API Architecture

Database:

Google Firebase Firestore (NoSQL Cloud Database)

⚙️ Setup & Installation

If you want to run this project locally, follow these steps:

1. Prerequisites

Node.js installed on your machine.

A code editor (like VS Code).

2. Clone or Download

Download the project files to your computer.

3. Backend Setup

The backend requires several dependencies (express, cors, firebase-admin).

Open your terminal.

Navigate to the backend folder:

cd backend


Install the dependencies:

npm install


4. Database Configuration (Important!)

This project uses Firebase Admin SDK. To run the server, you need a service account key.

Create a project in the Firebase Console.

Generate a Service Account Private Key (JSON file) from Project Settings.

Rename the file to serviceAccountKey.json.

Place it inside the backend/ folder.

▶️ How to Run

To use the application, you need to run both the backend server and the frontend client simultaneously.

Step 1: Start the Backend

In your terminal (inside the backend folder), run:

node server.js


You should see: ✅ Backend server is running on http://localhost:3000

Step 2: Start the Frontend

Open the frontend folder in VS Code.

Right-click index.html and select "Open with Live Server".

The app will open in your browser (usually at http://127.0.0.1:5500).

📂 Project Structure

CodeQuiz/
├── backend/
│   ├── node_modules/         # Dependencies (Express, Firebase, etc.)
│   ├── server.js             # Main server logic and API endpoints
│   ├── package.json          # Project configuration
│   └── serviceAccountKey.json # Firebase Admin Credentials (Secret)
│
└── frontend/
    ├── index.html            # Main User Interface
    └── script.js             # Frontend logic & API calls


👨‍💻 Author

Amit Nautiyal

MCA Student 2024-26
Graphic Era Hill University Dehradun

Full-Stack Developer
