/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import ThemeInjector from './index';

describe('Theme Injector Component', () => {
  it('Theme Injector successfully loaded', () => {
    const wrapper = shallowMount(ThemeInjector);
    expect(wrapper.name()).toEqual('ThemeInjector');
  });
});
