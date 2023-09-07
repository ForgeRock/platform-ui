/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CommentsModal from './index';

describe('CommentsModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CommentsModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
    });
  });

  it('commentsPaginationChange method should update commentsCurrentPage', () => {
    wrapper.vm.commentsPaginationChange(2);

    expect(wrapper.vm.commentsCurrentPage).toBe(2);
  });

  it('commentsPageSizeChange method should update commentsItemsPerPage', () => {
    wrapper.vm.commentsPageSizeChange(20);

    expect(wrapper.vm.commentsItemsPerPage).toBe(20);
  });

  it('formatDate method should return date formatted', () => {
    const formatted = wrapper.vm.formatDate('2022-12-23');

    expect(formatted).toBe('Dec 23, 2022 12:00 AM');
  });

  it('openAddCommentModal mehtos should emmit open-add-comment-modal', () => {
    wrapper.vm.openAddCommentModal();

    expect(wrapper.emitted()['open-add-comment-modal']).toBeTruthy();
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskCommentsAccountModal').exists()).toBeTruthy();
  });

  it('should render prop modalId', () => {
    wrapper = shallowMount(CommentsModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        modalId: 'CertificationTaskCommentsEntitlementModal',
      },
    });
    expect(wrapper.find('#CertificationTaskCommentsEntitlementModal').exists()).toBeTruthy();
  });
});
