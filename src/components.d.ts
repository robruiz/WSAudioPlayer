/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';




export namespace Components {

  interface WsAudioPlayer {
    /**
    * The Link To The Audio File
    */
    'audio': string;
    /**
    * The waveform color
    */
    'color': string;
    'create': () => void;
    /**
    * The height of the waveform
    */
    'height': string;
    'playpause': () => void;
    /**
    * The Track Title
    */
    'title': string;
  }
  interface WsAudioPlayerAttributes extends StencilHTMLAttributes {
    /**
    * The Link To The Audio File
    */
    'audio'?: string;
    /**
    * The waveform color
    */
    'color'?: string;
    /**
    * The height of the waveform
    */
    'height'?: string;
    /**
    * The Track Title
    */
    'title'?: string;
  }
}

declare global {
  interface StencilElementInterfaces {
    'WsAudioPlayer': Components.WsAudioPlayer;
  }

  interface StencilIntrinsicElements {
    'ws-audio-player': Components.WsAudioPlayerAttributes;
  }


  interface HTMLWsAudioPlayerElement extends Components.WsAudioPlayer, HTMLStencilElement {}
  var HTMLWsAudioPlayerElement: {
    prototype: HTMLWsAudioPlayerElement;
    new (): HTMLWsAudioPlayerElement;
  };

  interface HTMLElementTagNameMap {
    'ws-audio-player': HTMLWsAudioPlayerElement
  }

  interface ElementTagNameMap {
    'ws-audio-player': HTMLWsAudioPlayerElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
