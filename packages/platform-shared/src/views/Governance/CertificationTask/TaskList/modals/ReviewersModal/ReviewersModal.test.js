/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '../../../../../../utils/testPiniaHelpers';
import ReviewersModal from './index';

describe('ReviewersModal', () => {
  const permissions = {
    comment: true,
    delegate: true,
    forward: true,
    reassign: true,
    consult: true,
    signoff: true,
    certify: true,
    exception: true,
    revoke: true,
    reset: true,
    save: true,
    removeActor: true,
    accept: true,
    challenge: true,
  };
  const reviewers = [
    {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions,
    },
    {
      userName: 'jtilton@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'John',
      sn: 'Tilton',
      id: 'managed/user/62f48783-fa7c-44e4-95ef-f0a605244540',
      mail: 'jtilton@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions,
    },
  ];
  let wrapper;

  function mountComponent(props = {}) {
    setupTestPinia();
    // BModal is stubbed open (like NotificationMessagesModal.test.js) so the table
    // content renders without the modal needing to be shown; the actions menu
    // teleports its open list to #app, so teleported items are asserted on document.
    return mount(ReviewersModal, {
      global: {
        stubs: {
          BModal: {
            name: 'BModal',
            emits: ['hidden'],
            template: '<div><slot /><slot name="modal-footer" :cancel="() => {}"/></div>',
          },
        },
        mocks: {
          $t: (t) => t,
        },
      },
      props,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);
    wrapper = shallowMount(ReviewersModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
    });
  });

  afterEach(() => {
    // Unmount before clearing the body so teleported menus and their
    // document-level listeners are torn down (prevents cross-test leaks).
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    document.body.innerHTML = '';
  });

  it('openAddReviewerModal method should emit open-edit-reviewer-modal event', () => {
    expect(wrapper.emitted()['open-edit-reviewer-modal']).toBeFalsy();

    wrapper.vm.openAddReviewerModal();

    expect(wrapper.emitted()['open-edit-reviewer-modal']).toBeTruthy();
  });

  it('editReviewer method should emit open-edit-reviewer-modal event', () => {
    const reviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions,
    };

    expect(wrapper.emitted()['open-edit-reviewer-modal']).toBeFalsy();

    wrapper.vm.editReviewer(reviewer);

    expect(wrapper.emitted()['open-edit-reviewer-modal']).toBeTruthy();
    expect(wrapper.emitted()['open-edit-reviewer-modal'][0][0]).toEqual(reviewer);
  });

  it('deleteReviewer method should emit delete-reviewer event', () => {
    const reviewerId = 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af';

    expect(wrapper.emitted()['delete-reviewer']).toBeFalsy();

    wrapper.vm.deleteReviewer(reviewerId);

    expect(wrapper.emitted()['delete-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['delete-reviewer'][0][0]).toBe(reviewerId);
  });

  it('getPermissionsMapped should map correctly the permissions all true', () => {
    const mappedPermissions = wrapper.vm.getPermissionsMapped(permissions);

    expect(mappedPermissions).toEqual(['comment', 'forward', 'signoff', 'decide']);
  });

  it('getPermissionsMapped should map correctly the permissions no decide', () => {
    const permissionsNoDecide = {
      comment: true,
      delegate: true,
      forward: true,
      reassign: true,
      consult: true,
      signoff: true,
      certify: false,
      exception: false,
      revoke: false,
      reset: false,
      save: true,
      removeActor: true,
      accept: true,
      challenge: true,
    };

    const mappedPermissions = wrapper.vm.getPermissionsMapped(permissionsNoDecide);

    expect(mappedPermissions).toEqual(['comment', 'forward', 'signoff']);
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskReviewersAccountModal').exists()).toBeTruthy();
  });

  it('should render prop modalId', () => {
    wrapper = shallowMount(ReviewersModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        modalId: 'CertificationTaskReviewersEntitlementModal',
      },
    });
    expect(wrapper.find('#CertificationTaskReviewersEntitlementModal').exists()).toBeTruthy();
  });

  it('sets an accessible title on the modal', () => {
    expect(wrapper.find('#CertificationTaskReviewersAccountModal').attributes('title')).toBe('governance.certificationTask.lineItemReviewersModal.title');
  });

  it('labels the actions column with common.actions', () => {
    const actionsField = wrapper.vm.fields.find((field) => field.key === 'actions');

    expect(actionsField.label).toBe('common.actions');
  });

  it('renders an actions menu in each reviewer row that teleports to #app when opened', async () => {
    wrapper = mountComponent({ reviewers });

    const menuContainers = wrapper.findAll('.menu-container');
    expect(menuContainers.length).toBe(reviewers.length);

    // The FrActionsMenu teleports its open menu list to #app (floating menu), so the
    // rendered items are asserted against the document rather than the wrapper.
    await menuContainers[0].find('button').trigger('click');
    await flushPromises();

    const menuItems = document.querySelectorAll('#app [role="menuitem"]');
    expect(menuItems.length).toBe(2);
  });

  it('emits open-edit-reviewer-modal from the row actions menu edit option', async () => {
    wrapper = mountComponent({ reviewers });

    await wrapper.findAll('.menu-container')[0].find('button').trigger('click');
    await flushPromises();

    const editItem = document.querySelectorAll('#app [role="menuitem"]')[0];
    editItem.click();
    await flushPromises();

    expect(wrapper.emitted()['open-edit-reviewer-modal']).toBeTruthy();
    expect(wrapper.emitted()['open-edit-reviewer-modal'][0][0].id).toBe(reviewers[0].id);
  });

  it('shows the remove option only when there is more than one reviewer', async () => {
    wrapper = mountComponent({ reviewers });

    await wrapper.findAll('.menu-container')[0].find('button').trigger('click');
    await flushPromises();

    expect(document.querySelectorAll('#app [role="menuitem"]').length).toBe(2);

    // Unmount (not a body wipe) so the teleported menu and its listeners are
    // torn down before the next mount.
    wrapper.unmount();
    wrapper = mountComponent({ reviewers: [reviewers[0]] });

    await wrapper.findAll('.menu-container')[0].find('button').trigger('click');
    await flushPromises();

    expect(document.querySelectorAll('#app [role="menuitem"]').length).toBe(1);
  });

  it('emits delete-reviewer with the reviewer id from the row actions menu remove option', async () => {
    wrapper = mountComponent({ reviewers });

    await wrapper.findAll('.menu-container')[0].find('button').trigger('click');
    await flushPromises();

    const removeItem = document.querySelectorAll('#app [role="menuitem"]')[1];
    removeItem.click();
    await flushPromises();

    expect(wrapper.emitted()['delete-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['delete-reviewer'][0][0]).toBe(reviewers[0].id);
  });

  describe('@a11y', () => {
    it('should have no a11y violations', async () => {
      wrapper = mountComponent({ reviewers });
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
