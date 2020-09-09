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
        <div class="fr-speech-bubble">
          <p>
            <strong class="text-muted">
              {{ ghostMessage }}
            </strong>
          </p>
          <div class="fr-speech-arrow" />
        </div>
        <BImg
          @click="ghostMessage === '404' ? ghostMessage = 'Boo' : ghostMessage = '...'"
          :src="require('@forgerock/platform-shared/src/assets/images/ghost.svg')"
          width="112"
          height="112"
          alt="img"
          class="fr-ghost mb-4" />
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
        <BImg
          @click="ghostMessage = '404'"
          :src="require('@forgerock/platform-shared/src/assets/images/ghost-shadow.svg')"
          width="112"
          height="112"
          alt="img"
          class="fr-shadow" />
      </div>
    </div>
  </BContainer>
</template>

<script>
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import {
  BButton,
  BContainer,
  BImg,
} from 'bootstrap-vue';
/**
 * @description The default 404 page when Vue router is unable to locate a route.
 */
export default {
  name: 'NotFound',
  components: {
    BButton,
    BContainer,
    BImg,
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

<style lang="scss">
@keyframes nudge {
  0%,
  100% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(15px, 5px);
  }

  50% {
    transform: translate(20px, 0);
  }

  80% {
    transform: translate(10px, 5px);
  }

  90% {
    transform: translate(-10px, 0);
  }
}

#notFoundContainer {
  .fr-ghost,
  .fr-shadow {
    animation: nudge 5s linear infinite alternate;
    cursor: pointer;
  }

  .fr-speech-bubble {
    animation: nudge 5s linear infinite alternate;
    font-size: 20px;
    font-weight: 300;
    background: $card-bg;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
    line-height: 1.3;
    margin: 0 auto 15px;
    max-width: 110px;
    padding: 15px;
    position: relative;
    right: 70px;

    p {
      margin-bottom: 10px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }

    .fr-speech-arrow {
      border-left: 21px solid transparent;
      border-top: 20px solid rgba(0, 0, 0, 0.2);
      bottom: -25px;
      position: absolute;
      right: 15px;

      &::before {
        border-left: 23px solid transparent;
        border-top: 23px solid $card-bg;
        bottom: 2px;
        content: '';
        position: absolute;
        right: 5px;
      }

      &::after {
        border-left: 21px solid transparent;
        border-top: 23px solid $card-bg;
        bottom: 4px;
        content: '';
        position: absolute;
        right: 6px;
      }
    }
  }
}
</style>
