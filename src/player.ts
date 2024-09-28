export class VideoPlayer {
    private videoElement: HTMLVideoElement;
    private playPauseButton!: HTMLButtonElement;
    private forwardButton!: HTMLButtonElement;
    private rewindButton!: HTMLButtonElement;
    private controlsContainer!: HTMLDivElement;
    private progressBarContainer!: HTMLDivElement;
    private progressBar!: HTMLDivElement;
    private storageKey: string = 'videoPlayerCurrentTime';
    private controlsVisible: boolean = true;
    private hideControlsTimeout: any; // Para almacenar el timeout
    private videoContainer!: HTMLDivElement; // Contenedor del video

    constructor(videoElementId: string) {
        this.videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
        this.videoContainer = this.videoElement.parentNode as HTMLDivElement; // Obtener el contenedor del video
        this.createControls();
        this.initializeControls();
        this.loadCurrentTime();
        this.addMouseMoveListener();
    }

    private createControls() {
        // Crear contenedor de controles
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'video-controls';

        // Crear botón de reproducción/pausa
        this.playPauseButton = document.createElement('button');
        this.playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Ícono inicial de reproducción

        // Crear botón de adelantar
        this.forwardButton = document.createElement('button');
        this.forwardButton.innerHTML = '<i class="fas fa-forward"></i>'; // Ícono de adelantar
        this.forwardButton.title = 'Adelantar 10 segundos';

        // Crear botón de atrasar
        this.rewindButton = document.createElement('button');
        this.rewindButton.innerHTML = '<i class="fas fa-backward"></i>'; // Ícono de atrasar
        this.rewindButton.title = 'Atrasar 10 segundos';

        // Crear barra de progreso
        this.progressBarContainer = document.createElement('div');
        this.progressBarContainer.className = 'progress-bar';

        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress';

        this.progressBarContainer.appendChild(this.progressBar);

        // Agregar botones y barra de progreso al contenedor de controles
        this.controlsContainer.appendChild(this.rewindButton);
        this.controlsContainer.appendChild(this.playPauseButton);
        this.controlsContainer.appendChild(this.forwardButton);
        this.controlsContainer.appendChild(this.progressBarContainer);

        // Agregar contenedor de controles al contenedor del video
        this.videoContainer.appendChild(this.controlsContainer);
    }

    private initializeControls() {
        this.playPauseButton.addEventListener('click', () => {
            if (this.videoElement.paused) {
                this.play();
            } else {
                this.pause();
            }
        });

        // Evento para adelantar 10 segundos
        this.forwardButton.addEventListener('click', () => {
            this.videoElement.currentTime = Math.min(this.videoElement.currentTime + 10, this.videoElement.duration);
        });

        // Evento para atrasar 10 segundos
        this.rewindButton.addEventListener('click', () => {
            this.videoElement.currentTime = Math.max(this.videoElement.currentTime - 10, 0);
        });

        this.videoElement.addEventListener('timeupdate', () => {
            this.updateProgressBar();
        });

        this.videoElement.addEventListener('play', () => {
            this.updatePlayPauseIcon(); // Cambiar el ícono cuando se reproduce
        });

        this.videoElement.addEventListener('pause', () => {
            this.updatePlayPauseIcon(); // Cambiar el ícono cuando se pausa
            this.saveCurrentTime(this.videoElement.currentTime);
        });

        this.videoElement.addEventListener('ended', () => {
            this.updatePlayPauseIcon(); // Cambiar el ícono al finalizar el video
            this.saveCurrentTime(0); // Restablecer el tiempo al finalizar
        });

        window.addEventListener('beforeunload', () => {
            this.saveCurrentTime(this.videoElement.currentTime);
        });

        // Hacer clic en la barra de progreso para cambiar la posición del video
        this.progressBarContainer.addEventListener('click', (event: MouseEvent) => {
            const clickPosition = event.offsetX / this.progressBarContainer.offsetWidth;
            const newTime = clickPosition * this.videoElement.duration;
            this.videoElement.currentTime = newTime;
        });

        // Añadir evento de mouseout al contenedor del video
        this.videoContainer.addEventListener('mouseout', () => {
            this.hideControls();
        });
    }

    private loadCurrentTime() {
        const savedTime = localStorage.getItem(this.storageKey);
        if (savedTime) {
            this.videoElement.currentTime = parseFloat(savedTime);
        }
    }

    private saveCurrentTime(time: number) {
        localStorage.setItem(this.storageKey, time.toString());
    }

    private updateProgressBar() {
        const percentage = (this.videoElement.currentTime / this.videoElement.duration) * 100;
        this.progressBar.style.width = `${percentage}%`;
    }

    private updatePlayPauseIcon() {
        if (this.videoElement.paused) {
            this.playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Ícono de reproducción
        } else {
            this.playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; // Ícono de pausa
        }
    }

    private addMouseMoveListener() {
        this.videoContainer.addEventListener('mousemove', () => {
            clearTimeout(this.hideControlsTimeout);
            this.showControls();
            this.hideControlsTimeout = setTimeout(() => this.hideControls(), 3000);
        });
    }

    private showControls() {
        this.controlsContainer.style.opacity = '1'; // Mostrar controles
        this.controlsVisible = true;
    }

    private hideControls() {
        this.controlsContainer.style.opacity = '0'; // Ocultar controles
        this.controlsVisible = false;
    }

    public play() {
        this.videoElement.play();
    }

    public pause() {
        this.videoElement.pause();
    }
}
