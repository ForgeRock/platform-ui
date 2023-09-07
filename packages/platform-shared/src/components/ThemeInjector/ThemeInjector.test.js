/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ThemeInjector from './index';

const fontProvider = 'https://fonts.bunny.net';
describe('Theme Injector Component', () => {
  it('Constructs google font url from object', () => {
    const wrapper = shallowMount(ThemeInjector, {
      props: {
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
      props: {
        theme: {
          fontFamily: 'Open Sans',
        },
      },
    });
    expect(wrapper.vm.fontUrl).toEqual(`${fontProvider}/css2?family=Open+Sans&display=swap`);
  });

  it('Returns null if font is ignored', () => {
    const wrapper = shallowMount(ThemeInjector, {
      props: {
        theme: {
          fontFamily: 'Helvetica',
        },
      },
    });
    expect(wrapper.vm.fontUrl).toEqual(null);
  });
});
