/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { ResourceType } from '@forgerock/platform-shared/src/utils/governance/types';
import { setupTestPinia } from '../../../../../../utils/testPiniaHelpers';
import EditReviewerModal from './index';

describe('EditReviewerModal', () => {
  let wrapper;
  beforeEach(() => {
    setupTestPinia({ user: { userId: 'testId' } });
    wrapper = shallowMount(EditReviewerModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        currentUserPermissions: {
          certify: true,
          comment: true,
          exception: true,
          forward: false,
          reassign: false,
          reset: true,
          revoke: true,
          signoff: false,
        },
      },
    });
  });

  it('closeModal method should emit close-modal event', () => {
    expect(wrapper.emitted()['close-modal']).toBeFalsy();

    wrapper.vm.closeModal();

    expect(wrapper.emitted()['close-modal']).toBeTruthy();
    expect(wrapper.emitted()['close-modal'].length).toBe(1);
  });

  it('editReviewer should emit edit-reviewer event with properly data on create new reviewer', () => {
    const reviewerIdSelected = 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af';
    const selectedReviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
    };

    wrapper.vm.reviewerIdSelected = reviewerIdSelected;
    wrapper.vm.selectedReviewer = selectedReviewer;

    expect(wrapper.emitted()['edit-reviewer']).toBeFalsy();

    wrapper.vm.editReviewer();

    expect(wrapper.emitted()['edit-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['edit-reviewer'][0][0]).toBe(reviewerIdSelected);
    expect(wrapper.emitted()['edit-reviewer'][0][1]).toEqual({
      certify: true, comment: true, exception: true, forward: true, reassign: true, reset: true, revoke: true, signoff: true,
    });
    expect(wrapper.emitted()['edit-reviewer'][0][2]).toEqual(selectedReviewer);
  });

  it('editReviewer should emit edit-reviewer event with properly data on edit reviewer', async () => {
    const reviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions: {
        accept: true,
        certify: true,
        challenge: true,
        comment: true,
        consult: true,
        delegate: true,
        exception: true,
        forward: true,
        reassign: true,
        removeActor: true,
        reset: true,
        revoke: true,
        save: true,
        signoff: true,
      },
    };
    await wrapper.setProps({
      reviewer,
    });

    wrapper.vm.editReviewer();

    expect(wrapper.emitted()['edit-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['edit-reviewer'][0][0]).toBe(reviewer.id);
    expect(wrapper.emitted()['edit-reviewer'][0][1]).toEqual({
      accept: true,
      certify: true,
      challenge: true,
      comment: true,
      consult: true,
      delegate: true,
      exception: true,
      forward: true,
      reassign: true,
      removeActor: true,
      reset: true,
      revoke: true,
      save: true,
      signoff: true,
    });
    expect(wrapper.emitted()['edit-reviewer'][0][2]).toEqual(null);
  });

  it('editReviewer should emit edit-reviewer event with properly data on edit reviewer no decide', async () => {
    const reviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions: {
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
      },
    };
    await wrapper.setProps({
      reviewer,
    });

    wrapper.vm.editReviewer();

    expect(wrapper.emitted()['edit-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['edit-reviewer'][0][0]).toBe(reviewer.id);
    expect(wrapper.emitted()['edit-reviewer'][0][1]).toEqual({
      accept: true,
      certify: false,
      challenge: true,
      comment: true,
      consult: true,
      delegate: true,
      exception: false,
      forward: true,
      reassign: true,
      removeActor: true,
      reset: false,
      revoke: false,
      save: true,
      signoff: true,
    });
    expect(wrapper.emitted()['edit-reviewer'][0][2]).toEqual(null);
  });

  it('deleteReviewer should emit delete-reviewer event', async () => {
    const reviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions: {
        accept: true,
        certify: true,
        challenge: true,
        comment: true,
        consult: true,
        delegate: true,
        exception: true,
        forward: true,
        reassign: true,
        removeActor: true,
        reset: true,
        revoke: true,
        save: true,
        signoff: true,
      },
    };
    await wrapper.setProps({
      reviewer,
    });

    expect(wrapper.emitted()['delete-reviewer']).toBeFalsy();

    wrapper.vm.deleteReviewer();

    expect(wrapper.emitted()['delete-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['delete-reviewer'][0][0]).toBe('managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af');
  });

  it('reset should assign right values to data', () => {
    wrapper.vm.reviewerType = ResourceType.ROLE;
    wrapper.vm.reviewerIdSelected = 'managed/role/2cdfc1d4-a206-435b-b22e-a5ed8804f4af';
    wrapper.vm.permissions = {
      decide: false,
      comment: true,
      forward: false,
      signoff: true,
    };
    wrapper.vm.selectedReviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
    };

    wrapper.vm.reset();

    expect(wrapper.vm.reviewerType).toBe(ResourceType.USER);
    expect(wrapper.vm.reviewerIdSelected).toBeNull();
    expect(wrapper.vm.permissions).toEqual({
      decide: true,
      comment: true,
      forward: true,
      signoff: true,
    });
    expect(wrapper.vm.selectedReviewer).toBeNull();
  });

  it('user can not edit his own permissions', async () => {
    const reviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/testId',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions: {
        accept: true,
        certify: true,
        challenge: true,
        comment: true,
        consult: true,
        delegate: true,
        exception: true,
        forward: true,
        reassign: true,
        removeActor: true,
        reset: true,
        revoke: true,
        save: true,
        signoff: true,
      },
    };
    await wrapper.setProps({
      reviewer,
    });

    expect(wrapper.vm.permissionOwnedByCurrentUser).toBeTruthy();

    wrapper.vm.deleteReviewer();
    expect(wrapper.emitted()['delete-reviewer']).toBeFalsy();

    wrapper.vm.editReviewer();
    expect(wrapper.emitted()['edit-reviewer']).toBeFalsy();
  });

  it('footer class empty if edition is not allowed', () => {
    expect(wrapper.vm.footerClass).toBe('');
  });

  it('footer class justify-content-between if edition is allowed', async () => {
    await wrapper.setProps({
      isAllowedDeletion: true,
    });

    expect(wrapper.vm.footerClass).toBe('justify-content-between');
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskEditReviewerAccountModal').exists()).toBeTruthy();
  });

  it('should render prop modalId', () => {
    wrapper = shallowMount(EditReviewerModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        modalId: 'CertificationTaskEditReviewerEntitlementModal',
      },
    });
    expect(wrapper.find('#CertificationTaskEditReviewerEntitlementModal').exists()).toBeTruthy();
  });

  it('getMappedPermissions method should map correctly reviewer permissions when reviewer change', async () => {
    expect(wrapper.vm.permissions).toEqual({
      decide: true,
      comment: true,
      forward: true,
      signoff: true,
    });

    const reviewer = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      permissions: {
        certify: false,
        comment: true,
        exception: false,
        forward: true,
        reassign: true,
        reset: false,
        revoke: false,
        signoff: true,
      },
    };

    await wrapper.setProps({
      reviewer,
    });

    expect(wrapper.vm.permissions).toEqual({
      decide: false,
      comment: true,
      forward: true,
      signoff: true,
    });

    await wrapper.setProps({
      reviewer: null,
    });

    expect(wrapper.vm.permissions).toEqual({
      decide: true,
      comment: true,
      forward: false,
      signoff: false,
    });
  });

  it('getMappedPermissions method should map reviewer permissions correctly', () => {
    const permissions = wrapper.vm.getMappedPermissions({
      certify: false,
      comment: false,
      exception: false,
      forward: true,
      reassign: true,
      reset: false,
      revoke: false,
      signoff: true,
    });

    expect(permissions).toEqual({
      decide: false,
      comment: false,
      forward: true,
      signoff: true,
    });
  });
});
