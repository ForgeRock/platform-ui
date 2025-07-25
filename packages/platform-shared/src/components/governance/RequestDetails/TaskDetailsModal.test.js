/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import TaskDetailsModal from './TaskDetailsModal';

let wrapper;

const TASK_DETAILS = {
  name: 'Sample Task',
  approvers: ['John Doe', 'Jane Smith'],
  status: 'Pending',
  statusBadge: 'primary',
  startDate: '2024-02-14',
  workflowId: 'WF001',
};

function setup(props) {
  return mount(TaskDetailsModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      taskDetails: TASK_DETAILS,
      visible: true,
      ...props,
    },
  });
}

describe('TaskDetailsModal', () => {
  it('renders task details correctly', () => {
    wrapper = setup();
    expect(wrapper.find('.modal-title').text()).toBe(TASK_DETAILS.name);
    expect(wrapper.find('[data-testid="status-badge"]').text()).toBe(TASK_DETAILS.status);
    expect(wrapper.find('[data-testid="task-name"]').text()).toBe(TASK_DETAILS.name);
    expect(wrapper.find('[data-testid="start-date"]').text()).toBe(TASK_DETAILS.startDate);
    expect(wrapper.find('[data-testid="workflow-id"]').text()).toBe(TASK_DETAILS.workflowId);
  });

  it('does not show approvers on scheduled task', () => {
    const scheduledTask = cloneDeep(TASK_DETAILS);
    scheduledTask.type = 'scheduled';
    wrapper = setup({ taskDetails: scheduledTask });
    const labels = wrapper.findAll('.font-weight-bold');
    expect(labels[0].text()).not.toContain('approvers');
  });

  it('shows conditional properties', () => {
    const conditionalPropertiesTask = cloneDeep(TASK_DETAILS);
    conditionalPropertiesTask.completionDate = '2024-02-14T05:00:00Z';
    conditionalPropertiesTask.resumeDate = '2024-02-14T05:00:00Z';
    wrapper = setup({ taskDetails: conditionalPropertiesTask });
    const labels = wrapper.findAll('.font-weight-bold');
    expect(labels.length).toBe(7);
    expect(labels[4].text()).toContain('completionDate');
    expect(labels[5].text()).toContain('resumeDate');
  });
});
