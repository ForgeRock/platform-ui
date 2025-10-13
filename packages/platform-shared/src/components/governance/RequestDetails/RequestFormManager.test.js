/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import RequestFormManager from './RequestFormManager';
import i18n from '@/i18n';

mockValidation(['required', 'email']);

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');

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

SchemaApi.getSchema.mockImplementation(() => Promise.resolve({
  data: {
    properties: {
      userName: {
        title: 'Username',
        type: 'string',
        viewable: true,
      },
    },
    order: [
      'userName',
    ],
    title: 'alpha_user',
  },
}));

jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByRequestType').mockResolvedValue({ data: { result: [] } });

describe('RequestFormManager', () => {
  const setup = (propsData = {}) => {
    const props = {
      request: {
        decision: {
          decision: 'approved',
          outcome: 'provisioned',
        },
        request: {
          common: {
            justification: 'justification.',
          },
        },
        requestType: 'requestType test',
      },
      ...propsData,
    };

    setupTestPinia(undefined, false);
    return mount(RequestFormManager, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  };

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
      phases: [{ name: 'testPhase' }],
      workflow: { id: 'testWorkflowId' },
      requestType: 'custom',
    };

    it('shows a workflow form if present and is an approval', async () => {
      const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: testFormSchema });

      const wrapper = setup({ isApproval: true, request: customRequestItem });
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

      const wrapper = setup({ request: customRequestItem });
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

      const wrapper = setup({ request: customRequestItem });
      await flushPromises();

      expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(false);
    });
    it('shows request details for custom requestTypes', async () => {
      const customRequestItemDetails = {
        phases: [{ name: 'testPhase' }],
        workflow: { id: 'testWorkflowId' },
        requestType: 'custom',
        request: { custom: { userName: 'testName' }, common: { justification: 'justification.' } },
      };
      jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByRequestType')
        .mockResolvedValue({ data: { result: [] } });
      const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [] } });

      const wrapper = setup({ request: customRequestItemDetails });
      await flushPromises();

      expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
      expect(wrapper.find('h3').text()).toBe('Request Details');
      expect(wrapper.find('div[class="col-sm-4 weight-600"').text()).toBe('userName');
    });
  });

  describe('application request', () => {
    const applicationRequestItem = {
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
    };

    it('shows an application form if no worklow form', async () => {
      const applicationAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: testFormSchema });

      const wrapper = setup({ request: applicationRequestItem });
      await flushPromises();

      expect(applicationAssignmentSpy).toHaveBeenCalledWith('testApp', 'Account');
      expect(formSpy).toHaveBeenCalledWith('someForm');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
    });

    it('shows no form if no worklow form and no application form', async () => {
      const applicationAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [] } });

      const wrapper = setup(applicationRequestItem);
      await flushPromises();

      expect(applicationAssignmentSpy).toHaveBeenCalledWith('testApp', 'Account');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(false);
    });
  });

  describe('create entitlement request', () => {
    const createEntitlementRequestItem = {
      request: {
        id: 'testId',
        phases: [{ name: 'testPhase' }],
        workflow: { id: 'testWorkflowId' },
        requestType: 'createEntitlement',
        application: { id: 'testApp' },
        request: {
          entitlement: {
            glossary: {
              testGlossaryProperty: 'test1',
            },
            object: {
              testObjectProperty: 'test2',
            },
            objectType: 'testObjectType',
          },
        },
      },
    };

    it('loads request data into form', async () => {
      const wrapper = setup(createEntitlementRequestItem);
      await flushPromises();

      expect(wrapper.find('[label="test glossary property"]').exists()).toBe(true);
      expect(wrapper.find('[id="test glossary property"]').attributes('value')).toBe('test1');

      expect(wrapper.find('[label="test object property"]').exists()).toBe(true);
      expect(wrapper.find('[id="test object property"]').attributes('value')).toBe('test2');
    });
  });

  describe('modify entitlement request', () => {
    const modifyEntitlementRequestItem = {
      request: {
        id: 'testId',
        phases: [{ name: 'testPhase' }],
        workflow: { id: 'testWorkflowId' },
        requestType: 'modifyEntitlement',
        application: { id: 'testApp' },
        request: {
          entitlement: {
            glossary: {
              testGlossaryProperty: 'test1',
            },
            object: {
              testObjectProperty: 'test2',
            },
          },
        },
      },
    };

    it('loads request data into form', async () => {
      const wrapper = setup(modifyEntitlementRequestItem);
      await flushPromises();

      expect(wrapper.find('[label="test glossary property"]').exists()).toBe(true);
      expect(wrapper.find('[id="test glossary property"]').attributes('value')).toBe('test1');

      expect(wrapper.find('[label="test object property"]').exists()).toBe(true);
      expect(wrapper.find('[id="test object property"]').attributes('value')).toBe('test2');
    });
  });

  const userFormSchema = {
    form: {
      fields: [
        {
          id: 'rowid',
          fields: [
            {
              label: 'testLabel',
              model: 'user.userName',
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

  describe('create user request', () => {
    const createUserRequest = {
      request: {
        id: 'testId',
        phases: [{ name: 'testPhase' }],
        workflow: { id: 'testWorkflowId' },
        requestType: 'createUser',
        request: {
          user: {
            object: {
              userName: 'testUser',
              givenName: 'Test',
              sn: 'User',
            },
          },
        },
      },
    };

    it('shows default user form if no custom form', async () => {
      const userAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByLcmOperation')
        .mockResolvedValue({ data: { result: [] } });

      const wrapper = setup(createUserRequest);
      await flushPromises();

      expect(userAssignmentSpy).toHaveBeenCalledWith('user', 'create');
      expect(wrapper.find('[label="Username"]').exists()).toBe(true);
      expect(wrapper.find('[label="First Name"]').exists()).toBe(true);
      expect(wrapper.find('[label="Last Name"]').exists()).toBe(true);
      expect(wrapper.find('[label="Email Address"]').exists()).toBe(true);
    });

    it('shows custom form if present', async () => {
      const userAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByLcmOperation')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: userFormSchema });

      const wrapper = setup(createUserRequest);
      await flushPromises();

      expect(userAssignmentSpy).toHaveBeenCalledWith('user', 'create');
      expect(formSpy).toHaveBeenCalledWith('someForm');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
    });

    it('shows a workflow form if present and is an approval', async () => {
      const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: userFormSchema });

      const wrapper = setup({ isApproval: true, ...createUserRequest });
      await flushPromises();

      expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
      expect(formSpy).toHaveBeenCalledWith('someForm');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
    });

    it('workflow form has values populated from the request data', async () => {
      jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: userFormSchema });

      const wrapper = setup({ isApproval: true, ...createUserRequest });
      await flushPromises();

      expect(wrapper.find('.fr-field').exists()).toBe(true);
      expect(wrapper.find('.fr-field').attributes('value')).toBe('testUser');
    });
  });

  describe('modify user request', () => {
    const modifyUserRequest = {
      request: {
        id: 'testId',
        phases: [{ name: 'testPhase' }],
        workflow: { id: 'testWorkflowId' },
        requestType: 'modifyUser',
        request: {
          user: {
            object: {
              userName: 'testUser',
              givenName: 'Test',
              sn: 'User',
            },
          },
        },
      },
    };

    it('shows default user form if no custom form', async () => {
      const userAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByLcmOperation')
        .mockResolvedValue({ data: { result: [] } });

      const wrapper = setup(modifyUserRequest);
      await flushPromises();

      expect(userAssignmentSpy).toHaveBeenCalledWith('user', 'update');
      expect(wrapper.find('[label="Username"]').exists()).toBe(true);
    });

    it('shows custom form if present', async () => {
      const userAssignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByLcmOperation')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: userFormSchema });

      const wrapper = setup(modifyUserRequest);
      await flushPromises();

      expect(userAssignmentSpy).toHaveBeenCalledWith('user', 'update');
      expect(formSpy).toHaveBeenCalledWith('someForm');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
    });

    it('shows a workflow form if present and is an approval', async () => {
      const assignmentSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: userFormSchema });

      const wrapper = setup({ isApproval: true, ...modifyUserRequest });
      await flushPromises();

      expect(assignmentSpy).toHaveBeenCalledWith('testWorkflowId', 'testPhase');
      expect(formSpy).toHaveBeenCalledWith('someForm');
      expect(wrapper.find('[label="testLabel"]').exists()).toBe(true);
    });

    it('workflow form has values populated from the request data', async () => {
      jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByWorkflowNode')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: userFormSchema });

      const wrapper = setup({ isApproval: true, ...modifyUserRequest });
      await flushPromises();

      expect(wrapper.find('.fr-field').exists()).toBe(true);
      expect(wrapper.find('.fr-field').attributes('value')).toBe('testUser');
    });
  });
});
