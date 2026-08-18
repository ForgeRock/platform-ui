width: 550px;<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

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
        :alt="$t('pages.forbidden.forbidden')"
        class="mb-2" />
      <p class="lead text-center font-weight-light text-muted mb-5">
        <template v-if="showLogout">
          {{ $t("pages.forbidden.notAuthorized") }}
        </template>
        <template v-else>
          {{ $t("pages.forbidden.notAuthorizedLogin") }}
        </template>
      </p>
      <hr class="fr-accent">
      <div
        v-if="showDashboard"
        class="text-center">
        <BButton
          variant="link"
          @click="redirectToDashboard">
          {{ $t('pages.forbidden.returnToDashboard') }}
        </BButton>
      </div>
      <div
        v-if="showLogout"
        class="text-center">
        <BButton
          variant="link"
          @click="logoutUser">
          {{ $t('common.signOut') }}
        </BButton>
      </div>
    </div>
  </BContainer>
</template>

<script>
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
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
    showLogout: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    BButton,
    BContainer,
    BImg,
  },
  methods: {
    redirectToDashboard() {
      // 'Return to Dashboard' always stays inside the current admin app.
      // Policy-evaluated admins (e.g. Tenant Auditor, Brand Admin) may have no
      // defaultRoute recorded; they are still admin users, so they should never
      // be sent to the end-user portal.
      this.$router.push({ name: this.$store.state.defaultRoute?.name || 'Dashboard' });
    },
  },
  mixins: [LoginMixin],
  beforeRouteLeave(to, from, next) {
    const userStore = useUserStore();
    userStore.userId = null;
    next();
  },
};
</script>
