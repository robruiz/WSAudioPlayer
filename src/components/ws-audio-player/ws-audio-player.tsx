import { Component, Prop, Method, Element, State, Watch } from '@stencil/core';
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
  @Prop() title: string;
  @Prop({ mutable: true }) duration: string;
  @Prop() height: string;
  @Prop() resolution: number = 100;

  @State() isPlaying: string;
  @State() curTime: string;
  @State() isLooping: boolean = false;
  @State() audioRegions: AudioRegion[] = []; // Typed list of regions

  @Element() el: HTMLElement;
  public wsPlayer;

  @Watch('audio')
  watchHandler(newValue: string) {
    this.wsPlayer.load(newValue);
  }

  @Method() playpause() {
    this.wsPlayer.playPause();
    this.isPlaying = this.wsPlayer.isPlaying();
    this.curTime = this.getCurrentTime();
  }

  @Method() toggleLoop() {

    if (this.isLooping) {
      // Disable looping: Remove all regions and stop looping
      this.wsPlayer.regions.clear();
      this.isLooping = false;
      console.log('Looping disabled.');
    } else {
      // Add the full-track loop region
      this.enableFullTrackLoop();
      this.isLooping = true;
      console.log('Looping enabled for the full track.');
      console.log(this.wsPlayer.regions);
    }
  }

  @Method() enableFullTrackLoop() {
    if (!this.wsPlayer || !this.wsPlayer.regions) {
      console.error('Wavesurfer or RegionsPlugin is not initialized.');
      return;
    }

    const duration = this.wsPlayer.getDuration();

    if (duration > 0) {
      // Clear any existing regions
      this.wsPlayer.regions.clear();

      // Add a new looping region
      const region = this.wsPlayer.regions.add({
        start: 0,             // Start of the track
        end: duration,        // End of the track
        loop: true,           // Enable looping for this region
        color: 'rgba(255,0,0,0.5)', // Optional: Highlight the region
        drag: false,          // No region dragging
        resize: false,        // No region resizing
      });

      // Attach a debug log to track when the region-out event is fired
      region.on('out', () => {
        console.log('Region loop triggered (region-out). Restarting playback...');
        console.log(`Region details - Start: ${region.start}, End: ${region.end}`);
        console.log('Current time:', this.wsPlayer.getCurrentTime());

        // Optionally restart playback manually if the region does not loop automatically
        this.wsPlayer.play(region.start);
      });

      // Start playback
      this.wsPlayer.play(region.start);
      console.log('Full track loop region created and playback started.');
    } else {
      console.error('Invalid track duration, cannot create loop.');
    }
  }

  @Method() setLoop(enable: boolean) {
    this.wsPlayer.on('finish', () => {
      if (enable) this.wsPlayer.play();
    });

    if (!enable) {
      this.wsPlayer.un('finish');
    }
  }

  @Method() create() {
    //const container = this.el.shadowRoot.querySelector('#wavesurfer');
    this.wsPlayer = WaveSurfer.create({
      container: '#wavesurfer',
      plugins: [
        RegionsPlugin.create({
          dragSelection: false,
        }),
      ],
      waveColor: this.color,
      progressColor: '#666666',
      height: this.height,
      scrollParent: false,
      barWidth: this.calculateBarWidth(),
      loopSelection: true,
    });

    this.wsPlayer.load(this.audio);

    this.wsPlayer.on('ready', () => {
      this.duration = this.formatTime(this.wsPlayer.getDuration());
      this.curTime = this.formatTime(this.wsPlayer.getCurrentTime());
    });

    this.wsPlayer.on('region-created', (region: AudioRegion) => {
      region.update({ loop: true });
      this.audioRegions.push(region); // Add the new region to the state
      this.wsPlayer.play(region.start);
    });
  }

  @Method()
  calculateBarWidth(): Promise<number> {
    const barWidth = this.calculateWidth(); // Hypothetical synchronous calculation
    return Promise.resolve(barWidth); // Wrap the return value in a Promise
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
            <h3>{this.title}</h3>
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
