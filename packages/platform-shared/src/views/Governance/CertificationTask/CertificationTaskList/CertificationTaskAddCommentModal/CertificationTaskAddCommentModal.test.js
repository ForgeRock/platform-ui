/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskAddCommentModal from './index';

describe('CertificationTaskAddCommentModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CertificationTaskAddCommentModal, {
      mocks: {
        $t: (t) => t,
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.name()).toBe('AddCommentModal');
  });

  it('addComment shoul change isSaving and emmit add-comment', () => {
    wrapper.setData({
      comment: 'Test comment',
    });

    wrapper.vm.addComment();

    expect(wrapper.vm.isSaving).toBe(true);
    expect(wrapper.emitted()['add-comment']).toBeTruthy();
    expect(wrapper.emitted()['add-comment'][0][0]).toBe('Test comment');
  });

  it('resetModal should reset comment and isSaving', () => {
    wrapper.vm.resetModal();

    expect(wrapper.vm.comment).toBeNull();
    expect(wrapper.vm.isSaving).toBe(false);
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskAddCommentAccountModal').exists()).toBeTruthy();
  });

  it('should render prop modalId', () => {
    wrapper = shallowMount(CertificationTaskAddCommentModal, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        modalId: 'CertificationTaskAddCommentEntitlementModal',
      },
    });
    expect(wrapper.find('#CertificationTaskAddCommentEntitlementModal').exists()).toBeTruthy();
  });
});
