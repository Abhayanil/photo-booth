export class StripGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.padding = 40;
        this.innerPadding = 20;
        this.spacing = 30;
    }

    async generateStrip(images) {
        // Assume all images have the same dimensions
        const imgWidth = images[0].naturalWidth || 640;
        const imgHeight = images[0].naturalHeight || 480;

        // Calculate canvas size
        const canvasWidth = imgWidth + (this.padding * 2);
        const canvasHeight = (imgHeight * images.length) + (this.spacing * (images.length - 1)) + (this.padding * 2) + 120; // Extra room for branding

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // Fill background (Creamy retro paper color)
        this.ctx.fillStyle = '#faf9f6';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw images
        images.forEach((img, index) => {
            const y = this.padding + (index * (imgHeight + this.spacing));

            // Subtle shadow for each photo
            this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            this.ctx.drawImage(img, this.padding, y, imgWidth, imgHeight);

            // Border around each image
            this.ctx.shadowBlur = 0;
            this.ctx.strokeStyle = '#eeeeee';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.padding, y, imgWidth, imgHeight);
        });

        // Add Date/Time Stamp (Dot-matrix style)
        const now = new Date();
        const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        this.ctx.fillStyle = '#b0bec5';
        this.ctx.font = '24px "Courier New", Courier, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`MEMO-MATIC AUTO-CAPTURE // ${dateStr}`, canvasWidth / 2, canvasHeight - 60);

        // Add a "serial number" or aesthetic branding
        this.ctx.font = '16px "Courier New", Courier, monospace';
        this.ctx.fillText('NO. ' + Math.random().toString(36).substr(2, 9).toUpperCase(), canvasWidth / 2, canvasHeight - 30);

        return this.canvas.toDataURL('image/png');
    }
}
