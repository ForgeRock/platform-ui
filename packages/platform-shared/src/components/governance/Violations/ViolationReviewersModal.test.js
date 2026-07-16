/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ViolationReviewersModal from './ViolationReviewersModal';

describe('ViolationReviewersModal', () => {
  function mountComponent(props = {}) {
    return shallowMount(ViolationReviewersModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        violation: {},
        ...props,
      },
    });
  }

  it('sets aria-label combining subtitle and policy rule name when available', () => {
    const wrapper = mountComponent({
      violation: { policyRule: { name: 'SOD Policy' }, reviewers: [] },
    });
    expect(wrapper.find('[arialabel="common.reviewers: SOD Policy"]').exists()).toBeTruthy();
  });

  it('shows subtitle only when violation has no policy rule name', () => {
    const wrapper = mountComponent({ violation: { reviewers: [] } });
    expect(wrapper.find('[arialabel="common.reviewers"]').exists()).toBeTruthy();
  });
});
