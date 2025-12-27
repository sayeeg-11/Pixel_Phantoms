const canvas = document.getElementById('signalCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 1000; // 1000 Signals

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Signal());
    }
}

class Signal {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 2 + 0.5;
        this.length = Math.random() * 80 + 40;
        this.color = Math.random() > 0.5 ? '#00aaff' : '#bc13fe';
        this.opacity = Math.random() * 0.4;
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();
            this.y = -this.length;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => p.draw());
    requestAnimationFrame(animate);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animate();