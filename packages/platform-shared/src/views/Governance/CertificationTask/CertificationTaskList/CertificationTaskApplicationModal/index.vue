<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    content-class="border-0"
    id="CertificationTaskApplicationModal"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <BImg
          class="mr-3"
          height="36"
          width="36"
          :alt="application.name"
          :src="logo"
          fluid />
        <div class="media-body">
          <small class="mb-1">
            {{ displayName }}
          </small>
          <h5 class="mb-0">
            {{ application.name }}
          </h5>
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
        :title="$t('governance.certificationTask.lineItemDetailsModal.applicationDetailsTabText')">
        <div class="p-4">
          <dl class="row">
            <dt class="col-lg-4">
              {{ $t('governance.certificationTask.lineItemDetailsModal.applicationDetailsTab.nameLabel') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ application.name }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.description') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ application.description }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('governance.certificationTask.lineItemDetailsModal.applicationDetailsTab.ownerLabel') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              <BMedia
                v-for="(owner, i) in application.applicationOwners"
                :key="i"
                class="align-items-center"
                no-body>
                <BImg
                  class="mr-3 rounded-circle"
                  height="36"
                  width="36"
                  :alt="getFullName(owner.givenName, owner.sn)"
                  :src="owner.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                  fluid />
                <div class="media-body">
                  <h5 class="m-0">
                    {{ getFullName(owner.givenName, owner.sn) }}
                  </h5>
                  <small class="text-muted">
                    {{ owner.userName }}
                  </small>
                </div>
              </BMedia>
            </dd>
          </dl>
        </div>
      </BTab>
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
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'CertificationTaskApplicationModal',
  components: {
    BButtonClose,
    BModal,
    BTab,
    BTabs,
    FrIcon,
    BMedia,
    BImg,
  },
  mixins: [AppSharedUtilsMixin],
  props: {
    application: {
      type: Object,
      required: true,
    },
  },
  computed: {
    logo() {
      return this.getApplicationLogo(this.application);
    },
    displayName() {
      return this.getApplicationDisplayName(this.application);
    },
  },
  methods: {
    getFullName(givenName, sn) {
      return this.$t('governance.certificationTask.userFullName', {
        givenName,
        sn,
      });
    },
  },
  data() {
    return {
      blankValueIndicator,
    };
  },
};
</script>
