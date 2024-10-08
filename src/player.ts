export class VideoPlayer {
  private videoElement: HTMLVideoElement;
  private playPauseButton!: HTMLButtonElement;
  private forwardButton!: HTMLButtonElement;
  private rewindButton!: HTMLButtonElement;
  private muteButton!: HTMLButtonElement;
  private volumeSlider!: HTMLInputElement;
  private controlsContainer!: HTMLDivElement;
  private progressBarContainer!: HTMLDivElement;
  private progressBar!: HTMLDivElement;
  private fullScreenButton!: HTMLButtonElement; // Botón de pantalla completa
  private storageKey: string = "videoPlayerCurrentTime";
  private controlsVisible: boolean = true;
  private hideControlsTimeout: any;
  private videoContainer!: HTMLDivElement;
  private currentTimeDisplay!: HTMLSpanElement;
  private durationDisplay!: HTMLSpanElement;
  private timeIndicator!: HTMLDivElement;

  constructor(videoElementId: string) {
    this.videoElement = document.getElementById(
      videoElementId
    ) as HTMLVideoElement;
    this.videoContainer = this.videoElement.parentNode as HTMLDivElement;
    this.createControls();
    this.createTimeIndicator();
    this.initializeControls();
    this.loadCurrentTime();
    this.addMouseMoveListener();
  }

  // Crear controles
  private createControls() {
    // Crear contenedor de controles
    this.controlsContainer = document.createElement("div");
    this.controlsContainer.className = "video-controls";

    // Crear botón de reproducción/pausa
    this.playPauseButton = document.createElement("button");
    this.playPauseButton.innerHTML = '<i class="fas fa-play"></i>';

    // Crear botón de adelantar
    this.forwardButton = document.createElement("button");
    this.forwardButton.innerHTML = '<i class="fas fa-forward"></i>';
    this.forwardButton.title = "Adelantar 10 segundos";

    // Crear botón de atrasar
    this.rewindButton = document.createElement("button");
    this.rewindButton.innerHTML = '<i class="fas fa-backward"></i>';
    this.rewindButton.title = "Atrasar 10 segundos";

    // Crear botón de mutear
    this.muteButton = document.createElement("button");
    this.muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';

    // Crear control de volumen
    this.volumeSlider = document.createElement("input");
    this.volumeSlider.type = "range";
    this.volumeSlider.min = "0";
    this.volumeSlider.max = "1";
    this.volumeSlider.step = "0.01";
    this.volumeSlider.value = this.videoElement.volume.toString();
    this.volumeSlider.className = "volume-slider";
    this.volumeSlider.style.display = "none";

    // Crear barra de progreso
    this.progressBarContainer = document.createElement("div");
    this.progressBarContainer.className = "progress-bar";

    this.progressBar = document.createElement("div");
    this.progressBar.className = "progress";

    this.progressBarContainer.appendChild(this.progressBar);

    // Crear botón de pantalla completa
    this.fullScreenButton = document.createElement("button");
    this.fullScreenButton.innerHTML = '<i class="fas fa-expand"></i>'; // Icono de pantalla completa

    // Agregar controles al contenedor
    this.controlsContainer.appendChild(this.rewindButton);
    this.controlsContainer.appendChild(this.playPauseButton);
    this.controlsContainer.appendChild(this.forwardButton);
    this.controlsContainer.appendChild(this.muteButton);
    this.controlsContainer.appendChild(this.volumeSlider);
    this.controlsContainer.appendChild(this.progressBarContainer);
    this.controlsContainer.appendChild(this.fullScreenButton); // Agregar botón de pantalla completa

    // Tiempo actual y duración
    this.currentTimeDisplay = document.createElement("span");
    this.currentTimeDisplay.className = "current-time";
    this.currentTimeDisplay.innerText = "00:00";

    this.durationDisplay = document.createElement("span");
    this.durationDisplay.className = "duration-time";
    this.durationDisplay.innerText = "00:00";

    this.controlsContainer.appendChild(this.durationDisplay);

    // Agregar contenedor de controles al contenedor del video
    this.videoContainer.appendChild(this.controlsContainer);
  }

  // Crea el indicador de tiempo
  private createTimeIndicator() {
    this.timeIndicator = document.createElement("div");
    this.timeIndicator.className = "time-indicator";
    this.timeIndicator.innerHTML = `<div class="time-text">00:00</div><div class="arrow-down"></div>`;
    this.progressBarContainer.appendChild(this.timeIndicator);
  }

  // Inicializar controles
  private initializeControls() {
    this.playPauseButton.addEventListener("click", () => {
      if (this.videoElement.paused) {
        this.play();
      } else {
        this.pause();
      }
    });

    this.forwardButton.addEventListener("click", () => {
      this.videoElement.currentTime = Math.min(
        this.videoElement.currentTime + 10,
        this.videoElement.duration
      );
    });

    this.rewindButton.addEventListener("click", () => {
      this.videoElement.currentTime = Math.max(
        this.videoElement.currentTime - 10,
        0
      );
    });

    this.videoElement.addEventListener("loadedmetadata", () => {
      this.updateDurationDisplay();
    });

    this.muteButton.addEventListener("click", () => {
      this.toggleMute();
    });

    this.volumeSlider.addEventListener("input", () => {
      this.videoElement.volume = parseFloat(this.volumeSlider.value);
      this.updateMuteButtonIcon();
    });

    this.videoElement.addEventListener("timeupdate", () => {
      this.updateProgressBar();
      this.updateTimeIndicator(); // Añadir esta línea para actualizar el indicador de tiempo
      this.updateTimeDisplays(); // Actualiza los elementos de tiempo
    });

    this.videoElement.addEventListener("play", () => {
      this.updatePlayPauseIcon();
    });

    this.videoElement.addEventListener("pause", () => {
      this.updatePlayPauseIcon();
      this.saveCurrentTime(this.videoElement.currentTime);
    });

    this.videoElement.addEventListener("ended", () => {
      this.updatePlayPauseIcon();
      this.saveCurrentTime(0);
    });

    window.addEventListener("beforeunload", () => {
      this.saveCurrentTime(this.videoElement.currentTime);
    });

    this.progressBarContainer.addEventListener("click", (event: MouseEvent) => {
      const clickPosition =
        event.offsetX / this.progressBarContainer.offsetWidth;
      const newTime = clickPosition * this.videoElement.duration;
      this.videoElement.currentTime = newTime;
    });

    this.videoContainer.addEventListener("mouseout", () => {
      this.hideControls();
    });

    // Mostrar el slider de volumen al hacer hover en el botón de mutear
    this.muteButton.addEventListener("mouseover", () => {
      this.volumeSlider.style.display = "block"; // Mostrar el slider al hacer hover
    });

    this.muteButton.addEventListener("mouseout", () => {
      this.volumeSlider.style.display = "none"; // Ocultar el slider cuando el mouse sale
    });

    this.volumeSlider.addEventListener("mouseover", () => {
      this.volumeSlider.style.display = "block"; // Mantener el slider visible mientras el mouse esté sobre él
    });

    this.volumeSlider.addEventListener("mouseout", () => {
      this.volumeSlider.style.display = "none"; // Ocultar el slider cuando el mouse sale
    });

    // Listener para botón de pantalla completa
    this.fullScreenButton.addEventListener("click", () => {
      if (this.videoContainer.requestFullscreen) {
        this.videoContainer.requestFullscreen();
      } else if ((this.videoContainer as any).webkitRequestFullscreen) {
        // Safari
        (this.videoContainer as any).webkitRequestFullscreen();
      } else if ((this.videoContainer as any).msRequestFullscreen) {
        // IE
        (this.videoContainer as any).msRequestFullscreen();
      }
    });

    // Listener para salir de pantalla completa
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        this.exitFullScreen();
      }
    });

    document.addEventListener("webkitfullscreenchange", () => {
      //@ts-ignore
      if (!document.webkitFullscreenElement) {
        this.exitFullScreen();
      }
    });

    document.addEventListener("msfullscreenchange", () => {
      //@ts-ignore
      if (!document.msFullscreenElement) {
        this.exitFullScreen();
      }
    });
  }

  private exitFullScreen() {
    // Aquí puedes agregar lógica adicional si necesitas manejar algún estado al salir de pantalla completa.
  }

  private updateTimeDisplays() {
    const currentTime = this.videoElement.currentTime;
    this.currentTimeDisplay.innerText = this.formatTime(currentTime);
  }

  private updateDurationDisplay() {
    const duration = this.videoElement.duration;
    this.durationDisplay.innerText = this.formatTime(duration);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${this.padZero(minutes)}:${this.padZero(secs)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
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
    const percentage =
      (this.videoElement.currentTime / this.videoElement.duration) * 100;
    this.progressBar.style.width = `${percentage}%`;
  }

  private updateTimeIndicator() {
    const progressBarRect = this.progressBarContainer.getBoundingClientRect();
    const progressWidth = this.progressBar.getBoundingClientRect().width;

    const time = this.videoElement.currentTime;
    const formattedTime = this.formatTime(time);
    (this.timeIndicator.querySelector(".time-text") as HTMLElement).innerText =
      formattedTime;

    // Calcular la posición
    const offset = 18; // Desplazamiento adicional en píxeles
    const indicatorPosition =
      Math.min(
        progressBarRect.width - this.timeIndicator.offsetWidth / 2,
        progressWidth - this.timeIndicator.offsetWidth / 2
      ) + offset; // Añadir el desplazamiento

    this.timeIndicator.style.left = `${indicatorPosition}px`;
  }

  private updatePlayPauseIcon() {
    this.playPauseButton.innerHTML = this.videoElement.paused
      ? '<i class="fas fa-play"></i>'
      : '<i class="fas fa-pause"></i>';
  }

  private toggleMute() {
    this.videoElement.muted = !this.videoElement.muted;
    this.updateMuteButtonIcon();
  }

  private updateMuteButtonIcon() {
    this.muteButton.innerHTML = this.videoElement.muted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  }

  private addMouseMoveListener() {
    this.videoContainer.addEventListener("mousemove", () => {
      clearTimeout(this.hideControlsTimeout);
      this.showControls();
      this.hideControlsTimeout = setTimeout(() => this.hideControls(), 3000);
    });
  }

  private showControls() {
    this.controlsContainer.style.opacity = "1";
    this.controlsVisible = true;
  }

  private hideControls() {
    this.controlsContainer.style.opacity = "0";
    this.controlsVisible = false;
  }

  public play() {
    this.videoElement.play();
  }

  public pause() {
    this.videoElement.pause();
  }
}
