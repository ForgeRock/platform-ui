export default {
  /**
   * @description test if css custom properties AKA css variables are supported.
   * */
  get supported() {
    return window.CSS && CSS.supports('color', 'var(--test-prop)');
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
