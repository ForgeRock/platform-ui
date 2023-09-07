/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable vue/one-component-per-file */

import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { setupTestPinia } from '../utils/testPiniaHelpers';
import useBreadcrumb from './breadcrumb';

describe('breadcrumb composable', () => {
  function setupTestStore(returnRoute, returnRouteText) {
    setupTestPinia({ breadcrumb: { returnRoute, returnRouteText } });
  }

  describe('retrieving values', () => {
    it('should expose the return route', () => {
      setupTestStore('/test/route', 'Test Route');
      const { returnRoute } = useBreadcrumb(false);
      expect(returnRoute.value).toBe('/test/route');
    });

    it('should expose the return route text', () => {
      setupTestStore('/test/route', 'Test Route');
      const { returnRouteText } = useBreadcrumb(false);
      expect(returnRouteText.value).toBe('Test Route');
    });
  });

  describe('hasBreadcrumb', () => {
    it('should be true if the return route is set', () => {
      setupTestStore('/test/route', 'Test Route');
      const { hasBreadcrumb } = useBreadcrumb(false);
      expect(hasBreadcrumb.value).toBe(true);
    });

    it('should be false if the return route is not set', () => {
      setupTestStore('', '');
      const { hasBreadcrumb, returnRoute } = useBreadcrumb(false);
      expect(returnRoute.value).toBe('');
      expect(hasBreadcrumb.value).toBe(false);
    });
  });

  describe('setBreadcrumb', () => {
    it('should set the return route and return route text', () => {
      setupTestStore('', '');
      const { setBreadcrumb, returnRoute, returnRouteText } = useBreadcrumb(false);

      expect(returnRoute.value).toBe('');
      expect(returnRouteText.value).toBe('');

      setBreadcrumb('/test/route', 'Test Route');

      expect(returnRoute.value).toBe('/test/route');
      expect(returnRouteText.value).toBe('Test Route');
    });
  });

  describe('clearing the breadcrumb before unmount', () => {
    it('by default, should clear the return route and return route text before the component is unmounted', () => {
      setupTestStore('', '');
      const { returnRoute, returnRouteText } = useBreadcrumb(false);

      const TestComponent = defineComponent({
        setup() {
          const { setBreadcrumb } = useBreadcrumb();
          setBreadcrumb('/test/route', 'Test Route');
        },
        template: '<div></div>',
      });

      expect(returnRoute.value).toBe('');
      expect(returnRouteText.value).toBe('');

      const wrapper = mount(TestComponent);

      expect(returnRoute.value).toBe('/test/route');
      expect(returnRouteText.value).toBe('Test Route');

      wrapper.unmount();

      expect(returnRoute.value).toBe('');
      expect(returnRouteText.value).toBe('');
    });

    it('when told do, should not clear the return route and return route text before the component is unmounted ', () => {
      setupTestStore('', '');
      const { returnRoute, returnRouteText } = useBreadcrumb(false);

      const TestComponent = defineComponent({
        setup() {
          const { setBreadcrumb } = useBreadcrumb(false);
          setBreadcrumb('/test/route', 'Test Route');
        },
        template: '<div></div>',
      });

      expect(returnRoute.value).toBe('');
      expect(returnRouteText.value).toBe('');

      const wrapper = mount(TestComponent);

      expect(returnRoute.value).toBe('/test/route');
      expect(returnRouteText.value).toBe('Test Route');

      wrapper.unmount();

      expect(returnRoute.value).toBe('/test/route');
      expect(returnRouteText.value).toBe('Test Route');
    });
  });
});
