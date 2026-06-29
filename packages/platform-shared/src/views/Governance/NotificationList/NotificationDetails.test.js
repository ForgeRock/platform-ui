/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import NotificationDetails from './NotificationDetails';

expect.extend(toHaveNoViolations);

const fullTask = {
  id: 'task-1',
  status: 'complete',
  template: 'requestAssigned',
  recipient: 'fyork@example.com',
  createdOn: 'May 07, 2026 7:25:17 PM',
  sendDate: 'May 07, 2026 7:25:56 PM',
  taskData: { template: 'requestAssigned', to: 'fyork@example.com' },
  metadata: { createdDate: '2026-05-07T19:25:17.000Z' },
};

function mountComponent(task = fullTask) {
  return mount(NotificationDetails, {
    global: {
      mocks: { $t: (t) => t },
    },
    props: { task },
  });
}

describe('NotificationDetails', () => {
  describe('formattedJson', () => {
    it('strips the display keys from the rendered JSON', () => {
      const wrapper = mountComponent();
      const json = JSON.parse(wrapper.find('pre').text());
      expect(json).not.toHaveProperty('template');
      expect(json).not.toHaveProperty('recipient');
      expect(json).not.toHaveProperty('createdOn');
      expect(json).not.toHaveProperty('sendDate');
    });

    it('preserves non-display keys', () => {
      const wrapper = mountComponent();
      const json = JSON.parse(wrapper.find('pre').text());
      expect(json.id).toBe('task-1');
      expect(json.status).toBe('complete');
      expect(json.metadata).toEqual({ createdDate: '2026-05-07T19:25:17.000Z' });
    });

    it('puts taskData last in the output', () => {
      const wrapper = mountComponent();
      const json = JSON.parse(wrapper.find('pre').text());
      const keys = Object.keys(json);
      expect(keys[keys.length - 1]).toBe('taskData');
    });

    it('taskData retains its original value', () => {
      const wrapper = mountComponent();
      const json = JSON.parse(wrapper.find('pre').text());
      expect(json.taskData).toEqual({ template: 'requestAssigned', to: 'fyork@example.com' });
    });

    it('omits taskData key when the task has no taskData', () => {
      const { taskData: _dropped, ...taskWithoutTaskData } = fullTask;
      const wrapper = mountComponent(taskWithoutTaskData);
      const json = JSON.parse(wrapper.find('pre').text());
      expect(json).not.toHaveProperty('taskData');
    });

    it('still strips display keys when taskData is absent', () => {
      const { taskData: _dropped, ...taskWithoutTaskData } = fullTask;
      const wrapper = mountComponent(taskWithoutTaskData);
      const json = JSON.parse(wrapper.find('pre').text());
      expect(json).not.toHaveProperty('template');
      expect(json).not.toHaveProperty('recipient');
      expect(json).not.toHaveProperty('createdOn');
      expect(json).not.toHaveProperty('sendDate');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const wrapper = mountComponent();
      await runA11yTest(wrapper);
    });
  });
});
