import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'wsAudioPlayer',
  outputTargets: [
    { type: 'dist' }, // Keeps the distribution target
    { type: 'docs-readme' }, // Replaces the deprecated 'docs' with 'docs-readme'
    {
      type: 'www', // Handles www builds
      serviceWorker: null // Disable service workers
    }
  ]
};
