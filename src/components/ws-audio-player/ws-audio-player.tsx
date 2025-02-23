import { Component, Prop, Method, Element, State, Watch, h } from '@stencil/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';


/**
 * Represents a defined region in an audio file with a start point, end point, and looping functionality.
 */
interface AudioRegion {
  start: number;
  end: number;
  loop: boolean;
  update: Function;
  remove: Function;
}

/**
 * This class represents a custom audio player component built using WaveSurfer.js, offering
 * functionalities such as play/pause, looping, and region-based audio playback control.
 *
 * Properties managed within the component allow customization of audio appearance,
 * behavior, and additional event handling for a seamless user experience.
 *
 * The component relies on the WaveSurfer.js library to render audio waveforms and manage audio playback.
 * A variety of features including looping regions, event dispatching, and keyboard interactions are supported.
 *
 * Props:
 * - `audio`: URL string of the audio file to be played.
 * - `color`: String for the waveform color.
 * - `progress`: String for the progress bar color (default: "#666666").
 * - `theme`: String indicating the UI theme of the audio player (default: "basic").
 * - `audioTitle`: Title of the audio track.
 * - `duration`: Duration of the audio track (mutable).
 * - `height`: String specifying the height of the waveform.
 * - `resolution`: Resolution value for waveform rendering (default: 100).
 *
 * States:
 * - `isPlaying`: Boolean indicating the current playback state of the audio.
 * - `curTime`: Current playback time of the audio in string format.
 * - `isLooping`: Boolean indicating whether loop mode is active.
 * - `audioRegions`: Array representing the defined audio regions for looping or selection.
 *
 * Methods:
 * - `playpause()`: Toggles between play and pause states for the current audio.
 * - `toggleLoop()`: Enables or disables a full-track looping feature with visual regions.
 * - `enableFullTrackLoop()`: Configures and starts a full-track loop sequence using WaveSurfer.js regions.
 * - `setLoop(enable)`: Globally enables or disables the loop functionality for the audio player.
 * - `create()`: Initializes the WaveSurfer player instance with essential configurations and event listeners.
 *
 * Event Emission:
 * - Emits the `wsAudioPlaying` event when playback starts, sharing audio source details and title.
 *
 * Keyboard Control:
 * - Handles the spacebar keydown event for toggling play/pause, ensuring the key press is valid only within the context of the component.
 *
 * WaveSurfer Instance:
 * - The `wsPlayer` instance provides direct access to WaveSurfer.js methods, such as playback control and region management.
 * - Regions are handled using the `RegionsPlugin` for highlighting and looping selected portions of audio.
 *
 * Shadow DOM:
 * - The component uses Shadow DOM to encapsulate styles and provide a scoped structure for rendering.
 */
@Component({
  tag: 'ws-audio-player',
  styleUrl: 'ws-audio-player.css',
  shadow: true
})
export class WSAudioPlayer {
  @Prop() audio: string;
  @Prop() color: string;
  @Prop() progress: string = '#666666';
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

  /**
   * Toggles the playback state of the media player. If playback is currently ongoing, it will pause; otherwise, it will start/resume.
   *
   * @return {Promise<void>} A promise that resolves when the playback state toggling, state updates, and event emission are complete.
   */
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
   * Emits a custom event 'wsAudioPlaying' to notify listeners that an audio track is playing.
   * The event includes details about the audio source, title, and the component emitting the event.
   * The event bubbles up the DOM and crosses shadow DOM boundaries.
   *
   * @return {void} This method does not return a value.
   */
  private emitAudioPlayingEvent(): void {
    const event = new CustomEvent('wsAudioPlaying', {
      detail: {
        source: this.el,        // A reference to the component
        title: this.audioTitle, // The title of the track being played
        audio: this.audio       // The src of the track
      },
      bubbles: true,   // Allow the event to bubble up the DOM
      composed: true,  // Allow the event to cross shadow DOM boundaries
    });
    window.dispatchEvent(event);
  }

