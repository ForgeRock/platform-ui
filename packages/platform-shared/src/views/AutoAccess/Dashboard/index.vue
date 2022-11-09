<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-dashboard-wrapper container my-5 dashboard">
    <div class="my-5">
      <div class="d-flex flex-row align-items-center">
        <div class="mb-4 mr-4">
          <img
            :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            alt="Avatar"
            width="80"
            height="80">
        </div>
        <FrHeader
          class="w-75"
          :title="title"
          :subtitle="$t('access.dashboard.subtitle')" />
        <div class="flex-fill text-right">
          <DateRangePicker
            :disabled="loading[0] || loading[1]"
          />
        </div>
      </div>
      <div class="d-flex flex-row">
        <BCard class="overflow-hidden flex-grow-1 w-50 mr-3 mb-3">
          <AccessAttempts
            :date-range="dateRange"
            @loading="(value) => setLoading('normalAccess', value)"
            :disabled="loading.normalAccess"
            type="normal"
          />
        </BCard>
        <BCard class="overflow-hidden flex-grow-1 w-50 ml-3 mb-3">
          <AccessAttempts
            :date-range="dateRange"
            @loading="(value) => setLoading('riskyAccess', value)"
            :disabled="loading.riskyAccess"
            type="risky"
          />
        </BCard>
      </div>
      <BCard
        no-body
        class="mt-3">
        <h5 class="m-4">
          {{ $t("access.dashboard.riskiestUsersHeader") }}
        </h5>
        <BListGroup>
          <div
            v-if="loading.riskiestUsers"
            class="text-center mb-4">
            <BSpinner variant="primary" />
          </div>
          <div
            v-else-if="riskyUsers.length === 0"
            class="text-center mb-4">
            <span class="text-dark">
              Risky user data unavailable
            </span>
          </div>
          <RouterLink
            v-for="(user, i) in riskyUsers.slice(0, 5)"
            :to="`user-detail/${user.userId}`"
            :key="`${user.user}-${i}`"
            class="d-flex flex-row list-group-item border-left-0 border-right-0"
          >
            <img
              :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
              class="align-self-center"
              alt="Avatar"
              width="34"
              height="34">
            <div class="d-flex flex-column flex-grow-1 ml-3 my-1">
              <div class="d-flex flex-row mb-1">
                <div class="text-dark mr-2 font-weight-bold">
                  {{ user.name }}
                </div>
                <div class="text-muted">
                  {{ user.id }}
                </div>
              </div>
              <div class="text-muted">
                <span v-if="user.brute_force > 0">
                  {{ user.brute_force }} {{ $t("access.dashboard.bruteForce") }}
                </span>
                <span
                  v-if="user.brute_force > 0 && (user.unusual_behavior > 0 || user.impossible_travel > 0)"
                  class="mx-2">
                  &middot;
                </span>
                <span v-if="user.unusual_behavior > 0">
                  {{ user.unusual_behavior }} {{ $t("access.dashboard.unusualBehavior") }}
                </span>
                <span
                  v-if="user.unusual_behavior > 0 && user.impossible_travel > 0"
                  class="mx-2">
                  &middot;
                </span>
                <span v-if="user.impossible_travel > 0">
                  {{ user.impossible_travel }} {{ $t("access.dashboard.impossibleTravel") }}
                </span>
              </div>
            </div>
            <div class="d-flex flex-column align-self-center">
              <RiskScore
                :score="Math.round(user.avg_risk_score.value)"
                :change="Math.round(user.change)"
                :invert-change="true"
              />
            </div>
          </RouterLink>
        </BListGroup>
      </BCard>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import {
  BListGroup, BCard, BSpinner,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { riskiestUsersQuery } from './api/DashboardAPI';
import { getEventLogs } from '../Activity/api/ActivityAPI';
import RiskScore from '../Shared/RiskScore';
import AccessAttempts from '../Charts/AccessAttempts';
import DateRangePicker from '../Shared/DateRangePicker';
import { getPercentChange, getPrevDateRange } from '../Shared/utils/util-functions';
import store from '@/store';

export default {
  name: 'Dashboard',
  components: {
    FrHeader,
    BListGroup,
    BCard,
    RiskScore,
    AccessAttempts,
    DateRangePicker,
    BSpinner,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      riskyUsers: [],
      loading: {
        normalAccess: true,
        riskyAccess: true,
        riskiestUsers: true,
      },
    };
  },
  computed: {
    ...mapGetters({
      userDetails: 'UserStore/userDetails',
    }),
    dateRange() {
      return store.state.Dashboard.dates;
    },
    title() {
      let greeting = '';
      if (dayjs().hour() < 12) {
        greeting = 'Good Morning';
      } else if (dayjs().hour() < 17) {
        greeting = 'Good Afternoon';
      } else {
        greeting = 'Good Evening';
      }
      return `${greeting} ${this.userDetails.name}!`;
    },
  },
  mounted() {
    this.getRiskiestUsers();
  },
  watch: {
    dateRange() {
      this.getRiskiestUsers();
    },
  },
  methods: {
    setLoading(key, value) {
      const d = { ...this.loading };
      d[key] = value;
      this.loading = d;
    },
    getRiskiestUsers() {
      const prevDateRange = getPrevDateRange(this.dateRange);
      this.setLoading('riskiestUsers', true);

      Promise.all([getEventLogs(riskiestUsersQuery(this.dateRange)), getEventLogs(riskiestUsersQuery(prevDateRange))])
        .then((responses) => {
          const currTimePeriod = responses[0].aggregations?.users?.buckets || [];
          const prevTimePeriod = responses[1].aggregations?.users?.buckets || [];
          this.riskyUsers = currTimePeriod.sort((a, b) => b.avg_risk_score?.value - a.avg_risk_score?.value).map((el) => {
            const prev = prevTimePeriod.find((prevEl) => prevEl.key === el.key);

            return {
              ...el,
              prev,
              change: getPercentChange(el.avg_risk_score.value, prev?.avg_risk_score?.value || 0),
              name: el.key.substring(0, 8),
              id: `${el.key.substring(9, 16)}.${el.key.substring(14, 20)}`,
              userId: el.key,
            };
          });
          this.setLoading('riskiestUsers', false);
        });
    },
  },
};
</script>

<style lang="scss">
  .dashboard {
    .list-group-item {
      text-decoration: none;
      color: inherit;

      &:hover {
        background: $gray-100;
      }
    }

    .risk-score-value {
      margin-bottom: 0.25rem;
    }

    .access-attempts {
      h2 {
        font-size: 2rem;
      }
    }
  }
</style>
