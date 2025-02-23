import { Component, Prop, Method, Element, State, Watch, h } from '@stencil/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

type AudioRegion = {
  start: number;
  end: number;
  loop: boolean;
  update: (params: Partial<{ start: number; end: number; loop: boolean }>) => void;
  remove: () => void;
};

@Component({
  tag: 'ws-audio-player',
  styleUrl: 'ws-audio-player.css',
  shadow: true
})
export class WSAudioPlayer {
  @Prop() audio: string;
  @Prop() color: string;
  @Prop() theme: string = 'basic';
  @Prop() audioTitle: string;
  @Prop({ mutable: true }) duration: string;
  @Prop() height: string;
  @Prop() resolution: number = 100;

  @State() isPlaying: boolean = false;
  @State() curTime: string;
  @State() isLooping: boolean = false;
  @State() audioRegions: AudioRegion[] = []; // Typed list of regions

  @Element() el: HTMLElement;
  public wsPlayer;
  private timeUpdateListener: () => void;

  @Watch('audio')
  watchHandler(newValue: string) {
    this.wsPlayer.load(newValue);
  }

  @Method()
  async playpause(): Promise<void> {
    // Toggle playback
    this.wsPlayer.playPause();
    this.isPlaying = this.wsPlayer.isPlaying();
    this.curTime = this.getCurrentTime();

    // Emit the custom event when playback starts
    if (this.isPlaying) {
      this.emitAudioPlayingEvent();
    }
  }

  /**
   * Emit a global event to notify other components of playback
   */
  private emitAudioPlayingEvent(): void {
    const event = new CustomEvent('wsAudioPlaying', {
      detail: { source: this.el }, // Optionally include a reference to this component
      bubbles: true,               // Allow event to bubble up the DOM
      composed: true,              // Allow event to cross shadow DOM boundaries
    });
    window.dispatchEvent(event);
  }

  @Method()
  async toggleLoop(): Promise<void> {
    // Retrieve the RegionsPlugin instance
    const regionsPlugin = this.wsPlayer.plugins.find(
      (plugin) => plugin instanceof RegionsPlugin
    ) as any;

    if (!this.wsPlayer || !regionsPlugin) {
      console.error('RegionsPlugin is not initialized.');
      return;
    }

    // Remove the timeupdate listener
    if (this.timeUpdateListener) {
      this.wsPlayer.un('timeupdate', this.timeUpdateListener); // Remove the stored listener
      this.timeUpdateListener = null; // Reset the reference
    }


    if (this.isLooping) {
      // Disable looping
      regionsPlugin.clearRegions(); // Remove regions from UI
      this.wsPlayer.un('timeupdate'); // Unsubscribe the timeupdate loop logic
      this.isLooping = false;
    } else {
      // Enable looping
      await this.enableFullTrackLoop(); // Set up the region and looping
      this.isLooping = true;
      this.isPlaying = true;
    }
  }

  @Method()
  async enableFullTrackLoop(): Promise<void> {
    // Fetch the RegionsPlugin instance
    const regionsPlugin = this.wsPlayer.plugins.find(
      (plugin) => plugin instanceof RegionsPlugin
    ) as any;

    if (!this.wsPlayer || !regionsPlugin) {
      console.error('WaveSurfer or RegionsPlugin is not initialized.');
      return;
    }

    // Ensure the audio is loaded
    const duration = this.wsPlayer.getDuration();
    if (!duration || duration <= 0) {
      console.error('Invalid track duration. Cannot create a loop region.');
      return;
    }

    // Clear all existing regions
    regionsPlugin.clearRegions();

    // Add a new region for looping
    const region = regionsPlugin.addRegion({
      start: 0,                // Start slightly after the beginning
      end: duration - 0.1,       // End slightly before the duration
      loop: true,                // Highlight that it's a loop region
      color: 'rgba(255,0,0,0.5)' // Visual feedback for region
    });

    // Set up manual timeupdate-based looping
    const loopStart = region.start;
    const loopEnd = region.end;

    // Remove any previous listener before adding a new one
    if (this.timeUpdateListener) {
      this.wsPlayer.un('timeupdate', this.timeUpdateListener); // Remove existing listener
    }

    // Define the timeupdate listener and store it
    this.timeUpdateListener = () => {
      const currentTime = this.wsPlayer.getCurrentTime();
      if (currentTime >= loopEnd) {
        this.wsPlayer.play(loopStart); // Restart playback from loop start
      }
    };
    this.wsPlayer.on('timeupdate', this.timeUpdateListener); // Attach the listener


    // Explicitly start playback
    this.wsPlayer.play(loopStart);
  }

