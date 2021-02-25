<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BJumbotron class="text-center">
    <template v-slot:header>
      <BImg
        :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
        rounded="circle"
        width="112"
        height="112"
        alt="img"
        class="m-1 mb-3" />
      <div>{{ $t('pages.dashboard.widgets.welcome.greeting') }}, {{ fullName }}</div>
    </template>
    <template v-slot:lead>
      <div v-if="!$store.state.isFraas">
        {{ $t('pages.dashboard.widgets.welcome.welcomeMessage') }}
      </div>
      <BButton
        @click="openProfile()"
        variant="primary"
        class="mt-2">
        {{ $t('pages.dashboard.widgets.welcome.editProfile') }}
      </BButton>
    </template>
  </BJumbotron>
</template>

<script>
import { startCase } from 'lodash';

/**
 * @description Widget that provides a welcome message for the managed resource, also provides a button to directly access editing the resources profile.
 *
 * */
export default {
  name: 'WelcomeWidget',
  props: {
    userDetails: {
      type: Object,
      default: () => {},
    },
    widgetDetails: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    openProfile() {
      this.$router.push({ name: 'Profile' });
    },
  },
  computed: {
    fullName() {
      let fullName = '';

      if (this.userDetails.givenName.length > 0 || this.userDetails.sn.length > 0) {
        fullName = startCase(`${this.userDetails.givenName} ${this.userDetails.sn}`);
      } else {
        fullName = this.userDetails.userId;
      }

      return fullName;
    },
  },
};
</script>
