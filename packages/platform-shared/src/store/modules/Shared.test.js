/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import shared from './Shared';

const defaultState = cloneDeep(shared.state);

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
      VUE_APP_ENABLE_AUTO_ACCESS: 'true',
      VUE_APP_ENABLE_WSFED: 'true',
      VUE_APP_ENABLE_GOVERNANCE: 'true',
      VUE_APP_FRAAS_ENV_URL: 'https://openam-default.forgeblocks.com/environment',
      VUE_APP_ANALYTICS_API_URL: 'https://openam-default.forgeblocks.com/dashboard',
      VUE_APP_FRAAS_LOGGING_URL: 'https://openam-default.forgeblocks.com/keys',
      VUE_APP_FRAAS_MONITORING_URL: 'https://openam-default.forgeblocks.com/monitoring',
      VUE_APP_AUTO_ACCESS_API_URL: 'https://openam-default.forgeblocks.com/autoaccess/api',
      VUE_APP_AUTO_ACCESS_JAS_URL: 'https://openam-default.forgeblocks.com/autoaccess/jas',
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
    expect(state.autoAccessApiUrl).toBe('https://openam-default.forgeblocks.com/autoaccess/api');
    expect(state.autoAccessJasUrl).toBe('https://openam-default.forgeblocks.com/autoaccess/jas');
    expect(state.igaApiUrl).toBe('https://openam-default.forgeblocks.com/iga');
    expect(state.igaOrchestrationApiUrl).toBe('https://openam-default.forgeblocks.com/auto');
    expect(state.fraasFederationUrl).toBe('https://openam-default.forgeblocks.com/environment/federation/enforcement');
    expect(state.pingFederateUrl).toBe('https://openam-default.forgeblocks.com/ws/admin');
  });

  it('should set environment URLs to window domain if relative paths supplied', () => {
    const state = {};
    const testEnv = {
      VUE_APP_FRAAS: 'true',
      VUE_APP_ENABLE_AUTO_ACCESS: 'true',
      VUE_APP_ENABLE_WSFED: 'true',
      VUE_APP_ENABLE_GOVERNANCE: 'true',
      VUE_APP_FRAAS_ENV_URL: '/environment',
      VUE_APP_ANALYTICS_API_URL: '/dashboard',
      VUE_APP_FRAAS_LOGGING_URL: '/keys',
      VUE_APP_FRAAS_MONITORING_URL: '/monitoring',
      VUE_APP_AUTO_ACCESS_API_URL: '/autoaccess/api',
      VUE_APP_AUTO_ACCESS_JAS_URL: '/autoaccess/jas',
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
    expect(state.autoAccessApiUrl).toBe('https://my.fancy.domain.com/autoaccess/api');
    expect(state.autoAccessJasUrl).toBe('https://my.fancy.domain.com/autoaccess/jas');
    expect(state.igaApiUrl).toBe('https://my.fancy.domain.com/iga');
    expect(state.igaOrchestrationApiUrl).toBe('https://my.fancy.domain.com/auto');
    expect(state.fraasFederationUrl).toBe('https://my.fancy.domain.com/environment/federation/enforcement');
    expect(state.pingFederateUrl).toBe('https://my.fancy.domain.com/ws/admin');
  });
});

describe('should handle Pendo feature flag', () => {
  let state;

  beforeEach(() => {
    state = cloneDeep(defaultState);
  });

  it('should not enable Pendo if VUE_APP_ENABLE_PENDO is false and VUE_APP_FRAAS is false', () => {
    const testEnv = {
      VUE_APP_ENABLE_PENDO: 'false',
      VUE_APP_FRAAS: 'false',
    };
    shared.mutations.setFeatureFlags(state, testEnv);
    expect(state.pendoEnabled).toBe(false);
  });

  it('should not enable Pendo if VUE_APP_ENABLE_PENDO is false and VUE_APP_FRAAS is true', () => {
    const testEnv = {
      VUE_APP_ENABLE_PENDO: 'false',
      VUE_APP_FRAAS: 'true',
    };
    shared.mutations.setFeatureFlags(state, testEnv);
    expect(state.pendoEnabled).toBe(false);
  });

  it('should not enable Pendo if VUE_APP_ENABLE_PENDO is true and VUE_APP_FRAAS is false', () => {
    const testEnv = {
      VUE_APP_ENABLE_PENDO: 'true',
      VUE_APP_FRAAS: 'false',
    };
    shared.mutations.setFeatureFlags(state, testEnv);
    expect(state.pendoEnabled).toBe(false);
  });

  it('should enable Pendo if VUE_APP_ENABLE_PENDO is true and VUE_APP_FRAAS is true', () => {
    const testEnv = {
      VUE_APP_ENABLE_PENDO: 'true',
      VUE_APP_FRAAS: 'true',
    };
    shared.mutations.setFeatureFlags(state, testEnv);
    expect(state.pendoEnabled).toBe(true);
  });
});
