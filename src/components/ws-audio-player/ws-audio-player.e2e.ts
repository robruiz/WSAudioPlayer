import { newE2EPage } from '@stencil/core/testing';

describe('ws-audio-player', () => {

  it('renders and hydrates properly', async () => {
    const page = await newE2EPage(); // Create a new End-to-End test page
    await page.setContent('<ws-audio-player></ws-audio-player>'); // Add component to page

    const element = await page.find('ws-audio-player'); // Select the component
    expect(element).not.toBeNull(); // Ensure the component renders
    expect(element).toHaveClass('hydrated'); // Check for hydration
  });

  it('updates text content when properties change', async () => {
    const page = await newE2EPage(); // Create a new End-to-End test page
    await page.setContent('<ws-audio-player></ws-audio-player>');

    const component = await page.find('ws-audio-player'); // Select the component
    const innerElement = await page.find('ws-audio-player >>> div'); // Shadow DOM selector

    expect(innerElement).not.toBeNull(); // Ensure nested element renders
    expect(innerElement.textContent).toBe(`Hello, World! I'm `); // Default text

    // Update property 'audio' and verify changes
    await component.setProperty('audio', 'James');
    await page.waitForChanges(); // Wait for re-render
    expect(innerElement.textContent).toBe(`Hello, World! I'm James`);

    // Update property 'color' and verify changes
    await component.setProperty('color', 'Quincy');
    await page.waitForChanges(); // Wait for re-render
    expect(innerElement.textContent).toBe(`Hello, World! I'm James Quincy`);

    // Update property 'height' and verify changes
    await component.setProperty('height', 'Earl');
    await page.waitForChanges(); // Wait for re-render
    expect(innerElement.textContent).toBe(`Hello, World! I'm James Earl Quincy`);
  });
});
