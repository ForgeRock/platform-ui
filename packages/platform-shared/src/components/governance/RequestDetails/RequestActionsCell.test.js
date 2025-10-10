/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, mount } from '@vue/test-utils';
import { createAppContainer, findByRole, toggleActionsMenu } from '@forgerock/platform-shared/src/utils/testHelpers';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import RequestActionsCell from './RequestActionsCell';
import i18n from '@/i18n';

describe('RequestActionsCell', () => {
  function setup(props) {
    setupTestPinia({ user: { userId: '1234' } });
    return {
      wrapper: mount(RequestActionsCell, {
        attachTo: createAppContainer(),
        global: {
          plugins: [i18n],
        },
        props: {
          status: 'pending',
          ...props,
        },
      }),
      domWrapper: new DOMWrapper(document.body),
    };
  }

  function clickButtonAndAssertEvent(wrapper, domWrapper, event, buttonText) {
    findByRole(domWrapper, 'menuitem', buttonText).trigger('click');
    expect(wrapper.emitted('action').at(-1)).toEqual([event]);
  }

  beforeEach(() => {
    document.body.innerHTML = '';
  });

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

    it('shows correct actions for approval details with permissions', async () => {
      const { domWrapper } = setup({
        item,
        type: detailTypes.APPROVAL,
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Approve')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('shows correct actions for approval details without permissions', async () => {
      const { domWrapper } = setup({
        item: {
          rawData: { phases: [{ permissions: { comment: true } }] },
        },
        type: detailTypes.APPROVAL,
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('hides approval action when self approval is false', async () => {
      const { domWrapper } = setup({
        allowSelfApproval: false,
        item,
        type: detailTypes.APPROVAL,
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('clicking the buttons emits the correct events', async () => {
      const { domWrapper, wrapper } = setup({
        item,
        type: detailTypes.APPROVAL,
      });
      await toggleActionsMenu(domWrapper);
      clickButtonAndAssertEvent(wrapper, domWrapper, 'APPROVE', 'Approve');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'REJECT', 'Reject');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'REASSIGN', 'Forward');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'COMMENT', 'Add Comment');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'DETAILS', 'View Details');
    });
  });

  describe('admin actions', () => {
    const adminRequestPermissions = {
      reassign: true,
    };

    it('shows correct actions for admin request with permissions', async () => {
      const { domWrapper } = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('shows correct actions for completed admin request with permissions', async () => {
      const { domWrapper } = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
        status: 'complete',
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('shows correct actions for cancelled admin request with permissions', async () => {
      const { domWrapper } = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
        status: 'cancelled',
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('shows the "Change Resume Date" action for admin request if the request is suspended', async () => {
      const { domWrapper } = setup({
        type: detailTypes.ADMIN_REQUEST,
        status: 'suspended',
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Change Resume Date')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Cancel Request')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('clicking the buttons emits the correct events', async () => {
      const { domWrapper, wrapper } = setup({
        permissions: adminRequestPermissions,
        type: detailTypes.ADMIN_REQUEST,
      });
      await toggleActionsMenu(domWrapper);
      clickButtonAndAssertEvent(wrapper, domWrapper, 'DETAILS', 'View Details');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'REASSIGN', 'Forward');
    });

    it('clicking the change resume date button emits the correct event', async () => {
      const { domWrapper, wrapper } = setup({
        type: detailTypes.ADMIN_REQUEST,
        status: 'suspended',
      });
      await toggleActionsMenu(domWrapper);
      clickButtonAndAssertEvent(wrapper, domWrapper, 'CHANGERESUMEDATE', 'Change Resume Date');
      expect(wrapper.emitted('action')[0]).toEqual(['CHANGERESUMEDATE']);
    });
  });

  describe('user request actions', () => {
    const userRequestPermissions = {
      cancel: true,
    };

    it('shows correct actions for user request with permissions', async () => {
      const { domWrapper } = setup({
        permissions: userRequestPermissions,
        type: detailTypes.USER_REQUEST,
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Change Resume Date')).not.toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Cancel Request')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('clicking the buttons emits the correct events', async () => {
      const { domWrapper, wrapper } = setup({
        permissions: userRequestPermissions,
        type: detailTypes.USER_REQUEST,
      });
      await toggleActionsMenu(domWrapper);
      clickButtonAndAssertEvent(wrapper, domWrapper, 'DETAILS', 'View Details');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'CANCEL', 'Cancel Request');
    });
  });

  describe('fulfillment task actions', () => {
    const fulfillmentTaskPermissions = {
      cancel: true,
    };

    it('shows correct actions for fulfillment task with permissions', async () => {
      const { domWrapper } = setup({
        permissions: fulfillmentTaskPermissions,
        type: detailTypes.FULFILLMENT,
      });

      await toggleActionsMenu(domWrapper);
      expect(findByRole(domWrapper, 'menuitem', 'Complete')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Reject')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Forward')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'Add Comment')).toBeDefined();
      expect(findByRole(domWrapper, 'menuitem', 'View Details')).toBeDefined();
    });

    it('clicking the buttons emits the correct events', async () => {
      const { domWrapper, wrapper } = setup({
        permissions: fulfillmentTaskPermissions,
        type: detailTypes.FULFILLMENT,
      });
      await toggleActionsMenu(domWrapper);
      clickButtonAndAssertEvent(wrapper, domWrapper, 'FULFILL', 'Complete');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'DENY', 'Reject');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'REASSIGN', 'Forward');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'COMMENT', 'Add Comment');
      clickButtonAndAssertEvent(wrapper, domWrapper, 'DETAILS', 'View Details');
    });
  });
});
