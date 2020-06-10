<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BCard no-body>
      <BCardHeader class="p-4">
        <h4>{{ $t('pages.profile.accountSecurity.title') }}</h4>
        <p class="m-0">
          {{ $t('pages.profile.accountSecurity.subtitle') }}
        </p>
      </BCardHeader>
      <BCardBody
        v-for="item in items"
        :key="item.title"
        class="border-bottom">
        <BRow>
          <BCol md="5">
            <h5>{{ item.title }}</h5>
          </BCol>
          <BCol md="5">
            {{ item.value }}
          </BCol>
          <BCol md="2">
            <BButton
              class="py-0"
              variant="link"
              v-if="item.linkUrl"
              :href="item.linkUrl">
              {{ item.linkText }}
            </BButton>
          </BCol>
        </BRow>
      </BCardBody>
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
  methods: {
    sendUpdateKBA(payload, config) {
      this.$emit('updateKBA', payload, config);
    },
  },
  computed: {
    ...mapState({
      internalUser: (state) => state.UserStore.internalUser,
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
          value: this.userName,
        },
        {
          title: this.$t('common.placeholders.password'),
          linkText: 'Reset',
          linkUrl: `${process.env.VUE_APP_LOGIN}/#/service/UpdatePassword`,
        },
      ],
    };
  },
  mounted() {
    // this forces reactivity for value grabbed from store
    this.$set(this.items[0], 'value', this.userName);

    const selfServiceInstance = this.getRequestService({
      headers: this.getAnonymousHeaders(),
    });

    selfServiceInstance.get('selfservice/kba').then((response) => {
      this.isOnKBA = true;
      this.kbaData = response.data;
    }).catch(() => { this.isOnKBA = false; });
  },
};
</script>
