<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="user-detail d-flex flex-column">
    <div class="d-flex flex-row justify-content-between border-bottom p-4">
      <div>
        <BButton
          variant="link"
          @click="handleNavBack"
          class="close back-link">
          <i class="material-icons material-icons-outlined md-24">
            west
          </i>
        </BButton>
      </div>
      <h1 class="m-0 font-weight-normal text-center h3">
        User Detail
      </h1>
      <div>
        <BButton
          variant="link"
          aria-label="Close"
          @click="handleNavBack"
          class="close">
          ×
        </BButton>
      </div>
    </div>
    <div class="d-flex flex-row flex-grow-1">
      <div class="user-detail-about flex-grow-1 border-right pt-5 px-4 pb-4">
        <div class="d-flex flex-column align-center text-center">
          <img
            :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            class="align-self-center"
            alt="Avatar"
            width="60"
            height="60">

          <h1 class="mt-4 mb-1 h2">
            Carl Smith
          </h1>
          <p class="text-muted mb-4">
            carl.smith
          </p>
          <div class="border p-4">
            <span v-if="averageRiskScore === null">
              —
            </span>
            <span v-else-if="averageRiskScore > -1">
              <RiskScore
                :score="parseFloat(averageRiskScore.toFixed(2))"
              />
            </span>
            <span v-else>
              <FrSpinner size="sm" />
            </span>
          </div>
          <div class="text-left mt-4">
            <h5 class="mb-4">
              Details
            </h5>
            <p class="text-muted mb-2">
              Name
            </p>
            <p class="text-dark mb-4">
              Carl Smith
            </p>
            <p class="text-muted mb-2">
              Username
            </p>
            <p class="text-dark mb-4">
              carl.smith
            </p>
            <p class="text-muted mb-2">
              Email
            </p>
            <p class="text-dark mb-4">
              carl.smith@example.com
            </p>
          </div>
        </div>
      </div>
      <div class="flex-grow-1 position-relative">
        <BTabs>
          <BTab
            title="Trends"
          >
            <UserDetailTrends
              :user-id="id"
              :date-range="dateRange"
              @handleDateChange="handleDateChange"
            />
          </BTab>
          <BTab
            title="Activity"
          >
            <Activity
              :user-id="id"
              :show-access-results="true"
            />
          </BTab>
          <BTab
            title="Details"
          />
        </BTabs>
      </div>
    </div>
  </div>
</template>

<script>
import { BButton, BTabs, BTab } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { defaultDateRange } from '@forgerock/platform-shared/src/components/DateRangePicker/utility';
import RiskScore from '../Shared/RiskScore';
import { getEventLogs } from '../Activity/api/ActivityAPI';
import Activity from '../Activity';
import averageRiskScoreQuery from './api/UserDetailAPI';

export default {
  name: 'UserDetail',
  props: {
    id: {
      type: String,
      default: 'id',
    },
  },
  data() {
    return {
      isLoading: true,
      isError: false,
      averageRiskScore: -1,
      events: [],
      filter: {},
      dateRange: defaultDateRange().dates,
    };
  },
  components: {
    BButton,
    BTabs,
    BTab,
    RiskScore,
    FrSpinner,
    Activity,
  },
  watch: {
    //   dateRange: {
    //       deep: true,
    //       handler() {
    //           this.fetchAverageRiskScore();
    //       }
    //   }
  },
  mounted() {
    if (this.id) {
      // this.fetchData();
      this.fetchAverageRiskScore();
    } else {
      this.isError = true;
    }
  },
  methods: {
    handleNavBack() {
      this.$router.go(-1);
    },
    handleDateChange(newDates) {
      this.dateRange = newDates;
    },
    // fetchData() {
    //     this.isLoading = true;
    //     // const param = {
    //     //     sort: [
    //     //         {
    //     //             timestamp: {
    //     //                 order: "desc",
    //     //             },
    //     //         },
    //     //     ],
    //     //     size: 10,
    //     //     track_total_hits: true,
    //     //     query: {
    //     //         bool: {
    //     //             must: [
    //     //                 {
    //     //                     term: {
    //     //                         "userId.keyword": this.id,
    //     //                     }
    //     //                 },
    //     //             ],
    //     //         },
    //     //     },
    //     // };
    //     const param = {
    //         sort: [
    //             {
    //                 timestamp: {
    //                     order: "desc",
    //                 },
    //             },
    //         ],
    //         size: 10,
    //         query: {
    //             bool: {
    //                 must: [
    //                     {
    //                         term: {
    //                             "userId.keyword": this.id,
    //                         }
    //                     },
    //                     {
    //                         range: {
    //                             timestamp: {
    //                                 gte: dayjs().subtract(7, 'day'),
    //                             },
    //                         },
    //                     }
    //                 ],
    //             },
    //         },
    //         aggs: {
    //             risk_score_over_time: {
    //                 date_histogram: {
    //                     field: "timestamp",
    //                     calendar_interval: "day",
    //                 },
    //                 aggs: {
    //                     avg_value: {
    //                         avg: {
    //                             field: "risk.ensemble_model.score",
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     };
    //     getEventLogs(param)
    //         .then((response) => {
    //             // this.events = response.hits.hits.map((data) =>
    //             //     apiToInternalEvent(data)
    //             // );

    //             console.log(response.aggregations.risk_score_over_time.buckets.filter(el => !!el.avg_value.value))

    //             this.isLoading = false;
    //         })
    //         .catch((e) => {
    //             this.isLoading = false;
    //         });
    // },
    fetchAverageRiskScore() {
      const paramAvgOverall = averageRiskScoreQuery(this.id);
      this.averageRiskScore = -1;
      getEventLogs(paramAvgOverall)
        .then((response) => {
          // this.events = response.hits.hits.map((data) =>
          //     apiToInternalEvent(data)
          // );

          this.averageRiskScore = response.aggregations?.avg_risk_score?.value;
        })
        .catch(() => {
          // TODO
        });
    },
  },
};
</script>

<style lang="scss">
  /* stylelint-disable */
  .user-detail {
    background: $white;
    height: 100vh;

    &-about {
      max-width: 420px;

      .risk-score {
        display: flex;
        flex-direction: row;
        justify-content: center;

        &-value {
          margin-right: 0.5rem;
        }
      }
    }

    .nav-tabs {
      .nav-link {
        padding: 1.5rem;
        color: var(--secondary);

        &,
        &.active,
        &:hover {
          margin-bottom: 0;
          background: rgba(0, 0, 0, 0);
          border: none;
        }

        &.active {
          color: var(--blue);
          border-bottom: 3px solid var(--blue);
        }
      }
    }

    .event-log {
      height: auto;
    }

    .event-log-container {
      max-width: none;
      overflow-y: auto;
      height: calc(100vh - 9.75rem);
    }

    .activity {
      &-filters-user-detail {
        margin-top: -4px;
        right: 2rem;
        top: 1rem;
      }
    }
  }
</style>