  @Method()
  async setLoop(enable: boolean): Promise<void> {
    this.wsPlayer.on('finish', () => {
      if (enable) this.wsPlayer.play();
    });

    if (!enable) {
      this.wsPlayer.un('finish');
    }
  }

  @Method()
  async create(): Promise<void> {
    const container = this.el.shadowRoot.querySelector('#wavesurfer') as HTMLElement; // Use a type assertion

    if (!container) {
      console.error('WaveSurfer container element not found!');
      return;
    }

    this.wsPlayer = WaveSurfer.create({
      container: container, // Now correctly typed as HTMLElement
      plugins: [
        RegionsPlugin.create({
          dragSelection: false,
        } as any),
      ],
      waveColor: this.color,
      progressColor: '#666666',
      height: parseInt(this.height, 10) || 512,
      barWidth: this.calculateBarWidth(),
    });

    this.wsPlayer.load(this.audio);

    this.wsPlayer.on('audioprocess', (currentTime: number) => {
        this.curTime = this.formatTime(currentTime);
    });


    // Add the event listener for when playback finishes
    this.wsPlayer.on('finish', () => {
      if (!this.isLooping) {
        this.isPlaying = false; // Update the isPlaying state
      }
    });

    // Add a listener for global playback events
    window.addEventListener('wsAudioPlaying', (event: CustomEvent) => {
      if (event.detail.source !== this.el) {
        // If this is not the source component, pause playback
        if (this.isPlaying) {
          this.wsPlayer.pause();
          this.isPlaying = false; // Update the state
        }
      }
    });

    return new Promise((resolve) => {
      this.wsPlayer.on('ready', () => {
        this.duration = this.formatTime(this.wsPlayer.getDuration());
        this.curTime = this.formatTime(this.wsPlayer.getCurrentTime());
        resolve();
      });
    });
  }

  calculateBarWidth(): number {
    const maxBarWidth = 10; // Maximum bar width at resolution = 0
    const normalizedResolution = Math.min(Math.max(this.resolution, 0), 100); // Clamp resolution between 0 and 100
    return maxBarWidth * (1 - normalizedResolution / 100); // Linearly scale widthefault example value
  }

  componentDidLoad() {
    this.create();
  }

  getCurrentTime() {
    return this.formatTime(this.wsPlayer.getCurrentTime());
  }

  formatTime(time) {
    const sec_num = parseInt(time, 10);
    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - hours * 3600) / 60);
    const seconds = sec_num - hours * 3600 - minutes * 60;
    const hoursStr = hours < 10 ? '0' + hours : hours.toString();
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();

    if (hours > 0) {
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    } else {
      return `${minutesStr}:${secondsStr}`;
    }
  }

  render() {
    return (
      <div class={'wsap-container ' + this.theme}>
        <div class="player-header">
          <div title="Audio Title" class="title">
            <h3>{this.audioTitle}</h3>
          </div>
          <button title="toggle loop" class={`loop ${this.isLooping ? 'active' : ''}`} onClick={() => this.toggleLoop()}>
            <div class="loop-symbol">
              <svg width="30px" height="30px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path fill="var(--ci-primary-color, #000000)" d="M464,210.511V264A112.127,112.127,0,0,1,352,376H78.627l44.686-44.687-22.626-22.626L56,353.373l-4.415,4.414L18.019,391.354,92.041,474.63l23.918-21.26L75.63,408H352c79.4,0,144-64.6,144-144V178.511Z" class="ci-primary"/>
                <path fill="var(--ci-primary-color, #000000)" d="M48,256A112.127,112.127,0,0,1,160,144H433.373l-44.686,44.687,22.626,22.626L456,166.627l4.117-4.116,33.864-33.865L419.959,45.37,396.041,66.63,436.37,112H160C80.6,112,16,176.6,16,256v85.787l32-32Z" class="ci-primary"/>
              </svg>
            </div>
          </button>
          <div title="Current Time" class="current-time">
            {this.curTime}
          </div>
          <div title="Total Time" class="total-time">
            {this.duration}
          </div>
        </div>

        <div class="player-main">
          <div class="wsap-left-controls">
            <div class="left-control-container">
              <button title="play/pause" class="play-pause" onClick={() => this.playpause()}>
                <div class={'symbol ' + (this.isPlaying ? ' paused' : 'playing')}></div>
              </button>
            </div>
          </div>
          <div id="wavesurfer"></div>
        </div>
      </div>
    );
  }
}
