/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ForwardReviewModal from './index';

describe('ForwardReviewModal', () => {
  it('Handles forwarding to user', async () => {
    const wrapper = shallowMount(ForwardReviewModal,
      {
        global: {
          plugins: [i18n],
        },
        data: () => ({
          forwardToUser: 'TestUser',
          forwardToRole: 'TestRole',
          forwardToType: 'user',
          comment: 'test comment',
        }),
        props: {
          certId: 'testId',
        },
      });

    const payload = {
      certId: 'testId',
      comment: 'test comment',
      newActorId: 'TestUser',
    };

    wrapper.vm.handleForward();
    // Data is emitted with expected value
    expect(wrapper.emitted().forward[0]).toEqual([payload]);
  });

  it('Handles forwarding to role', async () => {
    const wrapper = shallowMount(ForwardReviewModal,
      {
        global: {
          plugins: [i18n],
        },
        data: () => ({
          forwardToUser: 'TestUser',
          forwardToRole: 'TestRole',
          forwardToType: 'role',
          comment: 'test comment',
        }),
        props: {
          certId: 'testId',
        },
      });

    const payload = {
      certId: 'testId',
      comment: 'test comment',
      newActorId: 'TestRole',
    };

    wrapper.vm.handleForward();
    // Data is emitted with expected value
    expect(wrapper.emitted().forward[0]).toEqual([payload]);
  });
});
