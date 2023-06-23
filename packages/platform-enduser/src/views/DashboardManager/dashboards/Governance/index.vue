<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer fluid="true">
      <BRow class="mx-4">
        <BCol
          class="mt-4"
          sm="12">
          <Welcome
            display-compact-header
            :user-details="userDetails" />
        </BCol>
      </BRow>
    </BContainer>
    <BContainer>
      <BRow>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="access-reviews"
            :count="accessReviewsCount"
            :link-text="$t('pages.dashboard.cardCount.viewAccessReviews')"
            :loading="loading"
            :title="$t('pages.dashboard.cardCount.accessReviews')" />
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script>
import { get } from 'lodash';
import { mapState } from 'vuex';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrCountCard from '@forgerock/platform-shared/src/components/CountCard';
import { getCertificationItems } from '@/api/governance/AccessReviewApi';
import Welcome from '@/views/DashboardManager/dashboards/widgets/WelcomeWidget';

/**
 * @description Controlling component for the governance dashboard
 * @event GET
 */
export default {
  name: 'GovernanceDashboard',
  components: {
    FrCountCard,
    Welcome,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      accessReviewsCount: 0,
      loading: false,
    };
  },
  computed: {
    ...mapState({
      userDetails: (state) => state.UserStore,
    }),
  },
  mounted() {
    this.getAccessReviewsCount();
  },
  methods: {
    /**
     * Performs API call to get total access reviews
     * @returns {Void}
     * */
    getAccessReviewsCount() {
      this.loading = true;
      getCertificationItems({ status: 'active' })
        .then((resourceData) => {
          this.accessReviewsCount = get(resourceData, 'data.totalCount', 0);
          this.$store.commit('setCertificationCount', this.accessReviewsCount);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingAccesReviews'));
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
