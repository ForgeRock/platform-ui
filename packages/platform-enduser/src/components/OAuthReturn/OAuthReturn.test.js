/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import OAuthReturn from '@/components/OAuthReturn';

const localVue = createLocalVue();

describe('OAuthReturn.vue', () => {
  beforeEach(() => {
    jest.spyOn(OAuthReturn, 'created')
      .mockImplementation(() => { });
  });

  it('OAuth Return loaded', () => {
    const wrapper = shallowMount(OAuthReturn, {
      localVue,
      i18n,
      stubs: {
        BContainer: true,
      },
    });

    expect(wrapper.name()).toBe('OAuthReturn');
    expect(wrapper).toMatchSnapshot();
  });
});
