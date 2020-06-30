import { Component, Prop, Method, Element, State, Watch } from '@stencil/core';
import WaveSurfer from 'wavesurfer.js';

@Component({
  tag: 'ws-audio-player',
  styleUrl: 'ws-audio-player.css',
  shadow: true
})
export class WSAudioPlayer {
  /**
   * The Link To The Audio File
   */
    @Prop() audio: string;

  /**
   * The waveform color
   */
    @Prop() color: string;

  /**
   * The player theme
   */
    @Prop() theme: string;

    /**
     * The Track Title
     */
    @Prop() title: string;

    @Prop({ mutable: true }) duration: string;
    //@Prop({ mutable: true }) curTime: string;

    /**
     * Whether or not the player is playing
     */
    @State() isPlaying: string;
    @State() curTime: string;

    @Watch('audio')
    watchHandler(newValue: boolean) {
        this.wsPlayer.load(newValue);
    }

  /**
   * The height of the waveform
   */
    @Prop() height: string;

    @Element() el: HTMLElement;

    public wsPlayer;
    public themeSetting;

    @Method() create(){
        let ws = WaveSurfer;
        //let player = this;
        let container = this.el.shadowRoot.querySelector('#wavesurfer');
        this.wsPlayer = ws.create({
            container: container,
            waveColor: this.color,
            progressColor: '#666666',
            height: this.height
        });
        if(!this.theme){
          this.themeSetting = 'basic';
        } else {
          this.themeSetting = this.theme;
        }
        this.wsPlayer.load(this.audio);
        this.wsPlayer.on('ready', () =>  {
          this.duration = this.formatTime(this.wsPlayer.getDuration());
          this.curTime = this.formatTime(this.wsPlayer.getCurrentTime());
        });
        this.isPlaying  = this.wsPlayer.isPlaying();
        this.wsPlayer.on('audioprocess', ()  => {
          this.curTime = this.getCurrentTime();
        });
      this.wsPlayer.on('seek', ()  => {
        this.curTime = this.getCurrentTime();
      });
    }

    @Method() playpause(){
        this.wsPlayer.playPause();
        this.isPlaying  = this.wsPlayer.isPlaying();
        this.curTime = this.getCurrentTime();
        /*window.setInterval(() => {
          this.curTime = this.getCurrentTime();
        }, 1000)*/
    }

    componentDidLoad() {
        this.create();
    }

    getCurrentTime(){
      return this.formatTime(this.wsPlayer.getCurrentTime());
    }

    formatTime(time){
      let sec_num = parseInt(time, 10); // don't forget the second param
      let hours   = Math.floor(sec_num / 3600);
      let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      let seconds = sec_num - (hours * 3600) - (minutes * 60);
      let hoursStr = hours.toString();
      let minutesStr = minutes.toString();
      let secondsStr = seconds.toString();

      if (hours   < 10) {hoursStr   = "0"+hoursStr;}
      if (minutes < 10) {minutesStr = "0"+minutesStr;}
      if (seconds < 10) {secondsStr = "0"+secondsStr;}
      if(hours > 0){
        return hoursStr+':'+minutesStr+':'+secondsStr;
      } else {
        return minutesStr+':'+secondsStr;
      }
    }

    render() {

        return <div class={'wsap-container '+this.themeSetting}>
          <div class="player-header">
            <div class="title"><h3>{this.title}</h3></div>
            <div class="current-time">
              {this.curTime}
            </div>
            <div class="total-time">
              {this.duration}
            </div>
          </div>

          <div class="player-main">
            <div class="wsap-left-controls">
                <button class="play-pause" onClick={() => this.playpause()}><div class={"symbol " + (this.isPlaying ? ' paused' : 'playing') }></div></button>
            </div>
            <div id="wavesurfer"></div>
          </div>
        </div>;
    }
}
