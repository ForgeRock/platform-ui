<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="displayCompactHeader"
    class="container my-4"
    data-testid="compactHeader">
    <BMedia>
      <template #aside>
        <BAvatar
          variant="link"
          size="72px"
          :src="avatarSource" />
      </template>
      <h1 class="text-capatilize">
        {{ $t(`pages.dashboard.widgets.welcome.greeting${timeOfDay}`, { name: givenName }) }}
      </h1>
      <p>{{ $t('pages.dashboard.widgets.welcome.welcomeMessageCompact') }}</p>
    </BMedia>
  </div>
  <div
    v-else
    data-testid="defaultHeader"
  >
    <BJumbotron class="text-center">
      <template #header>
        <BAvatar
          variant="link"
          size="112px"
          :src="avatarSource" />
        <div data-testid="dashboard-welcome-greeting">
          {{ $t('pages.dashboard.widgets.welcome.greeting') }}, <span class="text-capitalize">
            {{ name }}
          </span>
        </div>
      </template>
      <template #lead>
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
  </div>
</template>

<script>
import {
  BAvatar,
  BButton,
  BJumbotron,
  BMedia,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';

/**
 * @description Widget that provides a welcome message for the managed resource, also provides a button to directly access editing the resources profile.
 */
export default {
  name: 'WelcomeWidget',
  props: {
    widgetDetails: {
      type: Object,
      default: () => {},
    },
    displayCompactHeader: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BAvatar,
    BButton,
    BJumbotron,
    BMedia,
  },
  data() {
    return {
      timeOfDay: '',
    };
  },
  mounted() {
    this.getTimeOfDay(new Date().getHours());
  },
  methods: {
    openProfile() {
      this.$router.push({ name: 'Profile' });
    },
    getTimeOfDay(currentHour) {
      if (currentHour >= 0 && currentHour < 12) {
        this.timeOfDay = 'Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        this.timeOfDay = 'Afternoon';
      } else {
        this.timeOfDay = 'Evening';
      }
    },
  },
  computed: {
    ...mapState(useUserStore, ['name', 'givenName']),
    ...mapState(useEnduserStore, ['profileImage']),
    avatarSource() {
      return this.profileImage.length > 0 ? this.profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png'); // eslint-disable-line global-require
    },
  },
};
</script>
<style lang=scss scoped>
@include media-breakpoint-down(xs) {
  .media {
    flex-direction: column;
  }
}
</style>
