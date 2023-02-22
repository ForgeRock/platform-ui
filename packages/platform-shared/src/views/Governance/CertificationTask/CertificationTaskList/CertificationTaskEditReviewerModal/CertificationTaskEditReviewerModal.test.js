/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { ResourceType } from '@forgerock/platform-shared/src/utils/governanceTypes';
import CertificationTaskEditReviewerModal from './index';

describe('CertificationTaskEditReviewerModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CertificationTaskEditReviewerModal, {
      mocks: {
        $t: (t) => t,
      },
    });
  });

  it('component loaded correctly', () => {
    expect(wrapper.name()).toBe('EditReviewerModal');
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

  it('editReviewer should emit edit-reviewer event with properly data on edit reviewer', () => {
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
    wrapper.setProps({
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

  it('editReviewer should emit edit-reviewer event with properly data on edit reviewer no decide', () => {
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
    wrapper.setProps({
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

  it('deleteReviewer should emit delete-reviewer event', () => {
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
    wrapper.setProps({
      reviewer,
    });

    expect(wrapper.emitted()['delete-reviewer']).toBeFalsy();

    wrapper.vm.deleteReviewer();

    expect(wrapper.emitted()['delete-reviewer']).toBeTruthy();
    expect(wrapper.emitted()['delete-reviewer'][0][0]).toBe('managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af');
  });

  it('setSelectedReviewer sets user correctly', () => {
    const user = {
      userName: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
      givenName: 'Barbara',
      sn: 'Walters',
      id: 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
      mail: 'bwalters@jstilton1973unfinishedlife.onmicrosoft.com',
    };
    wrapper.vm.setSelectedReviewer(user);

    expect(wrapper.vm.selectedReviewer).toEqual(user);
  });

  it('setSelectedReviewer sets role correctly', () => {
    const role = {
      name: 'Marketing',
      id: 'managed/role/2cdfc1d4-a206-435b-b22e-a5ed8804f4af',
    };
    wrapper.vm.setSelectedReviewer(role);

    expect(wrapper.vm.selectedReviewer).toEqual(role);
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

  it('footer class empty if edition is not allowed', () => {
    expect(wrapper.vm.footerClass).toBe('');
  });

  it('footer class justify-content-between if edition is allowed', () => {
    wrapper.setProps({
      isAllowedDeletion: true,
    });

    expect(wrapper.vm.footerClass).toBe('justify-content-between');
  });
});
