<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :ok-title="$t('common.done')"
    body-class="p-0"
    content-class="border-0"
    id="CertificationTaskUserModal"
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
          class="md-24" />
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
          :user="user" />
      </BTab>
      <BTab
        v-if="governanceEnabledV2"
        :title="$t('governance.certificationTask.lineItemDetailsModal.entitlementsTab.title')">
        <FrEntitlementsTab
          :entitlements="userEntitlements" />
      </BTab>
    </BTabs>
  </BModal>
</template>

<script>
import { mapState } from 'vuex';
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

export default {
  name: 'CertificationTaskUserModal',
  components: {
    BButtonClose,
    BImg,
    BMedia,
    BModal,
    BTab,
    BTabs,
    FrEntitlementsTab,
    FrIcon,
    FrUserDetailsTab,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    userEntitlements: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userFullName() {
      return this.$t('common.userFullName', {
        givenName: this.user?.givenName,
        sn: this.user?.sn,
      });
    },
    ...mapState({
      governanceEnabledV2: (state) => state.SharedStore.governanceEnabledV2,
    }),
  },
};
</script>