  /**
   * Handles the keydown event for spacebar toggle
   * @param event - KeyboardEvent
   */
  public handleKeyDown = (event: KeyboardEvent): void => {
    // Check if the spacebar (key: ' ') was pressed
    if (event.key === ' ' || event.code === 'Space') {
      // Prevent default behavior (e.g., page scrolling)
      event.preventDefault();

      // Check if the focused element is part of the current component
      const activeElement = document.activeElement;
      if (activeElement && (this.el.contains(activeElement) || this.el.shadowRoot.contains(activeElement))) {
        // Toggle play/pause on spacebar press
        this.playpause();
      }
    }
  }


  /**
   * Toggles the loop feature of the player. Enables or disables looping for the full track.
   * When enabled, the loop creates a UI region and subscribes to the timeupdate event for
   * continuous looping within the set region. When disabled, it clears the region and
   * unsubscribes from the related event listeners.
   *
   * @return {Promise<void>} A promise that resolves when the looping state has been successfully toggled.
   */
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

  /**
   * Enables a looping feature for the entire audio track using a region.
   * The looping is manually managed through time updates.
   * This method ensures a region is created to represent the loop and handles playback accordingly.
   *
   * @return {Promise<void>} A Promise that resolves when the loop has been successfully set up, or logs errors for invalid states.
   */
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

  /**
   * Enables or disables the loop feature for the media player.
   * When enabled, the media will replay automatically after it finishes.
   *
   * @param {boolean} enable - A boolean flag to enable (true) or disable (false) the loop functionality.
   * @return {Promise<void>} A promise that resolves when the loop functionality is successfully updated.
   */
  @Method()
  async setLoop(enable: boolean): Promise<void> {
    this.wsPlayer.on('finish', () => {
      if (enable) this.wsPlayer.play();
    });

    if (!enable) {
      this.wsPlayer.un('finish');
    }
  }

  /**
   * Creates a WaveSurfer player instance and initializes it with the specified options.
   * Sets up event listeners for playback, audio processing, and global playback control.
   * Initializes the audio waveform, duration, and playback state.
   *
   * @return {Promise<void>} A promise that resolves when the WaveSurfer player is ready.
   */
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
      progressColor: this.progress,
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

  /**
   * Calculates the width of a bar based on the current resolution.
   * The bar width decreases linearly as the resolution increases,
   * with a maximum width at a resolution of 0 and progressively smaller width up to a resolution of 100.
   *
   * @return {number} The calculated bar width, clamped within the allowed range.
   */
  calculateBarWidth(): number {
    const maxBarWidth = 10; // Maximum bar width at resolution = 0
    const normalizedResolution = Math.min(Math.max(this.resolution, 0), 100); // Clamp resolution between 0 and 100
    return maxBarWidth * (1 - normalizedResolution / 100); // Linearly scale widthefault example value
  }

  /**
   * Lifecycle method that is invoked once the component has been loaded into the DOM.
   * This method typically serves as a hook to perform initializations that require access to rendered elements.
   *
   * @return {void} Does not return a value.
   */
  componentDidLoad() {
    this.create();
  }

  /**
   * Retrieves the current playback time from the media player.
   *
   * @return {string} The current playback time formatted as a string.
   */
  getCurrentTime() {
    window.addEventListener('keydown', this.handleKeyDown);
    return this.formatTime(this.wsPlayer.getCurrentTime());
  }

  /**
   * Converts a given time in seconds to a formatted string in HH:MM:SS or MM:SS format.
   *
   * @param {number|string} time The time in seconds to be converted. It can be a numeric string or a number.
   * @return {string} A formatted time string. If the hour part is 0, the format will be MM:SS; otherwise, HH:MM:SS.
   */
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
        <div class="player-header" part="play-header">
          <div title="Audio Title" class="title" part="audio-title">
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

        <div class="player-main" part="play-main">
          <div class="wsap-left-controls">
            <div class="left-control-container">
              <button title="play/pause" class="play-pause" part="play-pause"
                       onClick={() => this.playpause()}>
                <div class={'symbol ' + (this.isPlaying ? ' paused' : 'playing')}></div>
              </button>
            </div>
          </div>
          <div id="wavesurfer" part="waveform"></div>
        </div>
      </div>
    );
  }
}
