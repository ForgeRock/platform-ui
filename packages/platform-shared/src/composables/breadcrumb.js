/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed, onBeforeUnmount } from 'vue';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';

/**
 * Composable for integrating breadcrumb behaviour into views that will be composed together with the Navbar component.
 * @param {Boolean} clearOnLeave whether the composable should clear the breadcrumb when the consuming component is unmounted
 */
export default function useBreadcrumb(clearOnLeave = true) {
  const breadcrumbStore = useBreadcrumbStore();
  const returnRoute = computed(() => breadcrumbStore.returnRoute);
  const returnRouteText = computed(() => breadcrumbStore.returnRouteText);
  const hasBreadcrumb = computed(() => breadcrumbStore.returnRoute !== '');

  function setBreadcrumb(route = '', text = '') {
    breadcrumbStore.returnRoute = route;
    breadcrumbStore.returnRouteText = text;
  }

  if (clearOnLeave) {
    onBeforeUnmount(() => {
      if (hasBreadcrumb.value) {
        setBreadcrumb('', '');
      }
    });
  }

  return {
    setBreadcrumb,
    hasBreadcrumb,
    returnRoute,
    returnRouteText,
  };
}
