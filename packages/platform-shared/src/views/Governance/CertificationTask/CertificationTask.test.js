/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import Notifications from '@kyvg/vue3-notification';
import CertificationTask from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

describe('CertificationTask', () => {
  let wrapper;

  CommonsApi.getGlossarySchema = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
  CommonsApi.getFilterSchema = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getCertificationUserFilter.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.certifyItem.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.certifyItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.certifyAllItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.exceptionItem.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.exceptionItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.exceptionAllItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.forwardItem.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.forwardItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.forwardAllItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getEntitlementDetails.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getUserDetails.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getUserDetailsByType.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.reassignItem.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.resetItem.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.resetAllItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.revokeItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.revokeAllItems.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.revokeItem.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.saveComment.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.updateActors.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getCertificationApplicationFilter.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: {} }));
  CertificationApi.signOffCertificationTasks.mockImplementation(() => Promise.resolve({}));
  CertificationApi.getCertificationDetails.mockImplementation(() => Promise.resolve({ data: {} }));
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

  function mountComponent() {
    setupTestPinia();
    return mount(CertificationTask, {
      global: {
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
          $router: { push: jest.fn() },
        },
        plugins: [Notifications],
        stubs: [
          'RouterLink',
          'D3PieChart',
          'FrCertificationTaskList',
        ],
      },
    });
  }

  describe('tests without data', () => {
    beforeEach(async () => {
      wrapper = mountComponent();

      await flushPromises();
    });

    it('component should load correctly', () => {
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

  describe('tabs accounts and entitlement validation', () => {
    it('should load accounts and entitlement tabs because there is a target filter defined for both, group by account field shown', async () => {
      CertificationApi.getCertificationDetails.mockImplementation(() => Promise.resolve({
        data: {
          targetFilter: {
            type: [
              'accountGrant',
              'entitlementGrant',
            ],
          },
        },
      }));

      wrapper = mountComponent();

      await flushPromises();

      const accountsTab = findByTestId(wrapper, 'cert-accounts-tab');
      expect(accountsTab.exists()).toBe(true);

      const entitlementsTab = findByTestId(wrapper, 'cert-entitlements-tab');
      expect(entitlementsTab.exists()).toBe(true);

      const groupByAccountField = findByTestId(wrapper, 'certification-group-by-account');
      expect(groupByAccountField.exists()).toBe(true);
    });

    it('should load only accounts tab because there is not a target filter defined for entitlements, gruop by account field not shown', async () => {
      CertificationApi.getCertificationDetails.mockImplementation(() => Promise.resolve({
        data: {
          targetFilter: {
            type: [
              'accountGrant',
            ],
          },
        },
      }));

      wrapper = mountComponent();

      await flushPromises();

      const accountsTab = findByTestId(wrapper, 'cert-accounts-tab');
      expect(accountsTab.exists()).toBe(true);

      const entitlementsTab = findByTestId(wrapper, 'cert-entitlements-tab');
      expect(entitlementsTab.exists()).toBe(false);

      const groupByAccountField = findByTestId(wrapper, 'certification-group-by-account');
      expect(groupByAccountField.exists()).toBe(false);
    });

    it('should load only entitlements tab because there is not a target filter defined for accounts, gruop by account field not shown', async () => {
      CertificationApi.getCertificationDetails.mockImplementation(() => Promise.resolve({
        data: {
          targetFilter: {
            type: [
              'entitlementGrant',
            ],
          },
        },
      }));

      wrapper = mountComponent();

      await flushPromises();

      const accountsTab = findByTestId(wrapper, 'cert-accounts-tab');
      expect(accountsTab.exists()).toBe(false);

      const entitlementsTab = findByTestId(wrapper, 'cert-entitlements-tab');
      expect(entitlementsTab.exists()).toBe(true);

      const groupByAccountField = findByTestId(wrapper, 'certification-group-by-account');
      expect(groupByAccountField.exists()).toBe(false);
    });
  });

  describe('signOff', () => {
    it('should not go to back URL when cert is not complete', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const goToBackUrlSpy = jest.spyOn(wrapper.vm, 'goToBackUrl');
      wrapper.vm.totals = {
        NONE: 1,
      };

      wrapper.vm.signOff();
      await flushPromises();
      expect(goToBackUrlSpy).not.toHaveBeenCalled();
    });
    it('should go to back URL when cert is complete', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const goToBackUrlSpy = jest.spyOn(wrapper.vm, 'goToBackUrl');
      wrapper.vm.totals = {
        completed: 1,
      };

      wrapper.vm.signOff();

      await flushPromises();
      expect(goToBackUrlSpy).toHaveBeenCalled();
    });
  });
});
