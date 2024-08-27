import AudioController from './audio.js';
import { modePositions, scalePositions } from './positions.js';


document.addEventListener('DOMContentLoaded', function() {
    const audioController = new AudioController();

    const settingsButton = document.getElementById('settings-button');
    const modal = document.getElementById('sound-settings-modal');
    const closeModal = document.getElementById('close-modal');
    const applySettingsButton = document.getElementById('apply-settings');

    // Open modal on settings button click
    settingsButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close modal when the close button is clicked
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Apply settings when the user clicks the apply button
    applySettingsButton.addEventListener('click', () => {
        const selectedWaveform = document.getElementById('waveform-select').value;
        const reverbValue = document.getElementById('reverb-range').value;
        const decayValue = document.getElementById('decay-range').value;

        audioController.setWaveform(selectedWaveform);
        audioController.setReverb(reverbValue);
        audioController.setDecay(decayValue);

        modal.style.display = 'none';
    });
    const startButton = document.getElementById('start-button');
    let context;
    let score = 0;
    let timeLeft = 240;
    let correctNotes = [];
    let currentScale = '';
    let notesToHighlight = [];

    function initializeAudioContext() {
        if (!context) {
            context = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (context.state === 'suspended') {
            context.resume();
        }
    }

    startButton.addEventListener('click', function() {
        initializeAudioContext();
        startGame();
    });

    document.querySelectorAll('.fret button').forEach(button => {
        button.addEventListener('click', handleFretClick);
    });

    function handleFretClick(event) {
        const button = event.target;
        const string = button.getAttribute('data-string');
        const fret = button.getAttribute('data-fret');
        const note = button.getAttribute('data-note');

        if (note) {
            audioController.playNoteWithReverb(note);
        }

        const positionIndex = correctNotes.findIndex(position => position.string === string && position.fret === fret);
        if (positionIndex !== -1) {
            score += 10;
            updateScore();
            button.classList.add('correct');
            correctNotes.splice(positionIndex, 1);
            if (correctNotes.length === 0) {
                nextRound();
            }
        } else {
            score -= 5;
            timeLeft -= 5;
            updateScore();
            button.classList.add('wrong');
            setTimeout(() => button.classList.remove('wrong'), 1000);
        }
    }

    function getRandomScalePosition() {
        const isAdvancedLevel = score > 450;
        const positions = isAdvancedLevel ? { ...scalePositions, ...modePositions } : scalePositions;
        const scaleNames = Object.keys(positions);
        const randomIndex = Math.floor(Math.random() * scaleNames.length);
        return scaleNames[randomIndex];
    }

    function startGame() {
        score = 0;
        timeLeft = 240;
        updateScore();
        updateTime();
        startTimer();
        nextRound();
    }

    function nextRound() {
        clearHighlights();
        correctNotes = [];
        notesToHighlight = [];
    
        currentScale = getRandomScalePosition();
    
        const levelElement = document.getElementById("level");
        if (levelElement) {
            levelElement.innerHTML = `<h4>Identify the positions for the</h4><h4 style="color:black; font-weight: bold;"> ${currentScale} </h4><h4> scale.</h4>`;
        }
    
        notesToHighlight = scalePositions[currentScale] || modePositions[currentScale];
        correctNotes = [...notesToHighlight];
    
        document.querySelectorAll('.fret button').forEach(button => {
            button.classList.remove('correct', 'wrong');
        });
    
        console.log("Next round for scale: " + currentScale);
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
