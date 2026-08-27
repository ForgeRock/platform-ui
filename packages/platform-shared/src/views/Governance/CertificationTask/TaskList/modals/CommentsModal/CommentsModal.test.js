/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount, mount } from '@vue/test-utils';
import { BTable } from 'bootstrap-vue';
import CommentsModal from './index';

const BModalStub = {
  name: 'BModalStub',
  template: '<div><slot /><slot name="modal-footer" /></div>',
};

const comments = [
  {
    comment: 'First comment',
    timeStamp: '2026-08-27T10:00:00Z',
    user: { givenName: 'Harsha', sn: 'K', userName: 'harshak' },
  },
  {
    comment: 'Second comment',
    timeStamp: '2026-08-27T11:00:00Z',
    user: { givenName: 'Alex', sn: 'Doe', userName: 'alexdoe' },
  },
];

function mountCommentsModal(propsData = {}) {
  return mount(CommentsModal, {
    global: {
      components: { BModal: BModalStub },
      stubs: {
        // BTable must render fully so the presentational-table directive's
        // DOM assertions can run against its generated markup
        BMedia: true,
        BImg: true,
        FrPagination: true,
        FrSpinner: true,
        FrIcon: true,
      },
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      comments,
      ...propsData,
    },
  });
}

describe('CommentsModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CommentsModal, {
      global: {
        components: { BModal: BModalStub, BTable },
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        comments,
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

  it('sets an accessible title on the modal', () => {
    expect(wrapper.find('#CertificationTaskCommentsAccountModal').attributes('title')).toBe('governance.certificationTask.lineItemCommentsModal.title');
  });

  describe('layout-only table accessibility', () => {
    const TABLE_STRUCTURE_ROLES = ['table', 'rowgroup', 'row', 'cell', 'columnheader', 'rowheader'];
    const TABLE_INDEX_ATTRS = ['aria-colindex', 'aria-rowindex', 'aria-colcount', 'aria-rowcount', 'aria-busy'];

    function expectNoTableSemantics(tableWrapper) {
      expect(tableWrapper.exists()).toBe(true);
      // No table structure roles remain anywhere inside the table
      TABLE_STRUCTURE_ROLES.forEach((role) => {
        expect(tableWrapper.find(`[role="${role}"]`).exists()).toBe(false);
      });
      // No generated table positional attributes remain
      TABLE_INDEX_ATTRS.forEach((attr) => {
        expect(tableWrapper.find(`[${attr}]`).exists()).toBe(false);
      });
    }

    it('strips table semantics on initial mount', async () => {
      wrapper = mountCommentsModal();
      await flushPromises();
      expectNoTableSemantics(wrapper.find('table'));
    });

    it('strips table semantics again after pagination re-renders rows', async () => {
      wrapper = mountCommentsModal();
      await flushPromises();
      wrapper.vm.commentsCurrentPage = 2;
      await flushPromises();
      expectNoTableSemantics(wrapper.find('table'));
    });
  });
});
