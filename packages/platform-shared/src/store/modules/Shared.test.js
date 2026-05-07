/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import shared from './Shared';

describe('should handle relative paths for FRaaS urls', () => {
  let windowSpy;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should set environment URLs to default FQDN if FQDN supplied', () => {
    const state = {};
    const testEnv = {
      VUE_APP_FRAAS: 'true',
      VUE_APP_ENABLE_WSFED: 'true',
      VUE_APP_ENABLE_GOVERNANCE: 'true',
      VUE_APP_FRAAS_ENV_URL: 'https://openam-default.forgeblocks.com/environment',
      VUE_APP_ANALYTICS_API_URL: 'https://openam-default.forgeblocks.com/dashboard',
      VUE_APP_FRAAS_LOGGING_URL: 'https://openam-default.forgeblocks.com/keys',
      VUE_APP_FRAAS_MONITORING_URL: 'https://openam-default.forgeblocks.com/monitoring',
      VUE_APP_IGA_API_URL: 'https://openam-default.forgeblocks.com/iga',
      VUE_APP_IGA_ORCHESTRATION_API_URL: 'https://openam-default.forgeblocks.com/auto',
      VUE_APP_FRAAS_FEDERATION_ENFORCEMENT_URL: 'https://openam-default.forgeblocks.com/environment/federation/enforcement',
      VUE_APP_PINGFEDERATE_URL: 'https://openam-default.forgeblocks.com/ws/admin',
    };
    windowSpy.mockImplementation(() => ({
      location: {
        href: 'https://openam-default.forgeblocks.com',
      },
    }));
    shared.mutations.setBaseURLs(state, testEnv);
    expect(state.fraasEnvironmentUrl).toBe('https://openam-default.forgeblocks.com/environment');
    expect(state.analyticsURL).toBe('https://openam-default.forgeblocks.com/dashboard');
    expect(state.fraasLoggingKeyURL).toBe('https://openam-default.forgeblocks.com/keys');
    expect(state.fraasMonitoringURL).toBe('https://openam-default.forgeblocks.com/monitoring');
    expect(state.igaApiUrl).toBe('https://openam-default.forgeblocks.com/iga');
    expect(state.igaOrchestrationApiUrl).toBe('https://openam-default.forgeblocks.com/auto');
    expect(state.fraasFederationUrl).toBe('https://openam-default.forgeblocks.com/environment/federation/enforcement');
    expect(state.pingFederateUrl).toBe('https://openam-default.forgeblocks.com/ws/admin');
  });

  it('should set environment URLs to window domain if relative paths supplied', () => {
    const state = {};
    const testEnv = {
      VUE_APP_FRAAS: 'true',
      VUE_APP_ENABLE_WSFED: 'true',
      VUE_APP_ENABLE_GOVERNANCE: 'true',
      VUE_APP_FRAAS_ENV_URL: '/environment',
      VUE_APP_ANALYTICS_API_URL: '/dashboard',
      VUE_APP_FRAAS_LOGGING_URL: '/keys',
      VUE_APP_FRAAS_MONITORING_URL: '/monitoring',
      VUE_APP_IGA_API_URL: '/iga',
      VUE_APP_IGA_ORCHESTRATION_API_URL: '/auto',
      VUE_APP_FRAAS_FEDERATION_ENFORCEMENT_URL: '/environment/federation/enforcement',
      VUE_APP_PINGFEDERATE_URL: '/ws/admin',
    };
    windowSpy.mockImplementation(() => ({
      location: {
        href: 'https://my.fancy.domain.com',
      },
    }));
    shared.mutations.setBaseURLs(state, testEnv);
    expect(state.fraasEnvironmentUrl).toBe('https://my.fancy.domain.com/environment');
    expect(state.analyticsURL).toBe('https://my.fancy.domain.com/dashboard');
    expect(state.fraasLoggingKeyURL).toBe('https://my.fancy.domain.com/keys');
    expect(state.fraasMonitoringURL).toBe('https://my.fancy.domain.com/monitoring');
    expect(state.igaApiUrl).toBe('https://my.fancy.domain.com/iga');
    expect(state.igaOrchestrationApiUrl).toBe('https://my.fancy.domain.com/auto');
    expect(state.fraasFederationUrl).toBe('https://my.fancy.domain.com/environment/federation/enforcement');
    expect(state.pingFederateUrl).toBe('https://my.fancy.domain.com/ws/admin');
  });
});
