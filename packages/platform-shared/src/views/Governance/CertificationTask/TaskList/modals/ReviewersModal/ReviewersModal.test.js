/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
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
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ReviewersModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
    });
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
});
