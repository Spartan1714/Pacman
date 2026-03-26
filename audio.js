const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, type = "square", volume = 0.1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

export const sounds = {
    dot: () => playTone(440, 0.1, "sine", 0.05),
    cherry: () => {
        playTone(523, 0.1);
        setTimeout(() => playTone(659, 0.1), 100);
        setTimeout(() => playTone(783, 0.2), 200);
    },
    death: () => playTone(110, 0.5, "sawtooth", 0.2),
    ghostEat: () => playTone(880, 0.3, "square", 0.1)
};