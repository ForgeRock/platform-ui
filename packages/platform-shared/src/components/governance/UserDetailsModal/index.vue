<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :ok-title="$t('common.done')"
    body-class="p-0"
    content-class="border-0"
    id="GovernanceUserDetailsModal"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    scrollable
    size="xl">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <BImg
          class="mr-3 rounded-circle"
          height="36"
          width="36"
          :alt="userFullName"
          :src="(user && user.profileImage) || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          fluid />
        <div class="media-body">
          <h5 class="m-0">
            {{ userFullName }}
          </h5>
          <small class="text-muted">
            {{ user && user.userName }}
          </small>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <BTabs
      class="card-tabs-vertical"
      pills
      vertical>
      <BTab
        active
        :title="$t('governance.certificationTask.lineItemDetailsModal.userDetailsTabText')">
        <FrUserDetailsTab
          v-if="user"
          :manager="manager"
          :user="user" />
      </BTab>
      <template v-if="!onlyDetails">
        <BTab :title="$t('common.roles')">
          <FrRolesTab :roles="userDetails.userRoles" />
        </BTab>
        <BTab :title="$t('common.accounts')">
          <FrAccountsTab :accounts="userDetails.userAccounts" />
        </BTab>
        <BTab :title="$t('common.entitlements')">
          <FrEntitlementsTab :entitlements="userDetails.userEntitlements" />
        </BTab>
      </template>
    </BTabs>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BModal,
  BTab,
  BTabs,
  BMedia,
  BImg,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserDetailsTab from './UserDetailsTab';
import FrEntitlementsTab from './EntitlementsTab';
import FrRolesTab from './RolesTab';
import FrAccountsTab from './AccountsTab';

export default {
  name: 'GovernanceUserDetailsModal',
  components: {
    BButtonClose,
    BImg,
    BMedia,
    BModal,
    BTab,
    BTabs,
    FrAccountsTab,
    FrEntitlementsTab,
    FrIcon,
    FrRolesTab,
    FrUserDetailsTab,
  },
  props: {
    manager: {
      type: Object,
      default: () => ({}),
    },
    user: {
      type: Object,
      required: true,
    },
    userDetails: {
      type: Object,
      required: true,
      default: () => ({
        userAccounts: {},
        userEntitlements: {},
        userRoles: {},
      }),
    },
    onlyDetails: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    userFullName() {
      return this.$t('common.userFullName', {
        givenName: this.user?.givenName,
        sn: this.user?.sn,
      });
    },
  },
};
</script>
