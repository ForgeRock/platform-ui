/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import PageHeader from './index';

describe('Navbar Component', () => {
  it('Component successfully loaded', () => {
    const wrapper = shallowMount(PageHeader);
    expect(wrapper.name()).toEqual('PageHeader');
  });

  it('Includes a subtitle if given', () => {
    const wrapper = shallowMount(PageHeader, {
      propsData: {
        subtitle: 'testSubtitle',
      },
    });
    expect(wrapper.find('.text-muted').text()).toContain('testSubtitle');
  });

  it('Does not includes a subtitle by default', () => {
    const wrapper = shallowMount(PageHeader);
    expect(wrapper.find('.text-muted').exists()).toBe(false);
  });
});
