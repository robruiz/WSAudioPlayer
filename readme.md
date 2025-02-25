# Wavesurfer Audio Player

The **Wavesurfer Audio Player** is a lightweight and standalone custom web component for seamless audio playback with a modern waveform visualization. Built using Stencil.js and WaveSurfer.js, it enables developers to integrate responsive and interactive audio players into any web application without additional frameworks.

This component offers simple playback controls, customizable styles, event-based communication, and the ability to handle audio playback and looping regions. It is fully responsive and works across web applications.



## **Demo**
Visit https://www.bizzle.dev/wavesurfer-audio-player/ to see a demo

---

## **Getting Started**

To integrate the `ws-audio-player` into your web project, include the required `<script>` tags in your HTML file to register the custom element.

### Adding `<script>` Tags
For seamless integration, add these script tags to your HTML's `<head>`:

```html
<script type="module" src="/build/wsaudioplayer.esm.js"></script>
<script nomodule src="/build/wsaudioplayer.js"></script>
```

### **CDN Scripts**
Modern script (esmodule): https://unpkg.com/wsaudioplayer@0.0.2/dist/wsaudioplayer/wsaudioplayer.esm.js
Legacy browsers (cjs): https://unpkg.com/wsaudioplayer@0.0.2/dist/cjs/wsaudioplayer.cjs.js

If you are targeting only modern browsers, you may include the ES module version only:
```html
<script type="module" src="/build/wsaudioplayer.esm.js"></script>
```
or CDN link

```html
<script type="module" src="https://unpkg.com/wsaudioplayer@0.0.2/dist/wsaudioplayer/wsaudioplayer.esm.js"></script>
```

---

## **Usage**

The `<ws-audio-player>` component is easy to implement in your application. Below is an example of how to use it, including attributes to customize the player’s behavior and design.

### Example HTML
```html
<ws-audio-player 
  style="--font-family: Courier; --waveform-color: #1e90ff;" 
  audio="audio-file.wav" 
  resolution="100" 
  audio-title="Sample Audio Title" 
  color="blue" 
  height="80">
</ws-audio-player>
```

---

## **Attributes**

The component supports several configurable attributes for customizing audio playback and design:

| Attribute      | Type            | Default Value   | Description                                                                                  |
|----------------|-----------------|-----------------|----------------------------------------------------------------------------------------------|
| **`audio`**    | `string`        | -               | The relative or absolute file path of the audio file to be played.                          |
| **`audioTitle`**| `string`       | -               | The title of the audio playback track.                                                      |
| **`color`**    | `string`        | -               | Color of the audio waveform.                                                                |
| **`height`**   | `string`        | -               | Height of the waveform visualization in pixels.                                             |
| **`resolution`**| `number`       | `100`           | Determines the detail resolution of the waveform. The higher the value, the more detailed.  |
| **`theme`**    | `string`        | `"basic"`       | Determines the UI theme of the player. Options: `"basic"` or `"dark"`.                      |
| **`progress`** | `string`        | `"#666666"`     | The color of the progress bar displayed during playback.                                    |

### Example of Customizing Attributes
```html
<ws-audio-player 
  audio="assets/track.mp3" 
  audio-title="My Cool Track" 
  color="orange" 
  height="120" 
  resolution="150" 
  theme="dark">
</ws-audio-player>
```

---

## **Events**

The component emits one global custom event that allows developers to track when the audio player starts playing. This event bubbles and crosses Shadow DOM boundaries, making it easy to listen for and respond to.

### **`wsAudioPlaying`**
The `wsAudioPlaying` event is emitted whenever playback starts. It provides detailed information about the player and the currently active audio track.

- **Event Payload**:
  - `source`: A reference to the `<ws-audio-player>` element emitting the event.
  - `title`: The title of the track being played.
  - `audio`: The source file of the track.

#### Listening for the Event
Add an event listener to capture the playback event:

```typescript
window.addEventListener('wsAudioPlaying', (event: CustomEvent) => {
  const { source, title, audio } = event.detail;
  console.log(`Playing: ${title} (File: ${audio})`, source);
});
```

This enables you to track playback for analytics or update UI dynamically.

---

## **Style Control**

Customization of the component’s styles can be done using **CSS variables** and **component parts**. This enables developers to control and adapt the player’s appearance to match application design requirements.

### Style Customization with CSS Variables

To customize the component’s styles, use the following CSS variables in your HTML or CSS files:
| CSS Variable       | Description                                     |
|--------------------|-------------------------------------------------|
| `--font-family`    | Font family for the audio player.               |
| `--button-color`   | Background color of buttons.                   |
| `--waveform-color` | Color of the waveform visualization.            |

#### Example of CSS Variables Usage
```html
<ws-audio-player
  style="--font-family: monospace; --button-color: #ff6600; --waveform-color: #336699;"
  audio="track.mp3"
  audio-title="My Audio"
></ws-audio-player>
```

### Style Customization with Shadow Parts

The component exposes custom shadow parts that allow direct control of specific sections of the player via the `::part()` pseudo-element.

| Shadow Part         | Description                             |
|---------------------|-----------------------------------------|
| `waveform`          | The waveform visualization area.        |
| `play-button`       | The main play/pause button.             |
| `play-main`         | The main container around the play area.|

#### Example of Styling with Shadow Parts
```html
<ws-audio-player audio="song.mp3" audio-title="Styled Player"></ws-audio-player>
<style>
  ws-audio-player::part(waveform) {
    background-color: #1e90ff; /* Waveform area */
  }

  ws-audio-player::part(play-button) {
    background-color: orange; /* Play button background */
    font-size: 16px;
  }

  ws-audio-player::part(play-main) {
    border: 2px solid #ccc; /* Container border */
  }
</style>
```

---

## **Keyboard Interactions**

The component supports keyboard controls:
- **Spacebar (`Space`)**: Pause or play the audio. This works only when the component or a child element is focused.

---

## **Example HTML for Complete Implementation**

Here’s a complete example of how to seamlessly integrate and use the player:

```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audio Player Example</title>
  <script type="module" src="/build/wsaudioplayer.esm.js"></script>
  <script nomodule src="/build/wsaudioplayer.js"></script>
</head>
<body>
  <h1>My Audio Player</h1>

  <!-- Customized audio player -->
  <ws-audio-player 
    style="--font-family: monospace; --button-color: orange; --waveform-color: #1e90ff;" 
    audio="assets/sample.mp3" 
    resolution="80" 
    audio-title="Sample Track" 
    color="blue" 
    height="100">
  </ws-audio-player>

  <script>
    window.addEventListener('wsAudioPlaying', (event) => {
      console.log('Playing:', event.detail.title, event.detail.audio);
    });
  </script>
</body>
</html>
```

---

## **Conclusion**
The Wavesurfer Audio Player is a powerful yet lightweight web component for audio playback. With full customization options, event-driven design, and responsive behavior, this player is ideal for modern web applications. Have fun building amazing audio experiences!