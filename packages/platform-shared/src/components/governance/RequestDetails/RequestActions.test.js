/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import RequestActions from './RequestActions';
import i18n from '@/i18n';

describe('RequestActions', () => {
  let wrapper;

  function setup(props) {
    return mount(RequestActions, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  function clickButtonAndAssertEvent(buttonIndex, event) {
    wrapper.findAll('button')[buttonIndex].trigger('click');
    expect(wrapper.emitted('action')[buttonIndex]).toEqual([event]);
  }

  describe('approval actions', () => {
    const approvalPermissions = {
      approve: true,
      reject: true,
      reassign: true,
    };

    it('shows correct actions for approval details with permissions', () => {
      wrapper = setup({
        permissions: approvalPermissions,
        type: detailTypes.APPROVAL,
      });
      const buttons = wrapper.findAll('button');
      expect(buttons[0].text()).toMatch('Approve');
      expect(buttons[1].text()).toMatch('Reject');
      expect(buttons[2].text()).toMatch('Forward');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        permissions: approvalPermissions,
        type: detailTypes.APPROVAL,
      });
      clickButtonAndAssertEvent(0, 'APPROVE');
      clickButtonAndAssertEvent(1, 'REJECT');
      clickButtonAndAssertEvent(2, 'REASSIGN');
    });
  });

  describe('admin request actions', () => {
    const adminRequestPermissions = {
      reassign: true,
    };

    it('shows correct actions for admin request details with permissions', () => {
      wrapper = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
      });
      const buttons = wrapper.findAll('button');
      expect(buttons[0].text()).toMatch('Forward');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
      });
      clickButtonAndAssertEvent(0, 'REASSIGN');
    });
  });

  describe('fulfillment task actions', () => {
    const fulfillmentPermissions = {
      fulfill: true,
      deny: true,
      reassign: true,
    };

    it('shows correct actions for approval details with permissions', () => {
      wrapper = setup({
        permissions: fulfillmentPermissions,
        type: detailTypes.FULFILLMENT,
      });
      const buttons = wrapper.findAll('button');
      expect(buttons[0].text()).toMatch('Complete');
      expect(buttons[1].text()).toMatch('Reject');
      expect(buttons[2].text()).toMatch('Forward');
    });

    it('clicking the buttons emits the correct events', () => {
      wrapper = setup({
        permissions: fulfillmentPermissions,
        type: detailTypes.FULFILLMENT,
      });
      clickButtonAndAssertEvent(0, 'FULFILL');
      clickButtonAndAssertEvent(1, 'DENY');
      clickButtonAndAssertEvent(2, 'REASSIGN');
    });
  });

  it('hides buttons if no permissions', () => {
    Object.values(detailTypes).forEach((type) => {
      if (type === detailTypes.USER_REQUEST) return;
      wrapper = setup({
        permissions: {},
        type,
      });
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(0);
    });
  });
});
