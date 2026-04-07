// audio.js

export const bgMusic = new Audio("./sounds/fondo.wav");
bgMusic.loop = true;
bgMusic.volume = 0.4;

// efectos
export const sfx = {
    //eat: new Audio("./sounds/eat.wav"),
    death: new Audio("./sounds/death.wav"),
    gameover: new Audio("./sounds/gameover.wav"),
    levelup: new Audio("./sounds/levelup.wav"),
    cherry: new Audio("./sounds/cherry.wav"),
};

// volumen efectos
Object.values(sfx).forEach(a => {
    a.volume = 0.6;
});

// reproducir sin solaparse mal
export function playSfx(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}