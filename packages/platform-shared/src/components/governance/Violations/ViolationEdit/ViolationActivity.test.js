/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ViolationActivity from './ViolationActivity';
import i18n from '@/i18n';

describe('Violation Activity', () => {
  const violation = {
    decision: {
      startDate: '2024-05-08T16:33:22+00:00',
      comments: [
        {
          action: 'assignment',
          comment: 'testAssignment',
          timeStamp: '2024-05-08T16:33:24+00:00',
        },
        {
          action: 'reasign',
          comment: 'testReassign',
          timeStamp: '2024-05-08T16:33:24+00:00',
        },
        {
          action: 'allow',
          comment: 'testAllow',
          timeStamp: '2024-05-08T16:33:24+00:00',
        },
      ],
    },
  };

  function mountComponent(props) {
    const wrapper = mount(ViolationActivity, {
      global: {
        plugins: [i18n],
      },
      props: { ...props },
    });
    return wrapper;
  }

  it('should generate an initial violation step based on start date', () => {
    const wrapper = mountComponent({ violation });

    const initial = wrapper.find('li');
    expect(initial.text()).toMatch('May 8, 2024Initial Violation');
  });

  it('should generate basic timeline based off comments', () => {
    const wrapper = mountComponent({ violation });

    const steps = wrapper.findAll('li');
    expect(steps[1].text()).toMatch('May 8, 2024testAssignment');
    expect(steps[2].text()).toMatch('PendingException Allowed');
  });

  it('should handle exception grants', () => {
    const violationWithExceptionGrant = {
      decision: {
        startDate: '2024-05-08T16:33:22+00:00',
        comments: [
          {
            action: 'exception',
            comment: 'Exception granted until May 30, 2024 12:00 AM',
            timeStamp: '2024-05-08T16:33:24+00:00',
          },
        ],
      },
    };

    const wrapper = mountComponent({ violation: violationWithExceptionGrant });
    const steps = wrapper.findAll('li');
    expect(steps[1].text()).toMatch('PendingException granted until May 30, 2024 12:00 AM');
  });

  it('should handle exception extensions', () => {
    const violationWithExceptionExtended = {
      decision: {
        startDate: '2024-05-08T16:33:22+00:00',
        comments: [
          {
            action: 'exception',
            comment: 'Exception extended until May 30, 2024 12:00 AM',
            timeStamp: '2024-05-08T16:33:24+00:00',
          },
        ],
      },
    };

    const wrapper = mountComponent({ violation: violationWithExceptionExtended });
    const steps = wrapper.findAll('li');
    expect(steps[1].text()).toMatch('PendingException extended until May 30, 2024 12:00 AM');
  });

  it('should handle cancel exceptions', () => {
    const violationWithExceptionCanceled = {
      decision: {
        startDate: '2024-05-08T16:33:22+00:00',
        comments: [
          {
            action: 'cancel-exception',
            comment: 'testCancel',
            timeStamp: '2024-05-08T16:33:24+00:00',
          },
        ],
      },
    };

    const wrapper = mountComponent({ violation: violationWithExceptionCanceled });
    const steps = wrapper.findAll('li');
    expect(steps[1].text()).toMatch('PendingtestCancel');
  });
});
