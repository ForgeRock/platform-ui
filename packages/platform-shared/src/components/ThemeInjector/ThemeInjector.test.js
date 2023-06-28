/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import ThemeInjector from './index';

const fontProvider = 'https://fonts.bunny.net';
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
      data() {
        return {
          fontProvider,
        };
      },
    });

    expect(wrapper.vm.fontUrl).toEqual(`${fontProvider}/css2?family=Luxurious+Script:regular&display=swap`);
  });

  it('Returns google font url from string', () => {
    const wrapper = shallowMount(ThemeInjector, {
      propsData: {
        theme: {
          fontFamily: 'Open Sans',
        },
      },
    });
    expect(wrapper.vm.fontUrl).toEqual(`${fontProvider}/css2?family=Open+Sans&display=swap`);
  });

  it('Returns null if font is ignored', () => {
    const wrapper = shallowMount(ThemeInjector, {
      propsData: {
        theme: {
          fontFamily: 'Helvetica',
        },
      },
    });
    expect(wrapper.vm.fontUrl).toEqual(null);
  });
});
