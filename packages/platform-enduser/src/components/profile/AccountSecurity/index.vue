<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div>
    <BCard no-body>
      <BCardHeader class="p-4">
        <h4>{{ $t('pages.profile.accountSecurity.title') }}</h4>
        <p class="m-0">
          {{ $t('pages.profile.accountSecurity.subtitle') }}
        </p>
      </BCardHeader>
      <template
        v-for="item in items">
        <BCardBody
          :key="item.title"
          class="border-bottom">
          <BRow>
            <BCol
              md="5">
              <h5>{{ item.title }}</h5>
            </BCol>
            <BCol md="5">
              <span
                v-if="item.iconType === 'OFF'"
                aria-hidden="true"
                class="material-icons-outlined mr-2">
                remove_circle
              </span>
              <span
                v-if="item.iconType === 'ON'"
                aria-hidden="true"
                class="material-icons mr-2 text-success">
                check_circle
              </span>
              {{ item.text }}
            </BCol>
            <BCol
              md="2">
              <BButton
                class="py-0 text-right text-nowrap"
                variant="link"
                v-if="item.linkUrl"
                :href="item.linkUrl">
                {{ item.linkText }}
              </BButton>
              <RouterLink
                class="py-0 text-right text-nowrap"
                v-if="item.linkPath"
                :to="item.linkPath">
                {{ item.linkText }}
              </RouterLink>
            </BCol>
          </BRow>
        </BCardBody>
      </template>
      <BCardBody>
        <FrEditKba
          class="w-100"
          v-if="isOnKBA && internalUser === false"
          :kba-data="kbaData"
          @updateKBA="sendUpdateKBA" />
      </BCardBody>
    </BCard>
  </div>
</template>
<script>
import {
  BButton,
  BCard,
  BCardBody,
  BCardHeader,
  BCol,
  BRow,
} from 'bootstrap-vue';
import { mapState } from 'vuex';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import EditKBA from '@/components/profile/EditKBA';
import store from '@forgerock/platform-shared/src/store';
/**
 * @description Handles displaying account security controls
 */
export default {
  name: 'AccountSecurity',
  components: {
    BButton,
    BCard,
    BCardBody,
    BCardHeader,
    BCol,
    BRow,
    FrEditKba: EditKBA,
  },
  mixins: [
    RestMixin,
  ],
  computed: {
    ...mapState({
      internalUser: (state) => state.UserStore.internalUser,
      userId: (state) => state.UserStore.userId,
      userName: (state) => state.UserStore.userName,
    }),
    usernameItem() {
      return {
        title: this.$t('common.placeholders.username'),
        text: this.userName,
      };
    },
    items() {
      return [
        this.usernameItem,
        this.passwordItem,
        this.mfaItem,
      ];
    },
  },
  data() {
    return {
      isOnKBA: false,
      kbaData: {},
      passwordItem: {
        title: this.$t('common.placeholders.password'),
        linkText: this.$t('common.reset'),
        linkUrl: `${store.state.amBaseURL}/UI/Login?realm=${(new URLSearchParams(window.location.search)).get('realm') || '/'}&authIndexType=service&authIndexValue=UpdatePassword&goto=${encodeURIComponent(window.location.href)}`,
      },
      mfaItem: {
        title: this.$t('pages.profile.accountSecurity.twoStepVerification'),
        text: this.$t('common.off'),
        iconType: 'OFF',
      },
    };
  },
  mounted() {
    const selfServiceInstance = this.getRequestService({
      headers: this.getAnonymousHeaders(),
    });

    selfServiceInstance.get('selfservice/kba').then((response) => {
      this.isOnKBA = true;
      this.kbaData = response.data;
    }).catch(() => { this.isOnKBA = false; });

    this.loadAuthenicationDevices();
  },
  methods: {
    sendUpdateKBA(payload, config) {
      this.$emit('updateKBA', payload, config);
    },
    loadAuthenicationDevices() {
      const query = '_queryId=*';
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const authTypes = ['oath', 'push', 'webauthn'];

      const authPromises = authTypes.map((authType) => {
        const url = `/users/${this.userId}/devices/2fa/${authType}?${query}`;
        return selfServiceInstance.get(url, { withCredentials: true });
      });
      Promise.all(authPromises)
        .then((responseArray) => {
          const collapsedResponseArray = responseArray.reduce((acc, response) => acc.concat(response.data.result), []);
          if (collapsedResponseArray.length) {
            this.mfaItem = {
              title: this.$t('pages.profile.accountSecurity.twoStepVerification'),
              text: this.$t('common.on'),
              iconType: 'ON',
              linkText: this.$t('common.change'),
              linkPath: '/auth-devices',
            };
          }
        });
    },
  },
};
</script>
