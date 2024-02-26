/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
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

function setup() {
  wrapper = mount(TaskDetailsModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      taskDetails: TASK_DETAILS,
      visible: true,
    },
  });
}

describe('TaskDetailsModal', () => {
  beforeEach(() => setup());
  it('renders task details correctly', () => {
    expect(wrapper.find('.modal-title').text()).toBe(TASK_DETAILS.name);
    expect(wrapper.find('[data-testid="status-badge"]').text()).toBe(TASK_DETAILS.status);
    expect(wrapper.find('[data-testid="task-name"]').text()).toBe(TASK_DETAILS.name);
    expect(wrapper.find('[data-testid="start-date"]').text()).toBe(TASK_DETAILS.startDate);
    expect(wrapper.find('[data-testid="workflow-id"]').text()).toBe(TASK_DETAILS.workflowId);
  });
});
