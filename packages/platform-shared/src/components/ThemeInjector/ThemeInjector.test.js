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
  it('Constructs Bunny Fonts font url from object', () => {
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

  it('Returns Bunny Fonts font url from string', () => {
    const wrapper = shallowMount(ThemeInjector, {
      props: {
        theme: {
          fontFamily: 'Open Sans',
        },
      },
    });
    expect(wrapper.vm.fontUrl).toEqual(`${fontProvider}/css2?family=Open+Sans:ital,wght@0,100..900;1,100..900&display=swap`);
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

  describe('getContrastColor', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(ThemeInjector);
    });

    // afterEach(() => {
    //   wrapper.destroy();
    // });

    it('should return "inherit" for invalid hex colors', () => {
      expect(wrapper.vm.getContrastColor('invalid')).toBe('inherit');
      expect(wrapper.vm.getContrastColor('#1234')).toBe('inherit');
      expect(wrapper.vm.getContrastColor('123456')).toBe('inherit');
    });

    it('should return white for dark colors with sufficient contrast', () => {
      expect(wrapper.vm.getContrastColor('#000000')).toBe('#ffffff');
      expect(wrapper.vm.getContrastColor('#333333')).toBe('#ffffff');
      expect(wrapper.vm.getContrastColor('#505050')).toBe('#ffffff');
    });

    it('should return black for light colors with sufficient contrast', () => {
      expect(wrapper.vm.getContrastColor('#ffffff')).toBe('#000000');
      expect(wrapper.vm.getContrastColor('#eeeeee')).toBe('#000000');
      expect(wrapper.vm.getContrastColor('#cccccc')).toBe('#000000');
    });

    it('should return the best contrast color if neither black nor white meet the target ratio', () => {
      // Example: #808080 (gray) has a contrast ratio of 4.5:1 or greater with black, but less with white
      expect(wrapper.vm.getContrastColor('#808080')).toBe('#000000');
    });

    it('should use the provided light and dark colors', () => {
      expect(wrapper.vm.getContrastColor('#000000', 4.5, '#f0f0f0', '#101010')).toBe('#f0f0f0');
      expect(wrapper.vm.getContrastColor('#ffffff', 4.5, '#f0f0f0', '#101010')).toBe('#101010');
    });

    it('should use the provided target ratio', () => {
      // Example: #808080 (gray) has a contrast ratio of 3:1 with white, which is sufficient for large text
      expect(wrapper.vm.getContrastColor('#808080', 3, '#ffffff', '#000000')).toBe('#ffffff');
    });
  });
});
