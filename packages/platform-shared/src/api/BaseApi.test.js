/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import axios from 'axios';
import store from '@/store';
import {
  generateHelixApi,
  generateIgaApi,
  generateIdmApi,
} from './BaseApi';

jest.mock('axios');
jest.mock('dayjs');

describe('BaseApi', () => {
  describe('generateIdmApi', () => {
    store.state.SharedStore.idmBaseURL = 'idmBaseUrl';
    it('should add x-requested-with header to the request in idmOnly mode', () => {
      store.state.SharedStore.idmOnly = true;
      axios.create = jest.fn(() => ({
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      }));
      generateIdmApi();
      expect(axios.create).toBeCalledWith({
        baseURL: 'idmBaseUrl',
        headers: { 'x-requested-with': 'XMLHttpRequest' },
      });
      store.state.SharedStore.idmOnly = false;
    });

    it('should not add x-requested-with header to the request when not in idmOnly mode', () => {
      store.state.SharedStore.idmOnly = false;
      axios.create = jest.fn(() => ({
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      }));
      generateIdmApi();
      expect(axios.create).toBeCalledWith({
        baseURL: 'idmBaseUrl',
        headers: {},
      });
      store.state.SharedStore.idmOnly = true;
    });
  });

  describe('generateIgaApi', () => {
    const requestDetails = {
      baseURL: store.state.SharedStore.igaApiUrl,
      headers: {},
    };
    const requestOverride = {
      header: 'testHeader',
    };
    it('Should run axios.create with the requested details', () => {
      axios.create = jest.fn();
      generateIgaApi();
      expect(axios.create).toBeCalledWith(requestDetails);
    });
    it('Should run axios.create with the requested details adding the requestOverride param', () => {
      axios.create = jest.fn();
      const expectedValue = {
        ...requestDetails,
        ...requestOverride,
      };
      generateIgaApi(requestOverride);
      expect(axios.create).toBeCalledWith(expectedValue);
    });

    it('should throw 403 error when the managed/alpha_user request is forbidden for end users', async () => {
      let errorRejected;
      store.state.realm = 'alpha';
      store.state.SharedStore.currentPackage = 'enduser';
      axios.create = jest.fn().mockReturnValue({
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((success, error) => {
              const errorResponse = {
                config: {
                  url: '/enduser/managed/alpha_user/',
                },
                response: {
                  status: 403,
                  config: {
                    url: '/enduser/managed/alpha_user/',
                  },
                },
              };
              error(errorResponse).catch((err) => { errorRejected = err; });
            }),
          },
        },
      });

      generateIdmApi();
      await flushPromises();

      expect(errorRejected.response.status).toBe(403);
    });
  });

  it('should not throw 403 error when the error is not related with managed/alpha_user', async () => {
    let errorRejected;
    store.state.SharedStore.currentPackage = 'enduser';
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockImplementation((success, error) => {
            const errorResponse = {
              config: {
                url: '/enduser/managed/alpha_role/',
              },
              response: {
                status: 403,
                config: {
                  url: '/enduser/managed/alpha_role/',
                },
              },
            };
            errorRejected = error(errorResponse);
          }),
        },
      },
    });

    generateIdmApi();
    await flushPromises();
    expect(errorRejected).toBe(false);
  });

  it('should not throw 403 error when the error is not a 403', async () => {
    let errorRejected;
    store.state.SharedStore.currentPackage = 'enduser';
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockImplementation((success, error) => {
            const errorResponse = {
              config: {
                url: '/enduser/managed/alpha_user/',
              },
              response: {
                status: 404,
                config: {
                  url: '/enduser/managed/alpha_user/',
                },
              },
            };
            errorRejected = error(errorResponse);
          }),
        },
      },
    });

    generateIdmApi();
    await flushPromises();
    expect(errorRejected).toBe(false);
  });

  describe('generateHelixApi', () => {
    const requestDetails = {
      baseURL: store.state.SharedStore.helixEnvironmentUrl,
      headers: { 'Content-Type': 'application/json' },
    };
    const requestOverride = {
      headers: 'overrideHeader',
    };
    it('should genearte a new HelixApi instance', () => {
      axios.create = jest.fn();
      generateHelixApi();
      expect(axios.create).toBeCalledWith(requestDetails);
    });
    it('should genearte a new HelixApi instance with the requestOverride param', () => {
      generateHelixApi(requestOverride);
      expect(axios.create).toBeCalledWith({
        baseURL: store.state.SharedStore.helixEnvironmentUrl,
        headers: 'overrideHeader',
      });
    });
  });
});
