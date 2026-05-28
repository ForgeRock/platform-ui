/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
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

    it('should return "inherit" for invalid hex colors', () => {
      expect(wrapper.vm.getContrastColor('invalid')).toBe('inherit');
      expect(wrapper.vm.getContrastColor('123456')).toBe('inherit');
    });

    it('should handle 8-digit RGBA hex by compositing over white', () => {
      // #7B927F30 is a very transparent green; composited over white it becomes a near-white tint
      // — black provides sufficient contrast, white does not
      expect(wrapper.vm.getContrastColor('#7B927F30')).toBe('#000000');
    });

    it('should handle 4-digit RGBA hex the same as 8-digit', () => {
      // #0008 = rgba(0,0,0,0.53) composited over white → mid-grey; black passes, white does not
      expect(wrapper.vm.getContrastColor('#0008')).toBe('#000000');
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

    it('should return the dark candidate when only it passes the target ratio', () => {
      // #808080 vs black is 5.32:1 (passes), vs white is 3.95:1 (fails)
      expect(wrapper.vm.getContrastColor('#808080')).toBe('#000000');
    });

    it('should fall back to absolute black when neither candidate passes on a light background', () => {
      // Both candidates are mid-grey and fail on a near-white background — absolute black is the safe fallback
      expect(wrapper.vm.getContrastColor('#f0f0f0', 4.5, '#aaaaaa', '#888888')).toBe('#000000');
    });

    it('should fall back to absolute white when neither candidate passes on a dark background', () => {
      // Both candidates are dark and fail against a near-black background — absolute white is the safe fallback
      expect(wrapper.vm.getContrastColor('#111111', 4.5, '#333333', '#444444')).toBe('#ffffff');
    });

    it('should use the provided light and dark colors', () => {
      expect(wrapper.vm.getContrastColor('#000000', 4.5, '#f0f0f0', '#101010')).toBe('#f0f0f0');
      expect(wrapper.vm.getContrastColor('#ffffff', 4.5, '#f0f0f0', '#101010')).toBe('#101010');
    });

    it('should use the provided target ratio', () => {
      // #808080 vs white is 3.95:1 — passes at ratio 3 but not at 4.5
      expect(wrapper.vm.getContrastColor('#808080', 3, '#ffffff', '#000000')).toBe('#ffffff');
    });
  });

  describe('getMutedTextColor', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(ThemeInjector);
    });

    it('should return "inherit" for invalid bgColor', () => {
      expect(wrapper.vm.getMutedTextColor('invalid', '#5e6d82', '#23282e')).toBe('inherit');
    });

    it('should return "inherit" for invalid primaryTextColor', () => {
      expect(wrapper.vm.getMutedTextColor('#ffffff', '#5e6d82', 'invalid')).toBe('inherit');
    });

    it('should return primaryTextColor for invalid preferredColor', () => {
      expect(wrapper.vm.getMutedTextColor('#ffffff', 'invalid', '#23282e')).toBe('#23282e');
    });

    it('should return preferredColor when it passes 4.5:1 and has lower contrast than primary', () => {
      // #5e6d82 on #ffffff: ~4.9:1 — passes; #23282e on #ffffff: ~15:1 — primary is darker
      expect(wrapper.vm.getMutedTextColor('#ffffff', '#5e6d82', '#23282e')).toBe('#5e6d82');
    });

    it('should cap at primaryTextColor when preferredColor passes but exceeds primary contrast', () => {
      // preferred (#23282e, ~15:1) is darker than primary (#5e6d82, ~4.9:1) on white — cap at primary
      expect(wrapper.vm.getMutedTextColor('#ffffff', '#23282e', '#5e6d82')).toBe('#5e6d82');
    });

    it('should blend toward black on a light background when preferred fails 4.5:1', () => {
      // #69788b on #e4f4fd: ~4.0:1 (fails) — result must be a new compliant hex value
      const result = wrapper.vm.getMutedTextColor('#e4f4fd', '#69788b', '#23282e');
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result).not.toBe('#69788b');
    });

    it('should blend toward white on a dark background when preferred fails 4.5:1', () => {
      // Both #5e6d82 and #23282e fail on #1a1a2e — blend target is white, result must change
      const result = wrapper.vm.getMutedTextColor('#1a1a2e', '#5e6d82', '#23282e');
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result).not.toBe('#5e6d82');
    });

    it('blended result on light background should meet WCAG AA (≥4.5:1)', () => {
      // #69788b on #e4f4fd fails at ~4.0:1; the blend must produce a result that passes
      const result = wrapper.vm.getMutedTextColor('#e4f4fd', '#69788b', '#23282e');
      // Verify by checking contrast directly via getContrastColor: a WCAG-passing color
      // will be preferred over absolute black/white when passed as a candidate
      const contrastCheck = wrapper.vm.getContrastColor('#e4f4fd', 4.5, result, '#000000');
      expect(contrastCheck).toBe(result);
    });

    it('blended result on dark background should meet WCAG AA (≥4.5:1)', () => {
      // Both greys fail on #1a1a2e; the blend toward white must produce a passing result
      const result = wrapper.vm.getMutedTextColor('#1a1a2e', '#5e6d82', '#23282e');
      const contrastCheck = wrapper.vm.getContrastColor('#1a1a2e', 4.5, result, '#ffffff');
      expect(contrastCheck).toBe(result);
    });
  });

  describe('journeyLinkColor computed', () => {
    it('darkens linkColor to meet WCAG AA when it fails 4.5:1 on the card background', () => {
      // #aaaaaa on #ffffff is ~2.32:1 — fails WCAG AA; computed value must be a darker shade, not pure black
      const wrapper = shallowMount(ThemeInjector, {
        props: { theme: { linkColor: '#aaaaaa', journeyCardBackgroundColor: '#ffffff' } },
      });
      expect(wrapper.vm.journeyLinkColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(wrapper.vm.journeyLinkColor).not.toBe('#aaaaaa');
      expect(wrapper.vm.journeyLinkColor).not.toBe('#000000');
      expect(wrapper.html()).toContain(wrapper.vm.journeyLinkColor);
    });

    it('keeps linkColor unchanged when it already meets 4.5:1 on the card background', () => {
      // #2266cc on #ffffff is ~5.5:1 — passes WCAG AA; no adjustment needed, original color preserved
      const wrapper = shallowMount(ThemeInjector, {
        props: { theme: { linkColor: '#2266cc', journeyCardBackgroundColor: '#ffffff' } },
      });
      expect(wrapper.vm.journeyLinkColor).toBe('#2266cc');
      expect(wrapper.html()).toContain('#2266cc');
    });
  });

  describe('journeyLinkActiveColor computed', () => {
    it('darkens linkActiveColor to meet WCAG AA when it fails 4.5:1 on the card background', () => {
      // #aaaaaa on #ffffff is ~2.32:1 — fails WCAG AA; computed value must be a darker shade, not pure black
      const wrapper = shallowMount(ThemeInjector, {
        props: { theme: { linkActiveColor: '#aaaaaa', journeyCardBackgroundColor: '#ffffff' } },
      });
      expect(wrapper.vm.journeyLinkActiveColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(wrapper.vm.journeyLinkActiveColor).not.toBe('#aaaaaa');
      expect(wrapper.vm.journeyLinkActiveColor).not.toBe('#000000');
      expect(wrapper.html()).toContain(wrapper.vm.journeyLinkActiveColor);
    });

    it('keeps linkActiveColor unchanged when it already meets 4.5:1 on the card background', () => {
      // #2266cc on #ffffff is ~5.5:1 — passes WCAG AA; no adjustment needed, original color preserved
      const wrapper = shallowMount(ThemeInjector, {
        props: { theme: { linkActiveColor: '#2266cc', journeyCardBackgroundColor: '#ffffff' } },
      });
      expect(wrapper.vm.journeyLinkActiveColor).toBe('#2266cc');
      expect(wrapper.html()).toContain('#2266cc');
    });
  });

  describe('enduser stylesheet', () => {
    it('includes .fr-search-input-holder .input-group:focus-within styled with accountCardInputFocusBorderColor', () => {
      const accountCardInputFocusBorderColor = '#ff0000';
      const wrapper = shallowMount(ThemeInjector, {
        props: {
          isEnduser: true,
          theme: {
            accountCardInputFocusBorderColor,
          },
        },
      });

      const html = wrapper.html();
      expect(html).toContain('.fr-search-input-holder .input-group:focus-within');
      expect(wrapper.vm.accountCardInputFocusBorderColor).toBe(accountCardInputFocusBorderColor);
      expect(html).toContain(accountCardInputFocusBorderColor);
    });

    it('falls back to primaryColor for .fr-search-input-holder focus style when accountCardInputFocusBorderColor is unset', () => {
      const primaryColor = '#0000ff';
      const wrapper = shallowMount(ThemeInjector, {
        props: {
          isEnduser: true,
          theme: { primaryColor },
        },
      });

      expect(wrapper.vm.accountCardInputFocusBorderColor).toBe(primaryColor);
      expect(wrapper.html()).toContain('.fr-search-input-holder .input-group:focus-within');
    });

    it('renders global .text-muted color derived from accountCardBackgroundColor and accountCardTextColor', () => {
      // Default theme: bg=#ffffff, accountCardTextColor=#5e6d82, accountCardInputTextColor=#23282e
      // #5e6d82 on #ffffff is ~4.9:1 (passes 4.5), so getContrastColor returns #5e6d82
      const wrapper = shallowMount(ThemeInjector, {
        props: { theme: {} },
      });
      const html = wrapper.html();
      expect(html).toContain('.text-muted');
      // Default accountCardTextColor passes contrast on default white bg — it should appear in the output
      expect(html).toContain(wrapper.vm.accountCardTextColor);
    });

    it('renders multiselect selected option and tag backgrounds using accountCardInputSelectColor', () => {
      const accountCardInputSelectColor = '#abc123';
      const wrapper = shallowMount(ThemeInjector, {
        props: {
          isEnduser: true,
          theme: { accountCardInputSelectColor },
        },
      });
      const html = wrapper.html();
      expect(html).toContain('.multiselect__option--selected');
      expect(html).toContain('.multiselect__tag');
      expect(html).toContain(accountCardInputSelectColor);
    });

    it('renders .text-dark override rules for multiselect selected options and tags', () => {
      const wrapper = shallowMount(ThemeInjector, {
        props: { isEnduser: true, theme: {} },
      });
      const html = wrapper.html();
      expect(html).toContain('.multiselect__option--selected .text-dark');
      expect(html).toContain('.multiselect__tag .text-dark');
    });

    it('injects getContrastColor result as .text-dark color on the select background', () => {
      // accountCardInputSelectColor=#e4f4fd (light), accountCardInputTextColor=#23282e (dark, ~15:1 — passes first)
      const wrapper = shallowMount(ThemeInjector, {
        props: { isEnduser: true, theme: {} },
      });
      const expectedColor = wrapper.vm.getContrastColor(
        wrapper.vm.accountCardInputSelectColor,
        4.5,
        wrapper.vm.accountCardInputTextColor,
        wrapper.vm.accountCardTextColor,
      );
      expect(wrapper.html()).toContain(expectedColor);
    });

    it('renders .text-muted override rules for multiselect selected options and tags', () => {
      const wrapper = shallowMount(ThemeInjector, {
        props: { isEnduser: true, theme: {} },
      });
      const html = wrapper.html();
      expect(html).toContain('.multiselect__option--selected .text-muted');
      expect(html).toContain('.multiselect__tag .text-muted');
    });

    it('injects getMutedTextColor result as .text-muted color on the select background', () => {
      // Default: accountCardInputSelectColor=#e4f4fd, accountCardTextColor=#5e6d82 (~4.68:1, passes),
      // accountCardInputTextColor=#23282e (~13.2:1). getMutedTextColor returns #5e6d82 as-is (ideal path).
      const wrapper = shallowMount(ThemeInjector, {
        props: { isEnduser: true, theme: {} },
      });
      const expectedColor = wrapper.vm.getMutedTextColor(
        wrapper.vm.accountCardInputSelectColor,
        wrapper.vm.accountCardTextColor,
        wrapper.vm.accountCardInputTextColor,
      );
      expect(wrapper.html()).toContain(expectedColor);
    });

    it('renders .multiselect__tag-icon::after color rule alongside .text-dark', () => {
      const wrapper = shallowMount(ThemeInjector, {
        props: { isEnduser: true, theme: {} },
      });
      expect(wrapper.html()).toContain('.multiselect__tag-icon::after');
    });

    it('renders success alert styles using theme successColor', () => {
      const successColor = '#ff0000';
      const wrapper = shallowMount(ThemeInjector, {
        props: { isEnduser: true, theme: { successColor } },
      });
      const html = wrapper.html();
      expect(html).toContain(`border-left-color: ${successColor}`);
      expect(html).toContain(`color-mix(in srgb, ${successColor} 15%, white)`);
    });

    it('renders danger alert styles using theme dangerColor', () => {
      const dangerColor = '#0000ff';
      const wrapper = shallowMount(ThemeInjector, {
        props: {
          isEnduser: true,
          theme: { dangerColor },
        },
      });
      const html = wrapper.html();
      expect(html).toContain(`border-left-color: ${dangerColor}`);
      expect(html).toContain(`color-mix(in srgb, ${dangerColor} 15%, white)`);
    });

    it('renders warning alert styles using theme warningColor', () => {
      const warningColor = '#ff8800';
      const wrapper = shallowMount(ThemeInjector, {
        props: {
          isEnduser: true,
          theme: { warningColor },
        },
      });
      const html = wrapper.html();
      expect(html).toContain(`border-left-color: ${warningColor}`);
      expect(html).toContain(`color-mix(in srgb, ${warningColor} 15%, white)`);
    });
  });
});
