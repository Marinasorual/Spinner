class LuckSpinner {
    constructor(spinnerId, pointerClass) {
        this.spinnerCanvas = document.getElementById(spinnerId);
        this.ctx = this.spinnerCanvas.getContext('2d');
        this.spinnerSize = this.spinnerCanvas.width; // Assume square canvas
        this.sections = [];
        this.rotation = 0;
        this.spinning = false;
        this.spinSpeed = 0;
        this.acceleration = 0.5; // Speed increase during spin
        this.deceleration = 0.2; // Speed decrease when slowing
        this.maxSpeed = 15; // Maximum spin speed
        this.spinInterval = null;

        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'logo.png';
        this.isBackgroundDrawn = false;  // Flag to track if background is already drawn
        this.backgroundImage.onload = () => {
            this.isBackgroundDrawn = true;  // Set the flag once the image is loaded
            this.updateSpinner();  // Now update the spinner after image is loaded
        };

        this.init();
    }

    init() {
        document.getElementById('add-section').addEventListener('click', () => this.addSection());
        document.getElementById('section-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.addSection();
        });

        document.getElementById('spin-button').addEventListener('click', () => this.startSpin());
        document.getElementById('stop-button').addEventListener('click', () => this.stopSpin());

        this.updateSpinner();
        this.updateSectionTable();
        this.createSnow(); // Adds snowfall effect
    }

    addSection() {
        const input = document.getElementById('section-input');
        const sectionName = input.value.trim();
        if (sectionName && !this.sections.includes(sectionName)) {
            this.sections.push(sectionName);
            input.value = '';
            this.updateSpinner();
            this.updateSectionTable();
        } else {
            alert('Section name is either empty or already exists.');
        }
    }

    removeSection(index) {
        this.sections.splice(index, 1);
        this.updateSpinner();
        this.updateSectionTable();
    }

    updateSpinner() {
        const radius = this.spinnerCanvas.width / 2;
        const totalSections = this.sections.length || 1;
        const anglePerSection = (2 * Math.PI) / totalSections;
    
        // Clear canvas, but keep the background image if already loaded
        this.ctx.clearRect(0, 0, this.spinnerCanvas.width, this.spinnerCanvas.height);
    
        // Draw background image if it's loaded and not drawn already
        if (this.isBackgroundDrawn) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.spinnerSize, this.spinnerSize);
        }
    
        // Draw sections
        this.sections.forEach((section, index) => {
            const startAngle = index * anglePerSection;
            const endAngle = startAngle + anglePerSection;
    
            // Draw pie slice
            this.ctx.beginPath();
            this.ctx.moveTo(radius, radius);
            this.ctx.arc(radius, radius, radius, startAngle, endAngle);
            this.ctx.fillStyle = this.getColor(index);
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
    
            // Add section text
            this.ctx.save();
            this.ctx.translate(radius, radius);
            this.ctx.rotate(startAngle + anglePerSection / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(section, radius - 10, 5);
            this.ctx.restore();
        });
    }
    
    getColor(index) {
        const colors = ['#FF4500', '#FFD700', '#4CAF50', '#00BFFF', '#FF69B4'];
        return colors[index % colors.length];
    }

    startSpin() {
        if (this.spinning || this.sections.length === 0) {
            alert('Add at least one section to spin!');
            return;
        }

        this.spinning = true;
        this.spinSpeed = 1; // Initial spin speed
        document.getElementById('spin-button').style.display = 'none';
        document.getElementById('stop-button').style.display = 'inline';

        this.spinInterval = setInterval(() => this.spin(), 16);
    }

    stopSpin() {
        if (!this.spinning) return;
        this.spinning = false;

        document.getElementById('spin-button').style.display = 'inline';
        document.getElementById('stop-button').style.display = 'none';

        clearInterval(this.spinInterval);
        this.spinInterval = null;

        const winnerIndex = this.getWinner();
        alert(`Congratulations! The spinner stopped on: ${this.sections[winnerIndex]}`);
    }

    spin() {
        if (!this.spinning) return;

        this.rotation += this.spinSpeed;
        this.spinSpeed = Math.min(this.spinSpeed + this.acceleration, this.maxSpeed);

        // Randomly start deceleration after reaching max speed
        if (this.spinSpeed >= this.maxSpeed && Math.random() > 0.98) {
            this.spinSpeed = Math.max(this.spinSpeed - this.deceleration, 0);
        }

        this.spinnerCanvas.style.transform = `rotate(${this.rotation}deg)`;

        // Stop spinning when speed reaches zero
        if (this.spinSpeed <= 0) this.stopSpin();
    }

    getWinner() {
        const totalSections = this.sections.length;
        const anglePerSection = 360 / totalSections;
        const normalizedRotation = (this.rotation % 360 + 360) % 360; // Normalize rotation to 0-360 degrees
        const winningIndex = Math.floor((360 - normalizedRotation) / anglePerSection) % totalSections;
        return winningIndex;
    }

    updateSectionTable() {
        const list = document.getElementById('sections-list');
        list.innerHTML = ''; // Clear existing list
        this.sections.forEach((section, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${section}</td>
                <td><button class="delete" onclick="spinner.removeSection(${index})">❌</button></td>
            `;
            list.appendChild(row);
        });
    }

    createSnow() {
        const snowContainer = document.getElementById('snow');
        for (let i = 0; i < 50; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.style.left = Math.random() * window.innerWidth + 'px';
            snowflake.style.animationDuration = Math.random() * 3 + 3 + 's';
            snowflake.style.opacity = Math.random();
            snowContainer.appendChild(snowflake);
        }
    }
}

// Initialize spinner
const spinner = new LuckSpinner('spinner', 'pointer');
