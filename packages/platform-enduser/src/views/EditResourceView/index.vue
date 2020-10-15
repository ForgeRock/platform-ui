<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <FrEditResource @breadcrumb-data-changed="setBreadcrumb($event.route, $event.routeName)" />
</template>

<script>
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
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
  mixins: [
    BreadcrumbMixin,
  ],
};
</script>
