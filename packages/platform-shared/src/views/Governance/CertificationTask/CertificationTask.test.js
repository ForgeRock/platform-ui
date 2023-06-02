/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import CertificationTask from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

describe('CertificationTask', () => {
  let wrapper;
  beforeEach(async () => {
    CertificationApi.getCertificationDetails.mockImplementation(() => Promise.resolve({ data: {} }));
    wrapper = mount(CertificationTask, {
      mocks: {
        $t: (t) => t,
        $route: {
          params: {
            campaignId: 'a96de99c-c638-4bdd-84cb-5fb559225152',
          },
          query: {
            actorId: 'a96de99c-c638-4bdd-84cb-5fb559225153',
            taskStatus: 'active',
          },
        },
      },
      stubs: [
        'RouterLink',
        'D3PieChart',
        'FrCertificationTaskList',
      ],
    });

    await flushPromises();
  });

  it('component should load correctly', () => {
    expect(wrapper.name()).toBe('CertificationTask');
    expect(wrapper.vm.isDetailsLoading).toBe(false);
    expect(wrapper.vm.loadFailed).toBe(false);
    expect(wrapper.vm.campaignDetails).toEqual({});
    expect(wrapper.vm.actorId).toBe('a96de99c-c638-4bdd-84cb-5fb559225153');
    expect(wrapper.vm.campaignId).toBe('a96de99c-c638-4bdd-84cb-5fb559225152');
  });

  describe('checkInProgress method', () => {
    afterEach(() => {
      expect(CertificationApi.getInProgressTasksByCampaign).toHaveBeenCalledWith('a96de99c-c638-4bdd-84cb-5fb559225152', false, 'active');
    });

    it('checkInProgress method, two line items with signoff permission should show sign-off button', async () => {
      CertificationApi.getInProgressTasksByCampaign.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225154',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225153',
                      permissions: {
                        signoff: true,
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225155',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225153',
                      permissions: {
                        signoff: true,
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225156',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225157',
                      permissions: {
                        signoff: true,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      }));

      wrapper.vm.checkInProgress();

      await flushPromises();

      expect(wrapper.vm.hideSignOff).toBe(false);
      const signOffButton = findByTestId(wrapper, 'signoff-button');
      expect(signOffButton.exists()).toBe(true);
    });

    it('checkInProgress method, two line items, just one with signoff permission should show sign-off button', async () => {
      CertificationApi.getInProgressTasksByCampaign.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225154',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225153',
                      permissions: {
                        signoff: true,
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225155',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225153',
                      permissions: {
                        signoff: false,
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225156',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225157',
                      permissions: {
                        signoff: true,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      }));

      wrapper.vm.checkInProgress();

      await flushPromises();

      expect(wrapper.vm.hideSignOff).toBe(false);
      const signOffButton = findByTestId(wrapper, 'signoff-button');
      expect(signOffButton.exists()).toBe(true);
    });

    it('checkInProgress method, two line items without signoff permission should hide sign-off button', async () => {
      CertificationApi.getInProgressTasksByCampaign.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225154',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225153',
                      permissions: {
                        signoff: false,
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225155',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225153',
                      permissions: {
                        signoff: false,
                      },
                    },
                  ],
                },
              },
            },
            {
              id: 'a96de99c-c638-4bdd-84cb-5fb559225156',
              decision: {
                certification: {
                  actors: [
                    {
                      id: 'a96de99c-c638-4bdd-84cb-5fb559225157',
                      permissions: {
                        signoff: true,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      }));

      wrapper.vm.checkInProgress();

      await flushPromises();

      expect(wrapper.vm.hideSignOff).toBe(true);
      const signOffButton = findByTestId(wrapper, 'signoff-button');
      expect(signOffButton.exists()).toBe(false);
    });
  });
});
