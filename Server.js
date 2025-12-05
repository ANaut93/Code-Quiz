const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// --- SETUP ---
const app = express();
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Allows server to read JSON from requests

// --- FIREBASE ADMIN SETUP ---
// This line assumes 'serviceAccountKey.json' is in the same 'backend' folder
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const db = admin.firestore();
    // This is the public path for your leaderboard data
    const leaderboardCollection = `artifacts/default-app-id/public/data/leaderboard`;

    // --- YOUR QUIZ QUESTIONS ---
    // We keep them here, safe on the server.
    const questions = {
        easy: [
            { question: "What does 'HTML' stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], answer: "Hyper Text Markup Language" },
            { question: "Which tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<p>"], answer: "<a>" },
            { question: "What is the correct CSS syntax for changing the color of a paragraph?", options: ["p {color: red;}", "p.color = 'red';", "<p style='color:red;'>", "paragraph-color: red;"], answer: "p {color: red;}" }
        ],
        medium: [
            { question: "Which of these is a JavaScript framework?", options: ["Laravel", "Django", "React", "Sass"], answer: "React" },
            { question: "What does `JSON.parse()` do?", options: ["Converts a JSON string into a JavaScript object", "Converts a JavaScript object into a JSON string", "Creates a new JSON file", "Parses a CSS file"], answer: "Converts a JSON string into a JavaScript object" },
             { question: "Which git command is used to create a new branch?", options: ["git branch new-branch", "git create branch new-branch", "git checkout -b new-branch", "git new branch"], answer: "git checkout -b new-branch" }
        ],
        hard: [
            { question: "What is a 'closure' in JavaScript?", options: ["A function having access to the parent scope, even after the parent function has closed", "A way to close a memory leak", "A type of CSS class", "A method to shut down the server"], answer: "A function having access to the parent scope, even after the parent function has closed" },
            { question: "What is the time complexity of a binary search algorithm?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], answer: "O(log n)" },
            { question: "In object-oriented programming, what is polymorphism?", options: ["The ability of an object to take on many forms", "A way to hide implementation details", "The process of creating a new class from an existing class", "A single name for a set of functions"], answer: "The ability of an object to take on many forms" }
        ]
    };

    // --- API ENDPOINTS ---

    // Endpoint 1: Get questions for a specific difficulty
    app.get('/api/questions/:difficulty', (req, res) => {
        const difficulty = req.params.difficulty;
        if (questions[difficulty]) {
            // Send questions *and* answers.
            // In a real app, you'd hide the answers and have the server check them.
            // For this project, this is simpler and still separates the files.
            res.json(questions[difficulty]);
        } else {
            res.status(404).json({ error: 'Difficulty not found' });
        }
    });

    // Endpoint 2: Get the sorted leaderboard
    app.get('/api/leaderboard', async (req, res) => {
        try {
            const leaderboardCol = db.collection('leaderboard');
            const snapshot = await leaderboardCol.get();
            
            const scores = [];
            snapshot.forEach((doc) => {
                scores.push(doc.data());
            });

            // Sort the scores on the backend
            scores.sort((a, b) => {
                if (a.score !== b.score) {
                    return b.score - a.score; // Higher score first
                }
                return a.username.localeCompare(b.username); // Alphabetical for ties
            });

            res.json(scores);
        } catch (error) {
            console.error("Error fetching leaderboard: ", error);
            res.status(500).json({ error: 'Could not fetch leaderboard' });
        }
    });

    // Endpoint 3: Submit a new score
    app.post('/api/leaderboard', async (req, res) => {
        try {
            const { username, score, total, difficulty } = req.body;
            
            if (!username || score === undefined || !total || !difficulty) {
                return res.status(400).json({ error: 'Missing required score data' });
            }

            const leaderboardCol = db.collection('leaderboard');
            await leaderboardCol.add({
                username: username,
                score: score,
                total: total,
                difficulty: difficulty,
                createdAt: new Date()
            });
            res.status(201).json({ success: true });
        } catch (error) {
            console.error("Error saving score: ", error);
            res.status(500).json({ error: 'Could not save score' });
        }
    });


    // --- START THE SERVER ---
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`✅ Backend server is running on http://localhost:${PORT}`);
    });

} catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error("Hint: Make sure 'serviceAccountKey.json' is in the 'backend' folder.");
    }
}
