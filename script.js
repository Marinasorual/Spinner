class LuckSpinner {
    constructor(spinnerId, pointerClass) {
        this.spinnerCanvas = document.getElementById(spinnerId);
        this.ctx = this.spinnerCanvas.getContext('2d');
        this.spinnerSize = this.spinnerCanvas.width;
        this.sections = [];
        this.rotation = 0;
        this.spinning = false;
        this.spinSpeed = 0;
        this.acceleration = 0.4;
        this.deceleration = 0.1;
        this.maxSpeed = 30;
        this.spinInterval = null;
        this.language = 'en';

        this.texts = {
            en: {
                title: 'Luck Spinner',
                addSection: 'Add Section',
                enterFirstNumber: 'Enter the first number',
                enterLastNumber: 'Enter the last number',
                spin: 'Spin',
                stop: 'Stop',
                emptySectionMessage: 'Section name is either empty or already exists.',
                noSectionsMessage: 'Add at least one section to spin!',
                congratulationsMessage: 'Congratulations! The spinner stopped on: ',
                switchLanguage: 'Switch to Arabic'
            },
            ar: {
                title: 'عجلة الحظ',
                addSection: 'إضافة قسم',
                enterFirstNumber: 'أدخل الرقم الأول',
                enterLastNumber: 'أدخل الرقم الأخير',
                spin: 'ادور',
                stop: 'توقف',
                emptySectionMessage: 'اسم القسم إما فارغ أو موجود بالفعل.',
                noSectionsMessage: 'أضف قسمًا واحدًا على الأقل لتدوير!',
                congratulationsMessage: 'تهانينا! توقفت العجلة عند: ',
                switchLanguage: 'التبديل إلى الإنجليزية'
            }
        };

        this.sounds = {
            add: new Audio('sounds/add.mp3'),
            delete: new Audio('sounds/delete.mp3'),
            stop: new Audio('sounds/delete.mp3'),
            spinning: new Audio('sounds/spin.mp3'),
            spin: new Audio('sounds/spin.mp3'),
            background: new Audio('sounds/background1.mp3')
        };

        Object.values(this.sounds).forEach((sound) => {
            sound.volume = 0.4; // Set lower volume
        });
        this.sounds.spinning.loop = true;
        this.sounds.background.loop = true;

        this.defaultBackgroundImage = new Image();
        this.defaultBackgroundImage.src = 'logo.png';
        this.sectionsBackgroundImage = new Image();
        this.sectionsBackgroundImage.src = 'logo.png';

        this.defaultBackgroundImage.onload = () => {
            this.updateSpinner();
        };

        this.sectionsBackgroundImage.onload = () => {
            this.updateSpinner();
        };

        this.init();
    }

    init() {
        document.getElementById('add-range').addEventListener('click', () => {
            this.sounds.add.pause();
            this.sounds.add.currentTime = 0;
            this.addRange();
        });

        document.getElementById('spin-button').addEventListener('click', () => {
            this.sounds.spin.pause();
            this.sounds.spin.currentTime = 0;
            this.startSpin();
        });

        document.getElementById('stop-button').addEventListener('click', () => {
            this.sounds.stop.pause();
            this.sounds.stop.currentTime = 0;
            this.initiateStop();
        });

        document.getElementById('clear-sections').addEventListener('click', () => {
            this.clearSections();
        });

        document.getElementById('language-switcher').addEventListener('click', () => {
            this.switchLanguage();
        });

        document.addEventListener('click', () => {
            this.sounds.background.play();
        }, { once: true });

        this.updateSpinner();
        this.updateSectionTable();
        this.createSnow();
        this.updateLanguage();
    }

    switchLanguage() {
        this.language = this.language === 'en' ? 'ar' : 'en';
        this.updateLanguage();
    }

    updateLanguage() {
        const texts = this.texts[this.language];

        document.getElementById('title').innerText = texts.title;
        document.getElementById('start-number').placeholder = texts.enterFirstNumber;
        document.getElementById('end-number').placeholder = texts.enterLastNumber;
        document.getElementById('add-range').innerText = texts.addSection;
        document.getElementById('spin-button').innerText = texts.spin;
        document.getElementById('stop-button').innerText = texts.stop;
        document.getElementById('clear-sections').innerText = 'Clear Sections';
        document.getElementById('language-switcher').innerText = texts.switchLanguage;

        document.body.dir = this.language === 'ar' ? 'rtl' : 'ltr';
    }

    addRange() {
        const start = parseInt(document.getElementById('start-number').value, 10);
        const end = parseInt(document.getElementById('end-number').value, 10);

        if (isNaN(start) || isNaN(end) || start > end) {
            this.showSnackbar(this.texts[this.language].emptySectionMessage);
            return;
        }

        for (let i = start; i <= end; i++) {
            if (!this.sections.includes(i.toString())) {
                this.sections.push(i.toString());
            }
        }

        document.getElementById('start-number').value = '';
        document.getElementById('end-number').value = '';
        this.sounds.add.play();
        this.updateSpinner();
        this.updateSectionTable();
    }

    removeSection(index) {
        this.sections.splice(index, 1);
        this.sounds.delete.pause();
        this.sounds.delete.currentTime = 0;
        this.sounds.delete.play();
        this.updateSpinner();
        this.updateSectionTable();
    }

    clearSections() {
        this.sections = [];
        this.updateSpinner();
        this.updateSectionTable();
    }

    updateSpinner() {
        const radius = this.spinnerCanvas.width / 2;
        const totalSections = this.sections.length || 1;
        const anglePerSection = (2 * Math.PI) / totalSections;

        this.ctx.clearRect(0, 0, this.spinnerCanvas.width, this.spinnerCanvas.height);

        if (this.sections.length === 0) {
            this.ctx.drawImage(this.defaultBackgroundImage, 0, 0, this.spinnerSize, this.spinnerSize);
        } else {
            this.ctx.drawImage(this.sectionsBackgroundImage, 0, 0, this.spinnerSize, this.spinnerSize);
        }

        this.sections.forEach((section, index) => {
            const startAngle = index * anglePerSection;
            const endAngle = startAngle + anglePerSection;

            this.ctx.beginPath();
            this.ctx.moveTo(radius, radius);
            this.ctx.arc(radius, radius, radius, startAngle, endAngle);
            this.ctx.fillStyle = this.getColor(index, 0.8);
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();

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

    getColor(index, alpha = 1) {
        const colors = [
            `rgba(255, 69, 0, ${alpha})`,
            `rgba(255, 215, 0, ${alpha})`,
            `rgba(76, 175, 80, ${alpha})`,
            `rgba(0, 191, 255, ${alpha})`,
            `rgba(255, 105, 180, ${alpha})`
        ];
        return colors[index % colors.length];
    }

    startSpin() {
        if (this.spinning || this.sections.length === 0) {
            this.showSnackbar(this.texts[this.language].noSectionsMessage);
            return;
        }

        this.spinning = true;
        this.spinSpeed = 1;
        this.sounds.spin.play();
        this.sounds.spinning.play();

        document.getElementById('spin-button').style.display = 'none';
        document.getElementById('stop-button').style.display = 'inline';
        document.getElementById('stop-button').disabled = false;
        document.getElementById('stop-button').classList.remove('dimmed');

        this.spinInterval = setInterval(() => this.spin(), 16);
    }

    initiateStop() {
        if (!this.spinning) return;

        document.getElementById('stop-button').disabled = true;
        document.getElementById('stop-button').classList.add('dimmed');

        this.spinning = false;
    }

    stopSpin() {
        document.getElementById('spin-button').style.display = 'inline';
        document.getElementById('stop-button').style.display = 'none';

        clearInterval(this.spinInterval);
        this.spinInterval = null;

        const winnerIndex = this.getWinner();
        this.showSnackbar(this.texts[this.language].congratulationsMessage + this.sections[winnerIndex]);

        this.sounds.spinning.pause();
        this.sounds.stop.play();
    }

    spin() {
        if (!this.spinning && this.spinSpeed <= 0) return;

        this.rotation += this.spinSpeed;
        this.spinSpeed = this.spinning
            ? Math.min(this.spinSpeed + this.acceleration, this.maxSpeed)
            : Math.max(this.spinSpeed - this.deceleration, 0);

        this.spinnerCanvas.style.transform = `rotate(${this.rotation}deg)`;

        if (!this.spinning && this.spinSpeed <= 0) this.stopSpin();
    }

    getWinner() {
        const totalSections = this.sections.length;
        const anglePerSection = 360 / totalSections;
        const normalizedRotation = (this.rotation % 360 + 360) % 360;

        const winningIndex = (Math.floor((normalizedRotation + anglePerSection / 2) / anglePerSection) + totalSections) % totalSections;

        return winningIndex;
    }

    updateSectionTable() {
        const list = document.getElementById('sections-list');
        list.innerHTML = '';
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

    showSnackbar(message) {
        const snackbar = document.getElementById('snackbar');
        const messageElement = document.getElementById('snackbar-message');
        const starsElement = document.getElementById('snackbar-stars');
        const progressBar = document.getElementById('snackbar-progress');
        let snackbarTimeout;

        // Clear any existing timeout or animations
        clearTimeout(snackbarTimeout);
        snackbar.className = '';
        starsElement.innerHTML = ''; // Clear stars

        // Set message and prepare stars animation
        messageElement.innerText = message;
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('span');
            star.innerText = '★';
            star.style.animationDelay = `${i * 0.3}s`;
            starsElement.appendChild(star);
        }

        // Show the snackbar
        snackbar.className = 'show';

        // Reset and animate the progress bar
        progressBar.style.transition = 'none';
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.style.transition = 'width 20s linear';
            progressBar.style.width = '0%';
        }, 20);

        snackbarTimeout = setTimeout(() => {
            snackbar.className = snackbar.className.replace('show', '');
        }, 20000);
    }
}

const spinner = new LuckSpinner('spinner', 'pointer');