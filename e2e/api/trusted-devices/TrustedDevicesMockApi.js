/**
 * Copyright 2021 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import trustedDevices from './trustedDevicesMockData.json';

export default class TrustedDevicesMockApi {
  constructor() {
    this.devices = trustedDevices;
  }

  getDevices() {
    return this.devices;
  }

  renameDevice(identifier, name) {
    const index = this.devices.result.findIndex((device) => device.identifier === identifier);
    this.devices.result[index].alias = name;
    return this.devices.result[index];
  }

  removeDevice(identifier) {
    this.devices.result = this.devices.result.filter((device) => device.identifier !== identifier);
    this.devices.resultCount = this.devices.result.length;
  }
}
