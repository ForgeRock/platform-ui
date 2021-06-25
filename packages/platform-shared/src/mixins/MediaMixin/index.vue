<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import cssCustomProperties from '../../utils/cssCustomProperties';

export default {
  name: 'MediaMixin',
  data: () => ({
    /**
     * @description IE 10 does not support custom properties so a fallback value is provided, elsewhere css variables from bootstrap controls this code.
     * */
    alias$: {
      sm: `screen and (min-width: ${cssCustomProperties.getWithFallback('breakpoint-sm', '576px')})`,
      'lt-sm': `screen and (max-width: ${cssCustomProperties.getWithFallback('breakpoint-sm', '576px')})`,
      md: `screen and (min-width: ${cssCustomProperties.getWithFallback('breakpoint-md', '768px')})`,
      'lt-md': `screen and (max-width: ${cssCustomProperties.getWithFallback('breakpoint-md', '768px')})`,
      lg: `screen and (min-width: ${cssCustomProperties.getWithFallback('breakpoint-lg', '992px')})`,
      'lt-lg': `screen and (max-width: ${cssCustomProperties.getWithFallback('breakpoint-lg', '992px')})`,
      xl: `screen and (min-width: ${cssCustomProperties.getWithFallback('breakpoint-xl', '1200px')})`,
      'lt-xl': `screen and (max-width: ${cssCustomProperties.getWithFallback('breakpoint-xl', '1200px')})`,
      dark: '(prefers-color-scheme: dark)',
      'no-animation': '(prefers-reduced-motion)',
      'any-hover': '(any-hover: hover), all and (-ms-high-contrast: none), (-ms-high-contrast: active)',
    },
  }),
  methods: {
    /**
     * @description takes a media query or an alias name to query media, acceptable queries can be any css media query.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
     * */
    media(qs) {
      if (Object.keys(this.alias$).includes(qs)) {
        return window.matchMedia(this.alias$[qs]);
      }
      return window.matchMedia(qs);
    },
  },
};
</script>
