/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import ThemeInjector from './index';

describe('Theme Injector Component', () => {
  it('Theme Injector successfully loaded', () => {
    const wrapper = shallowMount(ThemeInjector, {
      propsData: {
        theme: {
          fontFamily: 'Open Sans',
        },
      },
    });
    expect(wrapper.name()).toEqual('ThemeInjector');
  });

  it('Constructs google font url from object', () => {
    const wrapper = shallowMount(ThemeInjector, {
      propsData: {
        theme: {
          fontFamily: {
            family: 'Luxurious Script',
            variants: ['regular'],
          },
        },
      },
    });
    expect(wrapper.vm.googleFontUrl).toEqual('https://fonts.googleapis.com/css?family=Luxurious+Script:regular&display=swap');
  });

  it('Returns null if theme font family is a string', () => {
    const wrapper = shallowMount(ThemeInjector, {
      propsData: {
        theme: {
          fontFamily: 'Open Sans',
        },
      },
    });
    expect(wrapper.vm.googleFontUrl).toEqual(null);
  });
});
