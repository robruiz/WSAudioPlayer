import { Component, Prop, Method, Element } from '@stencil/core';
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
     * The Track Title
     */
    @Prop() title: string;

  /**
   * The height of the waveform
   */
    @Prop() height: string;

    @Element() el: HTMLElement;

    public wsPlayer;

    @Method() create(){
        let ws = WaveSurfer;
        let container = this.el.shadowRoot.querySelector('#wavesurfer');
        //console.log([container, this.el]);
        this.wsPlayer = ws.create({
            container: container,
            waveColor: this.color,
            progressColor: 'purple',
            height: this.height
        });
        this.wsPlayer.load(this.audio);
    }

    @Method() playpause(){
        this.wsPlayer.playPause();
    }

    componentDidLoad() {
        this.create();
    }

    render() {

        return <div class="wsap-container">
            <div class="title"><h3>{this.title}</h3></div>
            <div class="wsap-left-controls">
                <button class="playpause" onClick={() => this.playpause()}><img src="assets/play_pause.png" /></button>
            </div>
            <div id="wavesurfer"></div>
            </div>;
    }
}
