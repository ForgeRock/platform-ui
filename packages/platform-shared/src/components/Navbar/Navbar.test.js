/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Navbar from './index';

describe('Navbar Component', () => {
  let wrapper = null;

  beforeEach(() => {
    const localVue = createLocalVue();
    wrapper = shallowMount(Navbar, {
      localVue,
      mocks: {
        $t: () => {},
      },
      stubs: ['RouterLink'],
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.name()).toEqual('Navbar');
  });
});
