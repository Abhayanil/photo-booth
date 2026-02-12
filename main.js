import { Camera } from './camera.js';
import { StripGenerator } from './canvas.js';

class PhotoboothApp {
    constructor() {
        // UI Elements
        this.video = document.getElementById('webcam');
        this.startBtn = document.getElementById('start-btn');
        this.flash = document.getElementById('flash');
        this.countdownEl = document.getElementById('countdown');
        this.statusEl = document.getElementById('status');
        this.developingArea = document.getElementById('developing-area');
        this.photoStrip = document.getElementById('photo-strip');
        this.resultModal = document.getElementById('result-modal');
        this.finalPreview = document.getElementById('final-preview');
        this.downloadLink = document.getElementById('download-link');
        this.closeModalBtn = document.getElementById('close-modal');
        this.captureCanvas = document.getElementById('capture-canvas');
        this.stripCanvas = document.getElementById('strip-canvas');

        // Logic
        this.camera = new Camera(this.video);
        this.generator = new StripGenerator(this.stripCanvas);
        this.capturedImages = [];
        this.isCapturing = false;

        this.init();
    }

    async init() {
        const success = await this.camera.init();
        if (success) {
            this.statusEl.textContent = 'READY';
            this.startBtn.addEventListener('click', () => this.startSequence());
        } else {
            this.statusEl.textContent = 'CAMERA ERROR';
            this.statusEl.style.color = '#ff3333';
        }

        this.closeModalBtn.addEventListener('click', () => {
            this.resultModal.classList.add('hidden');
            this.reset();
        });
    }

    async startSequence() {
        if (this.isCapturing) return;
        this.isCapturing = true;
        this.capturedImages = [];
        this.startBtn.disabled = true;
        this.photoStrip.innerHTML = '';
        this.statusEl.textContent = 'CAPTURING...';

        for (let i = 0; i < 3; i++) {
            await this.runCountdown(3);
            await this.capture();
        }

        await this.develop();
    }

    async runCountdown(seconds) {
        return new Promise(resolve => {
            let count = seconds;
            this.countdownEl.classList.add('flicker');

            const timer = setInterval(() => {
                this.countdownEl.textContent = count;
                if (count === 0) {
                    clearInterval(timer);
                    this.countdownEl.textContent = '';
                    this.countdownEl.classList.remove('flicker');
                    resolve();
                }
                count--;
            }, 1000);
        });
    }

    async capture() {
        // Trigger Flash
        this.flash.classList.add('flash-active');
        this.camera.vibrate();

        // Capture image
        const dataUrl = this.camera.captureFrame(this.captureCanvas);
        const img = new Image();
        img.src = dataUrl;
        this.capturedImages.push(img);

        // Add to "developing" strip
        const thumb = new Image();
        thumb.src = dataUrl;
        this.photoStrip.appendChild(thumb);

        // Remove flash class after anim
        setTimeout(() => {
            this.flash.classList.remove('flash-active');
        }, 300);

        return new Promise(resolve => setTimeout(resolve, 500));
    }

    async develop() {
        this.statusEl.textContent = 'PRINTING...';
        this.developingArea.classList.remove('hidden');

        // Add "developing" animation
        setTimeout(() => {
            this.developingArea.classList.add('show');
        }, 100);

        // Wait for images to load just in case
        await Promise.all(this.capturedImages.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => img.onload = resolve);
        }));

        // Generate final strip
        const finalDataUrl = await this.generator.generateStrip(this.capturedImages);

        // Show result after animation duration
        setTimeout(() => {
            this.showResult(finalDataUrl);
        }, 2000);
    }

    showResult(dataUrl) {
        this.finalPreview.innerHTML = '';
        const finalImg = new Image();
        finalImg.src = dataUrl;
        this.finalPreview.appendChild(finalImg);

        this.downloadLink.href = dataUrl;
        this.downloadLink.download = `photobooth-${Date.now()}.png`;

        this.resultModal.classList.remove('hidden');
        this.developingArea.classList.add('hidden');
        this.developingArea.classList.remove('show');
        this.statusEl.textContent = 'DONE';
    }

    reset() {
        this.isCapturing = false;
        this.startBtn.disabled = false;
        this.statusEl.textContent = 'READY';
        this.photoStrip.innerHTML = '';
        this.capturedImages = [];
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PhotoboothApp();
});
