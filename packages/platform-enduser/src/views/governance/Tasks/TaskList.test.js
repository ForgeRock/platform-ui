/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import TaskList from './TaskList';
import i18n from '@/i18n';

const mockRequest = {
  id: 3,
  decision: {
    status: 'in-progress',
    outcome: null,
    completionDate: null,
    deadline: null,
    comments: [],
    actors: {
      active: [
        {
          givenName: 'Manuel',
          id: 'managed/user/1234',
          mail: 'manuel.escobar@test.com',
          sn: 'Escobar',
          userName: 'manuel.escobar@test.com',
          phase: 'fulfillmentTask-7651340fcdfd',
        },
      ],
      inactive: [],
    },
    phases: [
      {
        name: 'fulfillmentTask-7651340fcdfd',
        displayName: 'Fulfillment Task Custom Name',
        type: 'fulfillment',
        status: 'in-progress',
        startDate: '2023-06-15T18:14:56+00:00',
      },
    ],
    startDate: '2023-06-10T19:23:26+00:00',
  },
  phases: [
    {
      name: 'fulfillmentTask-7651340fcdfd',
      type: 'fulfillment',
    },
  ],
};

describe('AccessReviews', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(TaskList, {
      global: { plugins: [i18n] },
      props: {
        tasks: [
          mockRequest,
        ],
      },
    });
  });

  describe(('applications'), () => {
    it('should show task name', async () => {
      expect(wrapper.text()).toMatch('Fulfillment Task Custom Name');
    });

    it('should show who the task is assigned to', () => {
      expect(wrapper.text()).toMatch('Assigned toManuel Escobar');
    });

    it('should show who the task assignment date', () => {
      expect(wrapper.text()).toMatch('Jun 15, 2023');
    });
  });
});
