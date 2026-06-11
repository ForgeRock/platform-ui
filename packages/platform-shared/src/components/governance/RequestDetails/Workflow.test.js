/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Workflow, { statuses } from './Workflow';

describe('Workflow', () => {
  describe('component shallow mounted', () => {
    const defaultPropsData = {
      item: {
        details: {
          date: '2023-06-22T19:23:26+00:00',
        },
        rawData: {
          decision: {
            status: statuses[0],
          },
        },
      },
    };
    const createWrapper = (props) => mount(Workflow, {
      props,
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
    });

    it('component should display all 4 steps', () => {
      const wrapper = createWrapper(defaultPropsData);
      const listItems = wrapper.findAll('.list-workflow-item');
      expect(listItems.length).toBe(4);
      expect(listItems[0].text()).toContain('requestSubmitted');
      expect(listItems[1].text()).toContain('awaitingApproval');
      expect(listItems[2].text()).toContain('provisioning');
      expect(listItems[3].text()).toContain('requestComplete');
    });

    it('component should show 1 complete and 3 pending steps when status is provisioning', () => {
      const wrapper = createWrapper(defaultPropsData);
      const listItems = wrapper.findAll('.list-workflow-item');
      expect(listItems.length).toBe(4);
      expect(listItems[0].text()).toContain('Jun 22, 2023'); // shows date completed
      expect(listItems[1].text()).toContain('pending');
      expect(listItems[2].text()).toContain('pending');
      expect(listItems[3].text()).toContain('pending');
    });

    it('component should show 2 complete and 2 pending steps when status is provisioning', () => {
      const propsData = {
        item: {
          details: {
            date: '2023-06-22T19:23:26+00:00',
          },
          rawData: {
            decision: {
              status: statuses[1],
            },
          },
        },
      };
      const wrapper = createWrapper(propsData);
      const listItems = wrapper.findAll('.list-workflow-item');
      expect(listItems.length).toBe(4);
      expect(listItems[0].text()).toContain('Jun 22, 2023'); // shows date completed
      expect(listItems[1].text()).toContain('complete');
      expect(listItems[2].text()).toContain('pending');
      expect(listItems[3].text()).toContain('pending');
    });

    it('shows a failed step with no decision when comments contain a failure action', async () => {
      const propsData = {
        item: {
          details: { date: '2023-06-22T19:23:26+00:00' },
          rawData: {
            decision: {
              status: statuses[0],
              decision: null,
              comments: [{
                action: 'failure',
                comment: 'Provisioning failed: resource not found',
                timeStamp: '2023-06-23T10:00:00+00:00',
              }],
            },
          },
        },
      };
      const wrapper = createWrapper(propsData);
      const listItems = wrapper.findAll('.list-workflow-item');

      // Request Submitted + Awaiting Approval (failed) + Request Complete = 3 steps
      expect(listItems.length).toBe(3);

      const failedItem = listItems[1];
      expect(failedItem.classes()).toContain('failed');
      expect(failedItem.text()).toContain('awaitingApproval');
      expect(failedItem.text()).toContain('failed');

      // expand the error details
      const toggleButton = failedItem.find('button');
      expect(toggleButton.exists()).toBe(true);
      expect(toggleButton.attributes('aria-expanded')).toBe('false');
      await toggleButton.trigger('click');
      expect(toggleButton.attributes('aria-expanded')).toBe('true');
      expect(failedItem.text()).toContain('Provisioning failed: resource not found');
    });

    it('shows a failed provisioning step with a decision when comments contain a failure action', async () => {
      const propsData = {
        item: {
          details: { date: '2023-06-22T19:23:26+00:00' },
          rawData: {
            decision: {
              status: statuses[1],
              decision: 'approved',
              comments: [{
                action: 'failure',
                comment: 'Provisioning failed: quota exceeded',
                timeStamp: '2023-06-23T10:00:00+00:00',
              }],
            },
          },
        },
      };
      const wrapper = createWrapper(propsData);
      const listItems = wrapper.findAll('.list-workflow-item');

      // Request Submitted + Awaiting Approval + Provisioning (failed) + Request Complete = 4 steps
      expect(listItems.length).toBe(4);

      const failedItem = listItems[2];
      expect(failedItem.classes()).toContain('failed');
      expect(failedItem.text()).toContain('provisioning');
      expect(failedItem.text()).toContain('failed');

      const toggleButton = failedItem.find('button');
      await toggleButton.trigger('click');
      expect(toggleButton.attributes('aria-expanded')).toBe('true');
      expect(failedItem.text()).toContain('Provisioning failed: quota exceeded');
    });

    it('component should show 4 complete steps when status is complete', () => {
      const propsData = {
        item: {
          details: {
            date: '2023-06-22T19:23:26+00:00',
          },
          rawData: {
            decision: {
              status: statuses[2],
              completionDate: '2023-06-24T19:23:26+00:00',
            },
          },
        },
      };
      const wrapper = createWrapper(propsData);
      const listItems = wrapper.findAll('.list-workflow-item');
      expect(listItems.length).toBe(4);
      expect(listItems[0].text()).toContain('Jun 22, 2023'); // shows date completed
      expect(listItems[1].text()).toContain('complete');
      expect(listItems[2].text()).toContain('complete');
      expect(listItems[3].text()).toContain('Jun 24, 2023');
    });
  });
});
