/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { required } from '@vee-validate/rules';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';
import DetailsTab from './DetailsTab';
import i18n from '@/i18n';

defineRule('required', () => required);

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');

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
          },
          request: {
            common: {
              justification: 'justification.',
            },
          },
          requestType: 'requestType test',
        },
      },
      ...propsData,
    };

    return mount(DetailsTab, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  };

  jest.spyOn(RequestFormAssignmentsApi, 'getFormAssignmentByRequestType').mockResolvedValue({ data: { result: [] } });

  it('initializes with the correct default data structure based on props', async () => {
    const wrapper = setup();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.details.status.name).toContain('Approved');
  });

  it('initializes with the correct default data structure based on props when outcome is presented', async () => {
    const wrapper = setup();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.details.outcome.name).toContain('Provisioned');
  });

  it('handles when the request is submitted by the system', async () => {
    const wrapper = setup({
      item: {
        details: {
          requestedBy: {
            id: 'SYSTEM',
          },
        },
        rawData: {
          decision: {
            outcome: 'provisioned',
          },
        },
      },
    });
    await flushPromises();
    const requestedBy = wrapper.find('.row');
    expect(requestedBy.text()).toBe('StatusPendingRequest ID');
  });

  it('shows external request id if present', async () => {
    const wrapper = setup({
      item: {
        details: {},
        rawData: {
          request: { common: { externalRequestId: 'externalId' } },
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('externalId');
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

    describe('create entitlement request', () => {
      const createEntitlementRequestItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
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

      it('creates the correct payload to modify the request', async () => {
        const requestSpy = jest.spyOn(AccessRequestApi, 'requestAction').mockResolvedValue({ data: {} });
        const wrapper = setup(createEntitlementRequestItem);
        await flushPromises();

        const form = wrapper.findComponent(FrDefaultEntitlementForm);
        form.vm.$emit('update:glossaryValues', { testGlossaryProperty: 'customValue' });
        form.vm.$emit('update:entitlementValues', { testObjectProperty: 'customValue2' });

        await wrapper.find('button.btn-primary').trigger('click');

        const expectedPayload = {
          entitlement: {
            objectType: 'testObjectType',
            glossary: {
              testGlossaryProperty: 'customValue',
            },
            object: {
              testObjectProperty: 'customValue2',
            },
          },
        };

        expect(requestSpy).toHaveBeenCalledWith(
          'testId',
          'modify',
          'testPhase',
          expectedPayload,
        );
      });
    });

    describe('modify entitlement request', () => {
      const modifyEntitlementRequestItem = {
        item: {
          details: {
            id: 'testId',
          },
          rawData: {
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

      it('creates the correct payload to modify the request', async () => {
        const requestSpy = jest.spyOn(AccessRequestApi, 'requestAction').mockResolvedValue({ data: {} });
        const wrapper = setup(modifyEntitlementRequestItem);
        await flushPromises();

        const form = wrapper.findComponent(FrDefaultEntitlementForm);
        form.vm.$emit('update:glossaryValues', { testGlossaryProperty: 'customValue' });
        form.vm.$emit('update:entitlementValues', { testObjectProperty: 'customValue2' });

        await wrapper.find('button.btn-primary').trigger('click');

        const expectedPayload = {
          entitlement: {
            glossary: {
              testGlossaryProperty: 'customValue',
            },
            object: {
              testObjectProperty: 'customValue2',
            },
          },
        };

        expect(requestSpy).toHaveBeenCalledWith(
          'testId',
          'modify',
          'testPhase',
          expectedPayload,
        );
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
