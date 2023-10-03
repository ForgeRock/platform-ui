<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    id="notFoundContainer"
    class="h-100 d-flex"
    fluid>
    <div class="p-5 my-5 container">
      <div
        class="m-auto align-self-center text-center">
        <h1 class="display-1">
          404
        </h1>
        <p class="lead text-center">
          {{ $t("pages.notFound.couldNotFind") }}
        </p>
        <div class="text-center">
          <RouterLink :to="{ path: previousRoute.path }">
            <BButton
              class="mt-2"
              variant="primary">
              {{ $t('pages.notFound.returnRoute', {returnRoute: $t(`routeNames.${previousRoute.name}`)}) }}
            </BButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </BContainer>
</template>

<script>
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import {
  BButton,
  BContainer,
} from 'bootstrap-vue';
/**
 * @description The default 404 page when Vue router is unable to locate a route.
 */
export default {
  name: 'NotFound',
  components: {
    BButton,
    BContainer,
  },
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
  data() {
    return {
      ghostMessage: '404',
      previousRoute: {
        name: this.$t('routeNames.Dashboard'),
        params: {},
        path: '/dashboard',
      },
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.previousRoute = from.name ? from : {
        name: vm.$t('routeNames.Dashboard'),
        params: {},
        path: '/dashboard',
      };
      vm.setBreadcrumb(vm.previousRoute.path, vm.$t(`routeNames.${vm.previousRoute.name}`));
    });
  },
};
</script>
