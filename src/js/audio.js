export class AudioController {
    constructor() {
        this.audioContext = null;
        this.reverbDuration = 1.5;
        this.reverbDecay = 1;
        this.waveform = 'triangle';
        this.delayTime = 0.3; // Default delay time in seconds
    }

    initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setWaveform(waveform) {
        this.waveform = waveform;
    }

    setReverb(value) {
        this.reverbDuration = value / 100 * 5;
    }

    setDecay(value) {
        this.reverbDecay = value / 100 * 10;
    }

    setDelay(value) {
        this.delayTime = value / 100; // Convert percentage to delay time (0-1 seconds)
    }

    calculateFrequency(note) {
        const baseFrequencies = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
            'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
        };
        const match = note.match(/([A-G]#?)(\d)/);
        if (!match) {
            throw new Error('Invalid note format');
        }
        const [noteName, octave] = match.slice(1, 3);
        const baseNote = noteName + '4';
        const baseFrequency = baseFrequencies[baseNote];
        const octaveDifference = octave - 4;
        return baseFrequency * Math.pow(2, octaveDifference);
    }

    playNoteWithReverb(note) {
        this.initializeAudioContext();
        const frequency = this.calculateFrequency(note);
        this.playFrequencyWithReverbAndDelay(frequency);
    }

    playFrequencyWithReverbAndDelay(frequency) {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = this.waveform;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const convolver = this.audioContext.createConvolver();
        convolver.buffer = this.createImpulseResponse(this.reverbDuration, this.reverbDecay);

        const delayNode = this.audioContext.createDelay();
        delayNode.delayTime.value = this.delayTime; // Apply delay time

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.9;

        oscillator.connect(gainNode);
        gainNode.connect(convolver);
        convolver.connect(delayNode);
        delayNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    createImpulseResponse(duration, decay) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        const impulseL = impulse.getChannelData(0);
        const impulseR = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = length - i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        }

        return impulse;
    }
}

export default AudioController;
