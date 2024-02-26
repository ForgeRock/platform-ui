/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
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
