/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { By, until } from 'selenium-webdriver';
import { sendIndividualKeys } from '../../../../cross-browser/seleniumUtilities';

// Top level loop over and instantiate browsers
describe.each(browsers)('In %s:', (browserName) => {
  beforeEach(async () => {
    await createDriver(browserName, expect.getState().currentTestName);
    await driver.get(loginUrl);
  }, 300000);

  afterEach(async () => {
    await cleanUp();
  }, 60000);

  test('Login form appears', async () => {
    const loginCardElement = await driver.findElement(By.css('.fr-center-card .ping-logo'));
    await expect(loginCardElement.isDisplayed()).resolves.toBe(true);

    const loginForm = await driver.findElement(By.css('#callbacksPanel form'));
    await expect(loginForm.isDisplayed()).resolves.toBe(true);

    const loginInputs = await loginForm.findElements(By.css('input'));

    expect(loginInputs.length).toBe(2);
    await expect(loginInputs[0].getAttribute('placeholder')).resolves.toEqual(expect.stringContaining('User Name'));
    await expect(loginInputs[1].getAttribute('placeholder')).resolves.toEqual(expect.stringContaining('Password'));
  });

  test('Logging in proceeds to dashboard', async () => {
    const loginInputs = await driver.findElement(By.css('#callbacksPanel form'))
      .findElements(By.css('input'));

    await sendIndividualKeys(loginInputs[0], adminUsername);
    await sendIndividualKeys(loginInputs[1], adminPassword);

    await driver.findElement(By.xpath('//button[contains(text(), "Next")]')).click();

    // Wait for the user to get routed to platform-admin
    await driver.wait(async (driver) => until.urlContains('platform').fn(driver), 10000);
    await driver.wait(async (driver) => until.elementLocated(By.id('appContent')).fn(driver), 10000);

    await expect(driver.findElement(By.css('#appContent h1')).getText()).resolves.toEqual(expect.stringContaining('Welcome to ForgeRock!'));
  });
});
