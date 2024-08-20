/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import DetailsTab from './DetailsTab';
import i18n from '@/i18n';
import store from '@/store';

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

  it('initializes with the correct default data structure based on props', async () => {
    const wrapper = setup();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.details.requested.name).toBe('name test');
    expect(wrapper.vm.details.status.name).toContain('Approved');
  });

  it('handles when the request is submitted by the system', async () => {
    const wrapper = setup({
      item: {
        details: {
          requestedBy: {
            id: 'SYSTEM',
          },
        },
        rawData: {},
      },
    });
    await flushPromises();
    const requestedBy = wrapper.find('.row');
    expect(requestedBy.text()).toBe('StatusPendingPriority--');
  });

  it('shows requested if present', async () => {
    const wrapper = setup({
      item: {
        details: {
          name: 'name test',
          icon: 'icon test',
          description: 'description test',
        },
        rawData: {
          requestType: 'requestType test',
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Requested');
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
    beforeEach(() => { store.state.SharedStore.governanceDevEnabled = true; });
    afterEach(() => { store.state.SharedStore.governanceDevEnabled = false; });

    const testFormSchema = {
      form: {
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
            required: false,
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
      await wrapper.findComponent('#testLabel').vm.$emit('input', 'a custom value');
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
