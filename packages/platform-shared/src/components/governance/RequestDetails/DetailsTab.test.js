/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as applicationImageResolver from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as Glossary from '@forgerock/platform-shared/src/utils/governance/glossary';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import DetailsTab from './DetailsTab';
import i18n from '@/i18n';

mockValidation(['required']);
jest.mock('axios');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi');
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
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
GlossaryApi.getGlossaryAttributes.mockImplementation(() => Promise.resolve({
  data: {
    result: [
      {
        name: 'testGlossaryProperty',
        type: 'string',
        displayName: 'test glossary property',
      },
    ],
  },
}));
Glossary.getGlossarySchema = jest.fn().mockImplementation(() => Promise.resolve([
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
    metadata: {
      modifiedDate: '2025-11-06T16:47:06.809946805Z',
      createdDate: '2025-11-06T16:47:06.809940423Z',
    },
  },
]));

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
  const setup = (propsData = {}) => {
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
          requestType: 'modifyRole',
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
        expect(applicationAssignmentSpy).toHaveBeenCalledWith('testApp', 'Account');
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
        expect(applicationAssignmentSpy).toHaveBeenCalledWith('testApp', 'Account');
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
  });
});
