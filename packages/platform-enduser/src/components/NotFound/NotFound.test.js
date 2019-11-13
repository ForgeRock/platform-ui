/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import NotFound from '@/components/NotFound';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('NotFound.vue', () => {
  it('Not found page loaded', () => {
    const wrapper = shallowMount(NotFound, {
      localVue,
      i18n,
      stubs: {
        RouterLink: RouterLinkStub,
      },
    });

    expect(wrapper.name()).toBe('NotFound');
    expect(wrapper).toMatchSnapshot();
  });
});
