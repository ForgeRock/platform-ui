/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as applicationImageResolver from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import DetailsTab from './DetailsTab';
import i18n from '@/i18n';

mockValidation(['required']);
jest.mock('axios');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi');
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi', () => ({
  getGlossaryAttributes: jest.fn().mockResolvedValue({
    data: { result: [], resultCount: 0, totalCount: 0 },
  }),
}));
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi', () => ({
  getSchema: jest.fn().mockResolvedValue({ data: { properties: {} } }),
}));
jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

AccessRequestApi.requestAction = jest.fn().mockImplementation(() => Promise.resolve({
  data: {},
}));
AccessRequestApi.putCustomRequest = jest.fn().mockImplementation(() => Promise.resolve({
  data: {},
}));
CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({
  data: {
    '/openidm/managed/application': [],
    '/openidm/managed/assignment': [],
    '/openidm/managed/role': [
      {
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'Requestable',
        name: 'requestable',
        description: 'Can the role be requested',
        objectType: '/openidm/managed/role',
        type: 'boolean',
        id: 'testId001',
      },
      {
        id: 'testId002',
        displayName: 'Role Owner',
        name: 'roleOwner',
        description: 'Role Owner of Object',
        objectType: '/openidm/managed/role',
        type: 'managedObject',
        managedObjectType: '/openidm/managed/user',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        searchable: true,
        isInternal: true,
      },
    ],
  },
});

EntitlementApi.getEntitlementSchema.mockImplementation(() => Promise.resolve({
  data: {
    properties: {
      testObjectProperty: {
        type: 'string',
        order: 2,
        displayName: 'test object property',
      },
      testObjectProperty2: {
        type: 'string',
        order: 3,
        displayName: 'test object property2',
        flags: ['NOT_CREATABLE'],
      },
    },
  },
}));

EntitlementApi.getEntitlementUsers.mockImplementation(() => Promise.resolve({
  data: {
    result: [],
    totalCount: 0,
  },
}));

EntitlementApi.getEntitlementList.mockImplementation(() => Promise.resolve({
  data: {
    result: [
      {
        descriptor: {
          idx: {
            '/entitlement': {
              displayName: 'Customer Support - QA',
            },
          },
          id: 'entitlementId1',
        },
      },
      {
        descriptor: {
          idx: {
            '/entitlement': {
              displayName: 'Sales Representative - QA',
            },
          },
          id: 'entitlementId2',
        },
      },
    ],
  },
}));

EntitlementApi.getApplicationList = jest.fn().mockImplementation(() => Promise.resolve({
  data: {
    result: [
      {
        application: {
          name: 'TestApp',
          id: 'TestId',
          objectTypes: [
            {
              name: 'TestObjectType',
              accountAttribute: 'accountAttribute1',
            },
            {
              name: 'TestObjectType2',
            },
          ],
        },
      },
    ],
  },
}));

RoleApi.getRoleDataById = jest.fn().mockImplementation(() => Promise.resolve({
  result: [
    { id: 'ent1', name: 'Entry One' },
    { id: 'ent2', name: 'Entry Two' },
  ],
  totalCount: 2,
}));

ManagedResourceApi.getManagedResourceList = jest.fn().mockImplementation(() => Promise.resolve([]));

applicationImageResolver.onImageError = jest.fn().mockImplementation(() => {});

jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByRequestType').mockResolvedValue({ data: { result: [] } });

