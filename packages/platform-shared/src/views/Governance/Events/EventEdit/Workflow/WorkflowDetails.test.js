/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import i18n from '@/i18n';
import WorkflowDetails from './WorkflowDetails';
import * as WorkflowApi from '@/api/governance/WorkflowApi';
import { WORKFLOW_STATUS } from '@/utils/workflowUtils';

mockValidation(['required']);

describe('WorkflowDetails', () => {
  let wrapper;

  function mountComponent() {
    return mount(WorkflowDetails, {
      global: {
        plugins: [
          i18n,
        ],
      },
    });
  }

  it('calls to get workflow definitions', async () => {
    const getWorkflowSpy = jest.spyOn(WorkflowApi, 'getWorkflowList').mockImplementation(() => Promise.resolve({
      data: {
        result: [
          {
            id: 1,
            displayName: 'one',
            status: WORKFLOW_STATUS.PUBLISHED,
          },
        ],
      },
    }));
    wrapper = mountComponent();
    await flushPromises();
    expect(getWorkflowSpy).toHaveBeenCalled();
  });

  it('only uses published workflows as an option', async () => {
    const getWorkflowSpy = jest.spyOn(WorkflowApi, 'getWorkflowList').mockImplementation(() => Promise.resolve({
      data: {
        result: [
          {
            id: 1,
            displayName: 'one',
            status: WORKFLOW_STATUS.PUBLISHED,
          },
          {
            id: 2,
            displayName: 'two',
            status: 'notPublished',
          },
        ],
      },
    }));
    wrapper = mountComponent();
    await flushPromises();
    expect(getWorkflowSpy).toHaveBeenCalled();
    expect(wrapper.vm.workflowOptions).toEqual([{ value: 1, text: 'one' }]);
  });
});
