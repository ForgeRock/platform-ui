/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import RequestActionsCell from './RequestActionsCell';
import i18n from '@/i18n';

describe('RequestActionsCell', () => {
  let wrapper;

  function setup(props) {
    setupTestPinia({ user: { userId: '1234' } });
    return mount(RequestActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  function clickButtonAndAssertEvent(buttonIndex, event) {
    wrapper.findAll('[role="menuitem"]')[buttonIndex].trigger('click');
    expect(wrapper.emitted('action')[buttonIndex]).toEqual([event]);
  }

  describe('approval actions', () => {
    const approvalPermissions = {
      approve: true,
      reject: true,
      reassign: true,
      comment: true,
    };
    const item = {
      rawData: {
        phases: [{ permissions: approvalPermissions }],
        user: { id: '1234' },
      },
    };

    it('shows correct actions for approval details with permissions', () => {
      wrapper = setup({
        item,
        type: detailTypes.APPROVAL,
      });

      const buttons = wrapper.findAll('[role="menuitem"]');
      expect(buttons[0].text()).toMatch('Approve');
      expect(buttons[1].text()).toMatch('Reject');
      expect(buttons[2].text()).toMatch('Forward');
      expect(buttons[3].text()).toMatch('Add Comment');
      expect(buttons[4].text()).toMatch('View Details');
    });

    it('shows correct actions for approval details without permissions', () => {
      wrapper = setup({
        item: {
          rawData: { phases: [{ permissions: { comment: true } }] },
        },
        type: detailTypes.APPROVAL,
      });

      const buttons = wrapper.findAll('[role="menuitem"]');
      expect(buttons[0].text()).toMatch('Add Comment');
      expect(buttons[1].text()).toMatch('View Details');
    });

    it('hides approval action when self approval is false', () => {
      wrapper = setup({
        allowSelfApproval: false,
        item,
        type: detailTypes.APPROVAL,
      });

      const buttons = wrapper.findAll('[role="menuitem"]');
      expect(buttons[0].text()).toMatch('Reject');
      expect(buttons[1].text()).toMatch('Forward');
      expect(buttons[2].text()).toMatch('Add Comment');
      expect(buttons[3].text()).toMatch('View Details');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        item,
        type: detailTypes.APPROVAL,
      });
      clickButtonAndAssertEvent(0, 'APPROVE');
      clickButtonAndAssertEvent(1, 'REJECT');
      clickButtonAndAssertEvent(2, 'REASSIGN');
      clickButtonAndAssertEvent(3, 'COMMENT');
      clickButtonAndAssertEvent(4, 'DETAILS');
    });
  });

  describe('admin actions', () => {
    const adminRequestPermissions = {
      reassign: true,
    };

    it('shows correct actions for admin request with permissions', () => {
      wrapper = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
      });

      const buttons = wrapper.findAll('[role="menuitem"]');
      expect(buttons[0].text()).toMatch('View Details');
      expect(buttons[1].text()).toMatch('Forward');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
      });
      clickButtonAndAssertEvent(0, 'DETAILS');
      clickButtonAndAssertEvent(1, 'REASSIGN');
    });
  });

  describe('user request actions', () => {
    const userRequestPermissions = {
      cancel: true,
    };

    it('shows correct actions for user request with permissions', () => {
      wrapper = setup({
        permissions: userRequestPermissions,
        type: detailTypes.USER_REQUEST,
      });

      const buttons = wrapper.findAll('[role="menuitem"]');
      expect(buttons[0].text()).toMatch('View Details');
      expect(buttons[1].text()).toMatch('Cancel');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        permissions: userRequestPermissions,
        type: detailTypes.USER_REQUEST,
      });
      clickButtonAndAssertEvent(0, 'DETAILS');
      clickButtonAndAssertEvent(1, 'CANCEL');
    });
  });

  describe('fulfillment task actions', () => {
    const fulfillmentTaskPermissions = {
      cancel: true,
    };

    it('shows correct actions for fulfillment task with permissions', () => {
      wrapper = setup({
        permissions: fulfillmentTaskPermissions,
        type: detailTypes.FULFILLMENT,
      });

      const buttons = wrapper.findAll('[role="menuitem"]');
      expect(buttons[0].text()).toMatch('Complete');
      expect(buttons[1].text()).toMatch('Reject');
      expect(buttons[2].text()).toMatch('Forward');
      expect(buttons[3].text()).toMatch('Add Comment');
      expect(buttons[4].text()).toMatch('View Details');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        permissions: fulfillmentTaskPermissions,
        type: detailTypes.FULFILLMENT,
      });
      clickButtonAndAssertEvent(0, 'FULFILL');
      clickButtonAndAssertEvent(1, 'DENY');
      clickButtonAndAssertEvent(2, 'REASSIGN');
      clickButtonAndAssertEvent(3, 'COMMENT');
      clickButtonAndAssertEvent(4, 'DETAILS');
    });
  });
});
