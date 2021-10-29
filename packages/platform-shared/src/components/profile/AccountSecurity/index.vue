<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard no-body>
      <BCardHeader class="p-4">
        <h4>{{ $t('pages.profile.accountSecurity.title') }}</h4>
        <p class="m-0">
          {{ $t('pages.profile.accountSecurity.subtitle') }}
        </p>
      </BCardHeader>
      <template v-for="item in items">
        <BCardBody
          v-if="!themeSections.securityQuestions || themeSections[item.key].enabled"
          :key="item.title"
          class="border-bottom">
          <BRow>
            <BCol md="5">
              <h5>{{ item.title }}</h5>
            </BCol>
            <BCol md="5">
              <FrIcon
                v-if="item.iconType === 'OFF'"
                name="remove_circle"
                class="mr-2" />
              <FrIcon
                v-else-if="item.iconType === 'ON'"
                name="check_circle"
                class="mr-2 text-success" />
              {{ item.text }}
            </BCol>
            <BCol
              class="text-right text-nowrap"
              md="2">
              <a
                :aria-label="item.ariaLabel"
                v-if="item.linkUrl"
                :href="item.linkUrl">
                {{ item.linkText }}
              </a>
              <RouterLink
                :aria-label="item.ariaLabel"
                class="py-0 text-right text-nowrap"
                v-if="item.linkPath"
                :to="item.linkPath">
                {{ item.linkText }}
              </RouterLink>
            </BCol>
          </BRow>
        </BCardBody>
      </template>
      <BCardBody v-if="isOnKBA && internalUser === false && (!themeSections.securityQuestions || themeSections.securityQuestions.enabled)">
        <FrEditKba
          class="w-100"
          :kba-data="kbaData"
          @updateKBA="sendUpdateKBA"
          :processing-request="processingRequest"
        />
      </BCardBody>
    </BCard>
  </div>
</template>
<script>
import {
  BCard,
  BCardBody,
  BCardHeader,
  BCol,
  BRow,
} from 'bootstrap-vue';
import { mapState } from 'vuex';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrEditKba from '@forgerock/platform-shared/src/components/profile/EditKBA';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import store from '@/store';
/**
 * @description Handles displaying account security controls
 */
export default {
  name: 'AccountSecurity',
  components: {
    BCard,
    BCardBody,
    BCardHeader,
    BCol,
    BRow,
    FrEditKba,
    FrIcon,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  props: {
    forceRoot: {
      type: Boolean,
      default: false,
    },
    processingRequest: {
      type: Boolean,
      default: false,
    },
    themeSections: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapState({
      internalUser: (state) => state.UserStore.internalUser,
      userId: (state) => state.UserStore.userSearchAttribute,
      userName: (state) => state.UserStore.userName,
    }),
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
        ariaLabel: this.$t('pages.access.resetPassword'),
        key: 'password',
        linkText: this.$t('common.reset'),
        linkUrl: '',
        title: this.$t('common.placeholders.password'),
      },
      mfaItem: {
        iconType: 'OFF',
        key: 'twoStepVerification',
        title: this.$t('pages.profile.accountSecurity.twoStepVerification'),
        text: this.$t('common.off'),
      },
      usernameItem: {
        ariaLabel: this.$t('pages.profile.accountSecurity.resetUsername'),
        key: 'username',
        linkText: this.$t('common.update'),
        linkUrl: '',
        text: '',
        title: this.$t('common.placeholders.username'),
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
    this.setUpdateJourneys();
  },
  watch: {
    '$store.state.UserStore.userName': {
      handler(newVal) {
        this.usernameItem.text = newVal;
      },
      immediate: true,
    },
  },
  methods: {
    setUpdateJourneys() {
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      this.getRequestService(configOptions).get('/selfservice/trees').then((res) => {
        const realm = this.forceRoot ? '/' : (new URLSearchParams(window.location.search)).get('realm') || '/';
        const passwordJourney = res.data.mapping.updatePassword;
        if (passwordJourney) {
          this.$set(this.passwordItem, 'linkUrl', `${store.state.SharedStore.amBaseURL}/UI/Login?realm=${realm}&noSession=true&ForceAuth=true&authIndexType=service&authIndexValue=${passwordJourney}&goto=${encodeURIComponent(window.location.href)}`);
        }
        const usernameJourney = res.data.mapping.updateUsername;
        if (usernameJourney) {
          this.$set(this.usernameItem, 'linkUrl', `${store.state.SharedStore.amBaseURL}/UI/Login?realm=${realm}&noSession=true&ForceAuth=true&authIndexType=service&authIndexValue=${usernameJourney}&goto=${encodeURIComponent(window.location.href)}`);
        }
      }, () => {
        this.displayNotification('', 'error', this.$t('pages.profile.accountSecurity.journeyServiceError'));
      });
    },
    sendUpdateKBA(payload, config) {
      this.$emit('updateKBA', payload, config);
    },
    loadAuthenicationDevices() {
      const query = '_queryId=*&_fields=_id';
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);
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
              key: 'twoStepVerification',
              linkText: this.$t('common.change'),
              linkPath: '/auth-devices',
            };
          }
        });
    },
  },
};
</script>