describe('DetailsTab', () => {
  let routerPush;
  const setup = (propsData = {}) => {
    routerPush = mockRouter().routerPush;
    const props = {
      item: {
        details: {
          id: 'id test',
          name: 'name test',
          description: 'test description',
          priority: 'priority test',
          date: '2021-01-01T00:00:00Z',
          type: 'type',
          icon: 'user_icon.png',
          requestedFor: {
            profileImage: 'path/to/profile.jpg',
            givenName: 'test',
            sn: 'name',
            userName: 'test',
          },
          requestedBy: {
            profileImage: 'path/to/profile.jpg',
            givenName: 'requested by',
            sn: 'requested by',
            userName: 'requested by name',
          },
        },
        rawData: {
          decision: {
            decision: 'approved',
            outcome: 'provisioned',
            status: 'complete',
          },
          request: {
            common: {
              justification: 'justification.',
            },
            role: {
              glossary: {},
              object: {
                entitlements: {
                  result: [],
                  totalCount: 0,
                },
                members: {
                  result: [],
                  totalCount: 0,
                },
              },
            },
          },
        },
      },
      type: 'adminRequest',
      ...propsData,
    };
    setupTestPinia(undefined, false);
    mockModal();
    return mount(DetailsTab, {
      global: {
        plugins: [i18n],
        stubs: {
          FrRequestFormManager: true,
          FrRequestRoleDetails: true,
          FrSpinner: true,
          FrGovObjectSelect: true,
        },
      },
      props,
    });
  };

  it('initializes with the correct default data structure based on props', async () => {
    const wrapper = setup();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.item).toHaveProperty('details');
    expect(wrapper.vm.item).toHaveProperty('rawData');
  });

  it('initializes with the correct default data structure based on props when outcome is presented', async () => {
    const wrapper = setup();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.item).toHaveProperty('rawData');
    expect(wrapper.vm.item.rawData.decision.outcome).toContain('provisioned');
  });

  it('shows start date and end date fields if either present', async () => {
    const wrapper = setup({
      item: {
        details: {},
        rawData: {
          request: { common: { endDate: '2025-07-21T20:36:49+00:00' } },
          requestType: 'entitlementGrant',
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Access Start Date');
    expect(wrapper.text()).toContain('Access End Date');
    expect(wrapper.text()).toContain('Jul 21, 2025');
  });

  it('does not show temporal fields if neither present', async () => {
    const wrapper = setup({
      item: {
        details: {},
        rawData: {
          request: { common: { } },
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).not.toContain('Access Start Date');
    expect(wrapper.text()).not.toContain('Access End Date');
  });

  it('hides requested if is not present', async () => {
    const wrapper = setup({
      item: {
        details: {},
        rawData: {},
      },
    });
    await flushPromises();
    expect(wrapper.text()).not.toContain('Requested');
  });

  describe('account request', () => {
    const accountFormSchema = {
      form: {
        fields: [
          {
            id: 'rowid',
            fields: [
              {
                label: 'testLabel',
                model: 'testModel',
                name: 'test',
                type: 'string',
                layout: {
                  offset: 0,
                  columns: 12,
                },
                validation: {
                  required: true,
                },
              },
            ],
          },
        ],
      },
    };

    it.each(['createAccount', 'modifyAccount', 'deleteAccount'])('shows account request details for a %s request and skips the role/OOTB blocks', async (accountRequestType) => {
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: accountRequestType,
            request: {
              account: {
                accountId: 'account-1',
                applicationId: 'app-1',
                objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(wrapper.findComponent({ name: 'RequestAccountDetails' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'RequestRoleDetails' }).exists()).toBe(false);
      expect(wrapper.text()).toContain('Application Information');
    });

    it('shows the application and requested-for user in their own cards', async () => {
      ApplicationsApi.getApplication.mockResolvedValue({
        data: { name: 'Workday', id: 'app-1' },
      });
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'modifyAccount',
            user: {
              givenName: 'Jane', sn: 'Doe', userName: 'jane.doe',
            },
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(ApplicationsApi.getApplication).toHaveBeenCalledWith('app-1');
      const itemCard = wrapper.findComponent({ name: 'RequestedItemCard' });
      expect(itemCard.props('request').application).toEqual({ name: 'Workday', id: 'app-1' });
      const userInfoCard = wrapper.findComponent({ name: 'UserInfoCard' });
      expect(userInfoCard.props('user')).toEqual({ givenName: 'Jane', sn: 'Doe', userName: 'jane.doe' });
    });

    it('retries the application lookup for disconnected applications so the card shows application data', async () => {
      ApplicationsApi.getApplication
        .mockRejectedValueOnce(new Error('not found'))
        .mockResolvedValueOnce({
          data: { name: 'AS Disconnected', id: 'app-2', isDisconnected: true },
        });
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-2', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(ApplicationsApi.getApplication).toHaveBeenCalledWith('app-2', { disconnected: true });
      const itemCard = wrapper.findComponent({ name: 'RequestedItemCard' });
      expect(itemCard.props('request').application).toEqual({ name: 'AS Disconnected', id: 'app-2', isDisconnected: true });
    });

    it('uses the backend-provided application when the request carries one at the top level', async () => {
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'modifyAccount',
            application: { name: 'Workday', id: 'app-1' },
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      const itemCard = wrapper.findComponent({ name: 'RequestedItemCard' });
      expect(itemCard.props('request').application).toEqual({ name: 'Workday', id: 'app-1' });
    });

    it('loads the application when the item arrives after mount', async () => {
      ApplicationsApi.getApplication.mockResolvedValue({
        data: { name: 'Workday', id: 'app-1' },
      });
      // parents like TaskDetail mount the tab before the request data resolves
      const wrapper = setup({ item: { details: {}, rawData: {} } });
      await flushPromises();
      expect(wrapper.findComponent({ name: 'RequestedItemCard' }).exists()).toBe(false);

      await wrapper.setProps({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(ApplicationsApi.getApplication).toHaveBeenCalledWith('app-1');
      const itemCard = wrapper.findComponent({ name: 'RequestedItemCard' });
      expect(itemCard.props('request').application).toEqual({ name: 'Workday', id: 'app-1' });
    });

    it('performs a single application lookup even though the card is rendered immediately', async () => {
      // regression: the card used to run its own getApplication lookup in
      // parallel with the tab's, issuing two requests for the same application
      ApplicationsApi.getApplication.mockClear();
      ApplicationsApi.getApplication.mockResolvedValue({
        data: { name: 'Workday', id: 'app-1' },
      });
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(ApplicationsApi.getApplication).toHaveBeenCalledTimes(1);
      const itemCard = wrapper.findComponent({ name: 'RequestedItemCard' });
      expect(itemCard.props('request').application).toEqual({ name: 'Workday', id: 'app-1' });
    });

    it('loads the application when the account block arrives after the request type', async () => {
      ApplicationsApi.getApplication.mockClear();
      ApplicationsApi.getApplication.mockResolvedValue({
        data: { name: 'Workday', id: 'app-1' },
      });
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
          },
        },
      });
      await flushPromises();
      expect(ApplicationsApi.getApplication).not.toHaveBeenCalled();

      await wrapper.setProps({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(ApplicationsApi.getApplication).toHaveBeenCalledWith('app-1');
      const itemCard = wrapper.findComponent({ name: 'RequestedItemCard' });
      expect(itemCard.props('request').application).toEqual({ name: 'Workday', id: 'app-1' });
    });

    it('does not render a user card when the request has no target user', async () => {
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: { applicationId: 'app-1', objectType: 'User' },
            },
          },
        },
      });
      await flushPromises();

      expect(wrapper.findComponent({ name: 'UserInfoCard' }).exists()).toBe(false);
    });

    it('allows saving when the current user is a permitted active actor for the current phase', async () => {
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'modifyAccount',
            phases: [{ name: 'phase-1' }],
            decision: {
              actors: {
                active: [
                  { id: 'current-user', phase: 'phase-1', permissions: { modify: true } },
                ],
              },
            },
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      useUserStore().userId = 'current-user';
      await flushPromises();

      const accountDetails = wrapper.findComponent({ name: 'RequestAccountDetails' });
      expect(accountDetails.props('readOnly')).toBe(false);
    });

    it('keeps the account request read-only when there is no matching permitted actor', async () => {
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'modifyAccount',
            phases: [{ name: 'phase-1' }],
            decision: {
              actors: {
                active: [
                  { id: 'someone-else', phase: 'phase-1', permissions: { modify: true } },
                ],
              },
            },
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      useUserStore().userId = 'current-user';
      await flushPromises();

      const accountDetails = wrapper.findComponent({ name: 'RequestAccountDetails' });
      expect(accountDetails.props('readOnly')).toBe(true);
    });

    it('keeps a deleteAccount request read-only even with a permitted active actor', async () => {
      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'deleteAccount',
            phases: [{ name: 'phase-1' }],
            decision: {
              actors: {
                active: [
                  { id: 'current-user', phase: 'phase-1', permissions: { modify: true } },
                ],
              },
            },
            request: {
              account: { accountId: 'account-1' },
            },
          },
        },
      });
      useUserStore().userId = 'current-user';
      await flushPromises();

      const accountDetails = wrapper.findComponent({ name: 'RequestAccountDetails' });
      expect(accountDetails.props('readOnly')).toBe(true);
    });

    it.each(['createAccount', 'modifyAccount'])('shows only the assigned custom form for a %s request when one exists', async (accountRequestType) => {
      jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: accountFormSchema });

      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: accountRequestType,
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      // custom form renders, OOTB account form does not
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'RequestAccountDetails' }).exists()).toBe(false);
    });

    it('falls back to the OOTB account form when no form is assigned', async () => {
      jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [] } });

      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(wrapper.findComponent({ name: 'RequestAccountDetails' }).exists()).toBe(true);
    });

    it('holds the OOTB account form back while the form assignment is still resolving', async () => {
      jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockReturnValue(new Promise(() => {}));

      const wrapper = setup({
        item: {
          details: {},
          rawData: {
            requestType: 'createAccount',
            request: {
              account: {
                accountId: 'account-1', applicationId: 'app-1', objectType: 'User',
              },
            },
          },
        },
      });
      await flushPromises();

      expect(wrapper.findComponent({ name: 'RequestAccountDetails' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'RequestFormManager' }).exists()).toBe(true);
    });
  });

  describe('forms', () => {
    const testFormSchema = {
      form: {
        fields: [
          {
            id: 'rowid',
            fields: [
              {
                label: 'testLabel',
                model: 'testModel',
                name: 'test',
                type: 'string',
                layout: {
                  offset: 0,
                  columns: 12,
                },
                validation: {
                  required: true,
                },
              },
            ],
          },
        ],
      },
    };

    describe('custom request', () => {
      const customRequestItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
            phases: [{ name: 'testPhase' }],
            workflow: { id: 'testWorkflowId' },
            requestType: 'custom',
          },
        },
      };

      it('shows a workflow form if present and is an approval', async () => {
        const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
          .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
        const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
          .mockResolvedValue({ data: testFormSchema });

        const wrapper = setup({ isApproval: true, ...customRequestItem });
        await flushPromises();

        expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
        expect(formSpy).toHaveBeenCalledWith('someForm');
        expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
      });

      it('shows the request type form if present and not an approval', async () => {
        const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByRequestType')
          .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
        const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
          .mockResolvedValue({ data: testFormSchema });

        const wrapper = setup(customRequestItem);
        await flushPromises();

        expect(assignmentSpy).toHaveBeenCalledWith('custom');
        expect(formSpy).toHaveBeenCalledWith('someForm');
        expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
      });

      it('shows no form if no form assigned', async () => {
        jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByRequestType')
          .mockResolvedValue({ data: { result: [] } });
        const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
          .mockResolvedValue({ data: { result: [] } });

        const wrapper = setup(customRequestItem);
        await flushPromises();

        expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
        expect(wrapper.find('[label="testLabel"]').exists()).toBe(false);
      });
    });

    describe('application request', () => {
      const applicationRequestItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
            phases: [{ name: 'testPhase' }],
            workflow: { id: 'testWorkflowId' },
            requestType: 'applicationGrant',
            application: {
              id: 'testApp',
              connectorId: 'testConnector',
              mappingNames: [
                'systemTestconnectorAccount_managedAlpha_user',
              ],
            },
          },
        },
      };

      it('shows an application form if no worklow form', async () => {
        const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
          .mockResolvedValue({ data: { result: [] } });
        const applicationAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
          .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
        const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
          .mockResolvedValue({ data: testFormSchema });

        const wrapper = setup(applicationRequestItem);
        await flushPromises();

        expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
        expect(applicationAssignmentSpy).toHaveBeenCalledWith('testApp', 'Account', undefined);
        expect(formSpy).toHaveBeenCalledWith('someForm');
        expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
      });

      it('shows no form if no worklow form and no application form', async () => {
        const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
          .mockResolvedValue({ data: { result: [] } });
        const applicationAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
          .mockResolvedValue({ data: { result: [] } });

        const wrapper = setup(applicationRequestItem);
        await flushPromises();

        expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
        expect(applicationAssignmentSpy).toHaveBeenCalledWith('testApp', 'Account', undefined);
        expect(wrapper.find('[label="testLabel"]').exists()).toBe(false);
      });
    });

    it('calls to save a request', async () => {
      const requestSpy = jest.spyOn(AccessRequestApi, 'requestAction').mockResolvedValue({ data: {} });
      jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: testFormSchema });

      const formItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
            id: 'testId',
            phases: [{ name: 'testPhase' }],
            workflow: { id: 'testWorkflowId' },
            requestType: 'custom',
            request: {
              common: {
                blob: {
                  form: {
                    existingData: 'existing data',
                  },
                },
              },
            },
          },
        },
      };

      const wrapper = setup({ isApproval: true, ...formItem });
      await flushPromises();
      await wrapper.find('input[name="testLabel"]').setValue('a custom value');
      await flushPromises();
      await wrapper.find('button.btn-primary').trigger('click');

      const expectedPayload = {
        common: {
          blob: {
            form: {
              existingData: 'existing data',
            },
          },
        },
        testModel: 'a custom value',
      };

      expect(requestSpy).toHaveBeenCalledWith(
        'testId',
        'modify',
        'testPhase',
        expectedPayload,
      );
    });

    it('calls to save a request as a draft', async () => {
      const requestSpy = jest.spyOn(AccessRequestApi, 'putCustomRequest').mockResolvedValue({ data: {} });

      const formItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
            id: 'testId',
            phases: [{ name: 'testPhase' }],
            workflow: { id: 'testWorkflowId' },
            requestType: 'createRole',
            request: {
              common: {
                externalRoleId: 'testExternalRoleId',
                isDraft: true,
                blob: {
                  form: {
                    existingData: 'existing data',
                  },
                },
              },
              role: {
                glossary: {},
                object: {
                  entitlements: [],
                  addedRoleMembers: [],
                },
              },
            },
          },
        },
      };

      const wrapper = setup({ isDraft: true, ...formItem });
      await flushPromises();
      const saveDraftButton = wrapper.find('button.btn-outline-primary.mr-2');
      await saveDraftButton.trigger('click');
      const expectedPayload = {
        common: {
          isDraft: true,
        },
        role: {
          glossary: {},
          object: {
            addedRoleMembers: [],
            entitlements: [],
          },
        },
      };

      expect(requestSpy).toHaveBeenCalledWith(
        'testId',
        expectedPayload,
      );
    });

    it('calls to publish a saved draft request', async () => {
      const requestSpy = jest.spyOn(AccessRequestApi, 'putCustomRequest').mockResolvedValue({ data: {} });

      const formItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
            id: 'testId',
            phases: [{ name: 'testPhase' }],
            workflow: { id: 'testWorkflowId' },
            requestType: 'createRole',
            request: {
              common: {
                externalRoleId: 'testExternalRoleId',
                isDraft: true,
                blob: {
                  form: {
                    existingData: 'existing data',
                  },
                },
              },
              role: {
                glossary: {},
                object: {
                  entitlements: [],
                  addedRoleMembers: [],
                },
              },
            },
          },
        },
      };

      const wrapper = setup({ isDraft: true, ...formItem });
      await flushPromises();
      const saveDraftButton = wrapper.findAll('button.btn-primary');
      // index 1: FrRequestFormManager renders a btn-primary at index 0; the role-specific Submit button is index 1
      await saveDraftButton[1].trigger('click');
      await flushPromises();
      const expectedPayload = {
        common: {
          isDraft: false,
        },
        role: {
          glossary: {},
          object: {
            addedRoleMembers: [],
            entitlements: [],
          },
        },
      };

      expect(requestSpy).toHaveBeenCalledWith(
        'testId',
        expectedPayload,
      );

      expect(routerPush).toHaveBeenCalledWith('/my-requests');
    });
  });
});
