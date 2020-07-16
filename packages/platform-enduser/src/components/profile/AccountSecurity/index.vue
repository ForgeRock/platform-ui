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
          v-show="!item.hide"
          :key="item.title"
          class="border-bottom">
          <BRow>
            <BCol
              md="5">
              <h5>{{ item.title }}</h5>
            </BCol>
            <BCol md="5">
              <i
                v-if="item.icon"
                class="material-icons mr-2 text-success">
                {{ item.icon }}
              </i>
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
  },
  data() {
    return {
      isOnKBA: false,
      kbaData: {},
      items: [
        {
          title: this.$t('common.placeholders.username'),
          text: this.userName,
        },
        {
          title: this.$t('common.placeholders.password'),
          linkText: this.$t('common.reset'),
          linkUrl: `${process.env.VUE_APP_LOGIN_URL}/#/service/UpdatePassword`,
        },
        {
          title: this.$t('pages.profile.accountSecurity.twoStepVerification'),
          hide: true,
          text: this.$t('common.on'),
          icon: 'check_circle',
          linkText: this.$t('common.change'),
          linkPath: '/auth-devices',
        },
      ],
    };
  },
  mounted() {
    // this forces reactivity for value grabbed from store
    this.$set(this.items[0], 'text', this.userName);

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
            this.$set(this.items[2], 'hide', false);
          }
        });
    },
  },
};
</script>
