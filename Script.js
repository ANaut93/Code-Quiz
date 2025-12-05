// --- CONFIGURATION ---
// This is the address of your backend.
// 'http://localhost:3000' is the server we're running in 'backend/server.js'
const API_URL = 'http://localhost:3000';

// --- STATE MANAGEMENT ---
let currentDifficulty = 'easy';
let currentQuestions = []; // Will be filled by the API
let currentQuestionIndex = 0;
let score = 0;
let username = '';

// --- DOM ELEMENTS ---
let startScreen, quizScreen, resultScreen, leaderboardScreen;
let questionNumberEl, totalQuestionsEl, scoreEl, questionTextEl, optionsContainerEl, nextButton;
let usernameInput, usernameError;
let leaderboardListEl, leaderboardLoadingEl;
let currentActiveScreen = null; // To manage screen transitions

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // This function runs once the HTML is fully loaded
    startScreen = document.getElementById('start-screen');
    quizScreen = document.getElementById('quiz-screen');
    resultScreen = document.getElementById('result-screen');
    leaderboardScreen = document.getElementById('leaderboard-screen');
    
    questionNumberEl = document.getElementById('question-number');
    totalQuestionsEl = document.getElementById('total-questions');
    scoreEl = document.getElementById('score');
    questionTextEl = document.getElementById('question-text');
    optionsContainerEl = document.getElementById('options-container');
    nextButton = document.getElementById('next-button');

    usernameInput = document.getElementById('username');
    usernameError = document.getElementById('username-error');
    
    leaderboardListEl = document.getElementById('leaderboard-list');
    leaderboardLoadingEl = document.getElementById('leaderboard-loading');
    
    // Set the initial active screen
    currentActiveScreen = startScreen;
});

// --- SCREEN NAVIGATION ---
function showScreen(screenElement) {
    if (currentActiveScreen) {
        currentActiveScreen.classList.remove('active');
    }
    screenElement.classList.add('active');
    currentActiveScreen = screenElement;
}

// --- FUNCTIONS (Attached to window for HTML onclick) ---

window.startQuiz = async (difficulty) => {
    username = usernameInput.value.trim();
    if (!username) {
        usernameError.textContent = "Please enter a username!"; // Show error
        return;
    }
    usernameError.textContent = ""; // Clear error
    
    currentDifficulty = difficulty;
    
    // --- FETCH QUESTIONS FROM BACKEND ---
    try {
        const response = await fetch(`${API_URL}/api/questions/${difficulty}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentQuestions = await response.json();
        
        if (!currentQuestions || currentQuestions.length === 0) {
            alert("Error: Could not load questions for this difficulty.");
            return;
        }

        currentQuestionIndex = 0;
        score = 0;

        showScreen(quizScreen);
        
        scoreEl.textContent = score;
        totalQuestionsEl.textContent = currentQuestions.length;

        showQuestion();

    } catch (error) {
        console.error("Error starting quiz:", error);
        alert("Could not connect to the server to get questions. Is the backend running?");
    }
}

function showQuestion() {
    // Hide 'Next' button
    nextButton.classList.add('opacity-0', 'invisible');

    const question = currentQuestions[currentQuestionIndex];
    questionNumberEl.textContent = currentQuestionIndex + 1;
    questionTextEl.textContent = question.question;

    optionsContainerEl.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        // Add styling from our new CSS
        button.classList.add('option-btn', 'bg-gray-700', 'bg-opacity-50', 'hover:bg-cyan-900', 'text-white', 'p-4', 'rounded-lg', 'transition', 'duration-300', 'text-left', 'w-full', 'font-medium');
        button.onclick = () => selectAnswer(button, option, question.answer);
        optionsContainerEl.appendChild(button);
    });
}
window.showQuestion = showQuestion;

function selectAnswer(buttonEl, selectedOption, correctAnswer) {
    const optionButtons = optionsContainerEl.querySelectorAll('button');
    
    optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-cyan-900');
        
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct'); // Add 'correct' class
        } else {
            btn.classList.add('opacity-50'); // Fade out wrong options
        }
    });

    if (selectedOption === correctAnswer) {
        score++;
        scoreEl.textContent = score;
    } else {
        buttonEl.classList.add('incorrect'); // Add 'incorrect' class to the one they clicked
    }
    
    // Show 'Next' button
    nextButton.classList.remove('opacity-0', 'invisible');
}
window.selectAnswer = selectAnswer;

window.nextQuestion = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

async function showResult() {
    showScreen(resultScreen);
    document.getElementById('result-username').textContent = username;
    document.getElementById('final-score').textContent = `${score} / ${currentQuestions.length}`;
    
    // Save the score to the leaderboard via the backend
    await saveScoreToLeaderboard();
}
window.showResult = showResult;

async function saveScoreToLeaderboard() {
    try {
        await fetch(`${API_URL}/api/leaderboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                score: score,
                total: currentQuestions.length,
                difficulty: currentDifficulty
            })
        });
        console.log("Score saved to leaderboard");
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

window.showLeaderboard = async () => {
    showScreen(leaderboardScreen);
    
    leaderboardListEl.innerHTML = ''; // Clear previous list
    leaderboardLoadingEl.style.display = 'flex'; // Show loading spinner

    try {
        // --- FETCH LEADERBOARD FROM BACKEND ---
        const response = await fetch(`${API_URL}/api/leaderboard`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const scores = await response.json(); // Get sorted scores from server

        leaderboardLoadingEl.style.display = 'none'; // Hide loading spinner

        if (scores.length === 0) {
            leaderboardListEl.innerHTML = '<li class="text-gray-400 text-center">No scores yet. Be the first!</li>';
            return;
        }

        // The scores are ALREADY SORTED by the backend. We just display them.
        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.classList.add('flex', 'justify-between', 'items-center', 'p-4', 'rounded-lg', 'bg-gray-700', 'bg-opacity-50');
            li.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="text-lg font-bold text-cyan-400 w-6">${index + 1}.</span>
                    <span class="font-medium text-white">${entry.username}</span>
                </div>
                <div class="text-right">
                    <span class="text-xl font-bold text-white">${entry.score} / ${entry.total}</span>
                    <span class="text-xs text-gray-400 capitalize block">${entry.difficulty}</span>
                </div>
            `;
            leaderboardListEl.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        leaderboardLoadingEl.style.display = 'none';
        leaderboardListEl.innerHTML = `<li class="text-red-400 text-center">Error loading leaderboard. Is the backend running?</li>`;
    }
}

window.restartQuiz = () => {
    showStartScreen();
}

function showStartScreen() {
    showScreen(startScreen);
    usernameInput.value = username; // Keep username populated
}
window.showStartScreen = showStartScreen;

