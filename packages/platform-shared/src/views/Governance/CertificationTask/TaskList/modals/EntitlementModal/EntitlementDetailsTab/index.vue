<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <dl class="row">
      <dt class="col-lg-4">
        {{ $t('common.owner') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="owner">
        <BMedia
          v-if="ownerInfo"
          no-body>
          <BImg
            fluid
            class="mr-3 rounded-circle"
            height="36"
            width="36"
            :alt="getFullName(ownerInfo.givenName, ownerInfo.sn)"
            :src="ownerInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          <BMediaBody>
            <h3 class="h5 mb-0 text-dark text-truncate">
              {{ getFullName(ownerInfo.givenName, ownerInfo.sn) }}
            </h3>
            <small class="text-truncate">
              {{ ownerInfo.userName }}
            </small>
          </BMediaBody>
        </BMedia>
        <template v-else>
          {{ blankValueIndicator }}
        </template>
      </dd>
      <dt class="col-lg-4">
        {{ $t('common.description') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="entDescription">
        {{ description }}
      </dd>
    </dl>
    <BButton
      @click="showTechnicalDetails = !showTechnicalDetails"
      class="my-4 p-0"
      variant="link">
      {{ showTechnicalDetails ? $t('governance.certificationTask.hideTechnicalDetails') : $t('governance.certificationTask.showTechnicalDetails') }}
    </BButton>
    <BCollapse :visible="showTechnicalDetails">
      <div class="p-4 bg-light rounded">
        <dl
          v-for="item in Object.keys(entitlement)"
          :key="item"
          class="row"
          :data-testid="item">
          <dt class="col-lg-4">
            {{ item }}
          </dt>
          <dd class="col-lg-8 mb-4">
            {{ !isNil(entitlement[item]) ? entitlement[item] : blankValueIndicator }}
          </dd>
        </dl>
      </div>
    </BCollapse>
  </div>
</template>

<script>
import { isNil } from 'lodash';
import {
  BButton,
  BCollapse,
  BImg,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

/**
 * @description tab component to show entitlement details inside the parent BTabs component
 *
 * @param {object} entitlement - object with the entitlement details
 */
export default {
  name: 'EntitlementDetailsTab',
  components: {
    BButton,
    BCollapse,
    BImg,
    BMedia,
    BMediaBody,
  },
  props: {
    entitlement: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      blankValueIndicator,
      isNil,
      showTechnicalDetails: false,
    };
  },
  computed: {
    ownerInfo() {
      if (!this.entitlement?.entitlementOwner || !this.entitlement?.entitlementOwner?.length) return null;
      const [owner] = this.entitlement.entitlementOwner;

      return owner;
    },
    description() {
      return this.entitlement?.glossary?.idx?.['/entitlement']?.description || blankValueIndicator;
    },
  },
  methods: {
    getFullName(givenName, sn) {
      return this.$t('common.userFullName', {
        givenName,
        sn,
      });
    },
  },
};
</script>
