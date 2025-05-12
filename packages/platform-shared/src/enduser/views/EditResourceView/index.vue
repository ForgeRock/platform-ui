<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrEditResource
    @breadcrumb-data-changed="setBreadcrumb($event.route, $event.routeName)"
    @save-clicked="(refreshData) => refreshData()" />
</template>

<script>
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrEditResource from '@forgerock/platform-shared/src/components/resource/EditResource';

/**
 * @description View for edit resource component
 *
 */
export default {
  name: 'EditResourceView',
  components: {
    FrEditResource,
  },
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
};
</script>
