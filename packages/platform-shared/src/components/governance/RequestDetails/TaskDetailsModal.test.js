/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
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
  it('sets aria-label combining subtitle and task name when provided', () => {
    wrapper = setup();
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('ariaLabel')).toBe('governance.requestModal.titles.taskDetails: Sample Task');
  });

  it('shows subtitle with undefined when task has no name', () => {
    wrapper = setup({ taskDetails: { ...TASK_DETAILS, name: undefined } });
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('ariaLabel')).toBe('governance.requestModal.titles.taskDetails: undefined');
  });

  it('renders task details correctly', () => {
    wrapper = setup();
    expect(wrapper.find('.modal-title').element.tagName).toBe('H2');
    expect(wrapper.find('.modal-title').classes()).toContain('h5');
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

  it('shows the "Completed by" row when taskDetails.completedBy is populated', () => {
    const taskWithCompletedBy = cloneDeep(TASK_DETAILS);
    taskWithCompletedBy.completedBy = [{ givenName: 'Alice', sn: 'Smith' }];
    wrapper = setup({ taskDetails: taskWithCompletedBy });
    const labels = wrapper.findAll('.font-weight-bold');
    const labelTexts = labels.map((l) => l.text());
    expect(labelTexts).toContain('common.completedBy');
    // 2 approvers + 1 completedBy user
    expect(wrapper.findAll('[data-testid="user-info"]').length).toBe(3);
  });

  it('shows system text instead of a profile icon when completed by SYSTEM', () => {
    const systemCompletedTask = cloneDeep(TASK_DETAILS);
    systemCompletedTask.completedBy = [{ id: 'SYSTEM' }];
    wrapper = setup({ taskDetails: systemCompletedTask });
    const labels = wrapper.findAll('.font-weight-bold');
    const labelTexts = labels.map((l) => l.text());
    expect(labelTexts).toContain('common.completedBy');
    expect(wrapper.text()).toContain('common.system');
    // Only the 2 approvers render; the SYSTEM completedBy does not
    expect(wrapper.findAll('[data-testid="user-info"]').length).toBe(2);
  });

  it('shows system text alongside other users when completedBy includes SYSTEM', () => {
    const mixedCompletedTask = cloneDeep(TASK_DETAILS);
    mixedCompletedTask.completedBy = [{ id: 'SYSTEM' }, { givenName: 'Alice', sn: 'Smith' }];
    wrapper = setup({ taskDetails: mixedCompletedTask });
    expect(wrapper.text()).toContain('common.system');
    // 2 approvers + the 1 non-SYSTEM completedBy user
    expect(wrapper.findAll('[data-testid="user-info"]').length).toBe(3);
  });

  it('hides the "Completed by" row when taskDetails.completedBy is not set', () => {
    wrapper = setup();
    const labels = wrapper.findAll('.font-weight-bold');
    const labelTexts = labels.map((l) => l.text());
    expect(labelTexts).not.toContain('common.completedBy');
  });
});
