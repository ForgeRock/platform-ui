/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { KBADetails } from './mocks/ProgressiveProfileMock';
import KBAUpdate from './KBAUpdate';
import i18n from '@/i18n';

mockValidation();

describe('KBAUpdate', () => {
  let wrapper;
  function mountComponent() {
    return mount(KBAUpdate, {
      props: {
        selfServiceDetails: { requirements: KBADetails },
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('emits update:data with KBA form group data when KBA is complete', async () => {
    wrapper = mountComponent({ inline: true });
    await flushPromises();

    const questionSelects = wrapper.findAllComponents('[label="Select a security question..."]');
    const answerInputs = wrapper.findAllComponents('[label="Answer"]');

    questionSelects[0].vm.$emit('input', '1');
    answerInputs[0].vm.$emit('input', 'Blue');
    questionSelects[1].vm.$emit('input', '2');
    answerInputs[1].vm.$emit('input', 'My first employer');
    await flushPromises();

    expect(wrapper.emitted('update:data').pop().pop()).toEqual({
      kba: [
        { questionId: '1', answer: 'Blue' },
        { questionId: '2', answer: 'My first employer' },
      ],
    });
  });
});
