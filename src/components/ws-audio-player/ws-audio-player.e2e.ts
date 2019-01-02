import { newE2EPage } from '@stencil/core/testing';

describe('ws-audio-player', () => {
  it('renders', async () => {
   /* const page = await newE2EPage();

    await page.setContent('<ws-audio-player></ws-audio-player>');
    const element = await page.find('ws-audio-player');
   // expect(element).toHaveClasses(['hydrated']);*/
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<ws-audio-player></ws-audio-player>');
    const component = await page.find('ws-audio-player');
    const element = await page.find('ws-audio-player >>> div');
    expect(element.textContent).toEqual(`Hello, World! I'm `);

    component.setProperty('audio', 'James');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James`);

    component.setProperty('color', 'Quincy');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    component.setProperty('height', 'Earl');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});
