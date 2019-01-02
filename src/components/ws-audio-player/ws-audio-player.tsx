import { Component, Prop } from '@stencil/core';
import { format } from '../../utils/utils';

@Component({
  tag: 'ws-audio-player',
  styleUrl: 'ws-audio-player.css',
  shadow: true
})
export class WSAudioPlayer {
  /**
   * The first name
   */
  @Prop() audio: string;

  /**
   * The middle name
   */
  @Prop() color: string;

  /**
   * The last name
   */
  @Prop() width: string;

  private getText(): string {
    return format(this.audio, this.color, this.width);
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}</div>;
  }
}
