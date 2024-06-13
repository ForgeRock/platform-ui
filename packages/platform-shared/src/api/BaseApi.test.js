/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { flushPromises } from '@vue/test-utils';
import store from '../store';
import { generateIgaApi, generateIdmApi } from './BaseApi';

jest.mock('axios');

describe('BaseApi', () => {
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

    it('should throw 403 error when the managed/alpha_user request is forbidden for governance end users', async () => {
      let errorRejected;
      store.state.SharedStore.currentPackage = 'enduser';
      store.state.SharedStore.governanceEnabled = true;
      axios.create = jest.fn().mockReturnValue({
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((success, error) => {
              const errorResponse = {
                config: {
                  url: 'managed/alpha_user',
                },
                response: {
                  status: 403,
                  config: {
                    url: 'managed/alpha_user',
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

  it('should not throw 403 error when the error is not related with managed/alpha_user', () => {
    let errorRejected;
    store.state.SharedStore.currentPackage = 'enduser';
    store.state.SharedStore.governanceEnabled = true;
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockImplementation((success, error) => {
            const errorResponse = {
              config: {
                url: 'managed/alpha_role',
              },
              response: {
                status: 403,
                config: {
                  url: 'managed/alpha_role',
                },
              },
            };
            errorRejected = error(errorResponse);
          }),
        },
      },
    });

    generateIdmApi();

    expect(errorRejected).toBe(false);
  });

  it('should not throw 403 error when the error is not in enduser', () => {
    let errorRejected;
    store.state.SharedStore.currentPackage = 'admin';
    store.state.SharedStore.governanceEnabled = true;
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockImplementation((success, error) => {
            const errorResponse = {
              config: {
                url: '/openidm/config/managed',
              },
              response: {
                status: 403,
                config: {
                  url: '/openidm/config/managed',
                },
              },
            };
            errorRejected = error(errorResponse);
          }),
        },
      },
    });

    generateIdmApi();

    expect(errorRejected).toBe(false);
  });

  it('should not throw 403 error when the error is not a 403', () => {
    let errorRejected;
    store.state.SharedStore.currentPackage = 'enduser';
    store.state.SharedStore.governanceEnabled = true;
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockImplementation((success, error) => {
            const errorResponse = {
              config: {
                url: 'managed/alpha_user',
              },
              response: {
                status: 404,
                config: {
                  url: 'managed/alpha_user',
                },
              },
            };
            errorRejected = error(errorResponse);
          }),
        },
      },
    });

    generateIdmApi();

    expect(errorRejected).toBe(false);
  });

  it('should not throw 403 error when is not governance enabled', () => {
    let errorRejected;
    store.state.SharedStore.currentPackage = 'enduser';
    store.state.SharedStore.governanceEnabled = false;
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockImplementation((success, error) => {
            const errorResponse = {
              config: {
                url: 'managed/alpha_user',
              },
              response: {
                status: 403,
                config: {
                  url: 'managed/alpha_user',
                },
              },
            };
            errorRejected = error(errorResponse);
          }),
        },
      },
    });

    generateIdmApi();

    expect(errorRejected).toBe(false);
  });
});
