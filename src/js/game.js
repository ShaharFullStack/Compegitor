import { modePositions, scalePositions } from "./positions.js";

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-button');
    let context;
    let score = 0;
    let timeLeft = 240;
    
    let correctNotes = [];
    let currentScale = '';

    function initializeAudioContext() {
        if (!context) {
            context = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (context.state === 'suspended') {
            context.resume();
        }
    }

    if (startButton) {
        startButton.addEventListener('click', function () {
            startScaleIdentification();
        });
    }

    document.querySelectorAll('.fret button').forEach(button => {
        button.addEventListener('click', handleFretClick);
    });

    function handleFretClick(event) {
        const button = event.target;
        const string = button.getAttribute('data-string');
        const fret = button.getAttribute('data-fret');
        const note = button.getAttribute('data-note');

        // Initialize AudioContext
        initializeAudioContext();

        if (note) {
            playMidiFile(note); // Assuming `playMidiFile` is defined elsewhere
        }

        const positionIndex = correctNotes.findIndex(position => position.string === string && position.fret === fret);
        if (positionIndex !== -1) {
            score += 10;
            timeLeft += 5;
            updateScore();
            button.classList.add('correct');
            correctNotes.splice(positionIndex, 1);
            if (correctNotes.length === 0) {
                nextRound();
            }
        } else {
            score -= 5;
            timeLeft -= 2;
            updateScore();
            button.classList.add('wrong');
            setTimeout(() => button.classList.remove('wrong'), 500);
        }
    }

    function getRandomScalePosition() {
        const isAdvancedLevel = score > 450;
        const positions = isAdvancedLevel ? { ...modePositions } : scalePositions;
        const scaleNames = Object.keys(positions);
        const randomIndex = Math.floor(Math.random() * scaleNames.length);
        return scaleNames[randomIndex];
    }

    function startScaleIdentification() {
        score = 0;
        timeLeft = 240;
        updateScore();
        updateTime();
        startTimer();
        nextRound();
    }

    function updateScore() {
        document.getElementById("score").innerText = `Score: ${score}`;
    }

    function updateTime() {
        document.getElementById("timer").innerText = `Time: ${timeLeft}`;
    }

    function startTimer() {
        const timerInterval = setInterval(() => {
            timeLeft--;
            updateTime();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert(`Game over! Your score is ${score}`);
                highlightCorrectNotes();
            }
        }, 1000);
    }

    function highlightCorrectNotes() {
        correctNotes.forEach(position => {
            const button = document.querySelector(`button[data-string="${position.string}"][data-fret="${position.fret}"]`);
            if (button) {
                button.classList.add('correct');
            }
        });
    }

    function clearHighlights() {
        document.querySelectorAll('.fret button').forEach(button => {
            button.classList.remove('correct', 'wrong');
            button.removeEventListener('click', handleFretClick);
            button.addEventListener('click', handleFretClick);
        });
    }

});
