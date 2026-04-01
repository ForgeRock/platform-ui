/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import When from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('When View', () => {
  let wrapper;

  CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));

  describe('initializes with default values', () => {
    beforeEach(() => {
      wrapper = mount(When, {
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
        props: {
          value: {
            closeAction: '',
            closeActionDuration: 0,
            closeActionTime: '',
            duration: 0,
            enableSchedule: false,
            expireOption: 0,
            reassignUser: '',
            reassignUserInfo: {},
            scheduleConstraint: '',
            scheduleDuration: 0,
            scheduleTimespan: '',
            timespan: '',
          },
        },
      });
    });

    it('When page loaded', () => {
      expect(wrapper.vm.isExistingSchedule).toBe(false);
    });
  });

  describe('initializes with non default values', () => {
    beforeEach(() => {
      wrapper = mount(When, {
        global: {
          mocks: {
            $t: (text) => (text),
          },
          stubs: ['FrTimeConstraint'],
        },
        props: {
          value: {
            closeAction: 'revoke',
            closeActionDuration: 4,
            closeActionTime: 'governance.timespans.afterADuration',
            duration: 1,
            enableSchedule: true,
            expireOption: 0,
            reassignUser: '',
            reassignUserInfo: {},
            scheduleConstraint: '2020-04-25T07:00:00.000Z/2020-04-30T07:00:00.000Z',
            scheduleDuration: 2,
            scheduleTimespan: 'governance.timespans.months',
            timespan: 'governance.timespans.days',
          },
        },
      });
    });

    it('initializes form with values from value prop', async () => {
      expect(findByTestId(wrapper, 'enable-schedule').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'input-schedule-duration').element.value).toBe('2');
      expect(findByTestId(wrapper, 'schedule-timespan').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'schedule-timespan').find('span').text()).toBe('month(s)');
      expect(findByTestId(wrapper, 'input-duration').element.value).toBe('1');
      expect(findByTestId(wrapper, 'timespan').find('span').text()).toBe('day(s)');
      expect(findByTestId(wrapper, 'close-action').find('span').text()).toBe('governance.editTemplate.closeActions.revoke');
      expect(findByTestId(wrapper, 'close-action-time').find('span').text()).toBe('after a duration');
      expect(findByTestId(wrapper, 'input-close-action-duration').element.value).toBe('4');
      expect(wrapper.vm.isExistingSchedule).toBe(true);
    });
  });

  it('hides scheduling options for event based certs', () => {
    wrapper = mount(When, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        value: {
          closeAction: '',
          closeActionDuration: 0,
          closeActionTime: '',
          duration: 0,
          enableSchedule: false,
          expireOption: 0,
          reassignUser: '',
          reassignUserInfo: {},
          scheduleConstraint: '',
          scheduleDuration: 0,
          scheduleTimespan: '',
          timespan: '',
        },
        eventBased: true,
      },
    });

    expect(findByTestId(wrapper, 'enable-schedule').exists()).toBeFalsy();
  });
});
