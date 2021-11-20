<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
          <RouterLink :to="{ name: previousRoute.name }">
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
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
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
  mixins: [
    BreadcrumbMixin,
  ],
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
      vm.setBreadcrumb(vm.previousRoute.path, vm.previousRoute.name);
    });
  },
};
</script>
