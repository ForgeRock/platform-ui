<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    class="h-100 d-flex"
    fluid>
    <div
      style="width: 550px;"
      class="m-auto align-self-center text-center">
      <BImg
        :src="require('@forgerock/platform-shared/src/assets/images/locked.svg')"
        width="112"
        height="112"
        alt="img"
        class="mb-2" />
      <p class="lead text-center font-weight-light text-muted mb-5">
        {{ $t("pages.forbidden.notAuthorized") }}
      </p>
      <hr class="fr-accent">
      <div class="text-center">
        <BButton
          v-if="showDashboard"
          variant="link"
          @click="$router.push({ name: 'Dashboard' })">
          {{ $t('pages.forbidden.returnToDashboard') }}
        </BButton>
      </div>
      <div class="text-center">
        <BButton
          variant="link"
          @click="logoutUser">
          {{ $t('pages.forbidden.signOut') }}
        </BButton>
      </div>
    </div>
  </BContainer>
</template>

<script>
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import {
  BButton,
  BContainer,
  BImg,
} from 'bootstrap-vue';

/**
 * @description The default 403 page when an unauthorized user tries to access the admin
 */
export default {
  name: 'Forbidden',
  props: {
    showDashboard: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    BButton,
    BContainer,
    BImg,
  },
  mixins: [LoginMixin],
  beforeRouteLeave(to, from, next) {
    this.$store.commit('UserStore/setUserId', null);
    next();
  },
};
</script>
