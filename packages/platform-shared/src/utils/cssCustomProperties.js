/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default {
  /**
   * @description test if css custom properties AKA css variables are supported.
   * */
  get supported() {
    return window.CSS && window.CSS.supports && CSS.supports('color', 'var(--test-prop)');
  },
  /**
   * @description Set or update a single css variable
   * */
  set(key, value) {
    return document.documentElement.style.setProperty(`--${key}`, `${(value).toString()}`);
  },
  /**
   * @description Set or update a single css variable
   * */
  get(key) {
    return window.getComputedStyle(document.documentElement).getPropertyValue(`--${key}`);
  },
  /**
   * @description Get a css variable and provide a fallback value for IE11
   * */
  getWithFallback(key, ieFallback) {
    return this.supported ? this.get(key) : ieFallback;
  },
};
