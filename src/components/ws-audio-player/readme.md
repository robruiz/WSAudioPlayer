# ws-audio-player



<!-- Auto Generated Below -->


## Overview

This class represents a custom audio player component built using WaveSurfer.js, offering
functionalities such as play/pause, looping, and region-based audio playback control.

Properties managed within the component allow customization of audio appearance,
behavior, and additional event handling for a seamless user experience.

The component relies on the WaveSurfer.js library to render audio waveforms and manage audio playback.
A variety of features including looping regions, event dispatching, and keyboard interactions are supported.

Props:
- `audio`: URL string of the audio file to be played.
- `color`: String for the waveform color.
- `progress`: String for the progress bar color (default: "#666666").
- `theme`: String indicating the UI theme of the audio player (default: "basic").
- `audioTitle`: Title of the audio track.
- `duration`: Duration of the audio track (mutable).
- `height`: String specifying the height of the waveform.
- `resolution`: Resolution value for waveform rendering (default: 100).

States:
- `isPlaying`: Boolean indicating the current playback state of the audio.
- `curTime`: Current playback time of the audio in string format.
- `isLooping`: Boolean indicating whether loop mode is active.
- `audioRegions`: Array representing the defined audio regions for looping or selection.

Methods:
- `playpause()`: Toggles between play and pause states for the current audio.
- `toggleLoop()`: Enables or disables a full-track looping feature with visual regions.
- `enableFullTrackLoop()`: Configures and starts a full-track loop sequence using WaveSurfer.js regions.
- `setLoop(enable)`: Globally enables or disables the loop functionality for the audio player.
- `create()`: Initializes the WaveSurfer player instance with essential configurations and event listeners.

Event Emission:
- Emits the `wsAudioPlaying` event when playback starts, sharing audio source details and title.

Keyboard Control:
- Handles the spacebar keydown event for toggling play/pause, ensuring the key press is valid only within the context of the component.

WaveSurfer Instance:
- The `wsPlayer` instance provides direct access to WaveSurfer.js methods, such as playback control and region management.
- Regions are handled using the `RegionsPlugin` for highlighting and looping selected portions of audio.

Shadow DOM:
- The component uses Shadow DOM to encapsulate styles and provide a scoped structure for rendering.

## Properties

| Property     | Attribute     | Description | Type     | Default     |
| ------------ | ------------- | ----------- | -------- | ----------- |
| `audio`      | `audio`       |             | `string` | `undefined` |
| `audioTitle` | `audio-title` |             | `string` | `undefined` |
| `color`      | `color`       |             | `string` | `undefined` |
| `duration`   | `duration`    |             | `string` | `undefined` |
| `height`     | `height`      |             | `string` | `undefined` |
| `progress`   | `progress`    |             | `string` | `'#666666'` |
| `resolution` | `resolution`  |             | `number` | `100`       |
| `theme`      | `theme`       |             | `string` | `'basic'`   |


## Methods

### `create() => Promise<void>`

Creates a WaveSurfer player instance and initializes it with the specified options.
Sets up event listeners for playback, audio processing, and global playback control.
Initializes the audio waveform, duration, and playback state.

#### Returns

Type: `Promise<void>`

A promise that resolves when the WaveSurfer player is ready.

### `enableFullTrackLoop() => Promise<void>`

Enables a looping feature for the entire audio track using a region.
The looping is manually managed through time updates.
This method ensures a region is created to represent the loop and handles playback accordingly.

#### Returns

Type: `Promise<void>`

A Promise that resolves when the loop has been successfully set up, or logs errors for invalid states.

### `playpause() => Promise<void>`

Toggles the playback state of the media player. If playback is currently ongoing, it will pause; otherwise, it will start/resume.

#### Returns

Type: `Promise<void>`

A promise that resolves when the playback state toggling, state updates, and event emission are complete.

### `setLoop(enable: boolean) => Promise<void>`

Enables or disables the loop feature for the media player.
When enabled, the media will replay automatically after it finishes.

#### Parameters

| Name     | Type      | Description                                                                  |
| -------- | --------- | ---------------------------------------------------------------------------- |
| `enable` | `boolean` | - A boolean flag to enable (true) or disable (false) the loop functionality. |

#### Returns

Type: `Promise<void>`

A promise that resolves when the loop functionality is successfully updated.

### `toggleLoop() => Promise<void>`

Toggles the loop feature of the player. Enables or disables looping for the full track.
When enabled, the loop creates a UI region and subscribes to the timeupdate event for
continuous looping within the set region. When disabled, it clears the region and
unsubscribes from the related event listeners.

#### Returns

Type: `Promise<void>`

A promise that resolves when the looping state has been successfully toggled.


## Shadow Parts

| Part            | Description |
| --------------- | ----------- |
| `"audio-title"` |             |
| `"play-header"` |             |
| `"play-main"`   |             |
| `"play-pause"`  |             |
| `"waveform"`    |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
