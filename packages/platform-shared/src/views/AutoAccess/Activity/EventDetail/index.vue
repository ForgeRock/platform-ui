<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="$t('autoAccess.access.activity.detailModal.header')"
    v-model="show"
    size="lg"
    @hidden="$emit('hidden')"
  >
    <div
      v-if="data"
      class="d-flex flex-row">
      <div class="col-8 p-0">
        <div class="d-flex flex-row w-100 mb-5">
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.eventId") }}
            </div>
            <div class="text-dark">
              {{ data.eventId }}
            </div>
          </div>
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.user") }}
            </div>
            <div class="text-dark">
              <!-- TODO uncomment to link to user detail view -->
              <!-- <RouterLink
                                :to="`user-detail/${data.userId}`"
                                > -->
              <div class="d-flex flex-row">
                <img
                  :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                  class="align-self-center"
                  alt="Avatar"
                  width="34"
                  height="34">
                <div class="ml-3">
                  <div>
                    {{ data.raw.username }}
                  </div>
                </div>
              </div>
              <!-- TODO uncomment to link to user detail view -->
              <!-- </RouterLink> -->
            </div>
          </div>
        </div>
        <div class="d-flex flex-row w-100 mb-5">
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.time") }}
            </div>
            <div class="text-dark">
              <div class="text-capitalize">
                {{ data.weekday }} {{ data.dayparting }}
              </div>
              <div class="mt-1">
                {{ formatTime(data.timestamp, data.timezone) }}
              </div>
            </div>
          </div>
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.location") }}
            </div>
            <div
              class="text-dark text-capitalize"
              v-if="data.geoData"
            >
              <div>
                {{ data.geoData.city }}
              </div>
              <div class="mt-1">
                {{ data.geoData.country }}
              </div>
            </div>
            <div
              class="text-dark text-capitalize"
              v-else>
              —
            </div>
          </div>
        </div>

        <div class="d-flex flex-row w-100 mb-5">
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.device") }}
            </div>
            <div class="text-dark">
              <div>
                {{ data.deviceType }}
              </div>
              <div class="mt-1">
                {{ data.device }}
              </div>
            </div>
          </div>
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.userAgent") }}
            </div>
            <div class="text-dark">
              <div>
                {{ data.os }} {{ data.osVersion }}
              </div>
              <div class="mt-1">
                {{ data.userAgentType }}
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex w-100 mb-5">
          <div>
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.ipAddress") }}
            </div>
            <div class="mt-1 text-dark">
              {{ data.ipAddress }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-4 pr-0 d-flex flex-column">
        <div class="border p-2">
          <div class="d-flex flex-row justify-content-between">
            <div class="text-dark font-weight-bold">
              {{ $t("autoAccess.access.activity.riskScore") }}
            </div>
            <RiskScore
              :score="parseFloat(data.risk)"
            />
          </div>

          <div v-if="data.riskScoreData.is_risky_event">
            <Explainability
              :reasons="explainability"
            />
          </div>
        </div>

        <MiniMap
          :authentications="miniMapAuths"
        />
      </div>
    </div>
    <div
      class="mt-1 overflow-auto"
      style="margin-bottom: -1rem;">
      <div class="text-dark font-weight-bold border-bottom py-2">
        {{ $t("autoAccess.access.activity.detailModal.previousAuthentications") }}
      </div>
      <div
        v-if="isLoading"
        class="d-flex justify-content-center align-items-center">
        <FrSpinner
          class="py-5"
          size="md"
        />
      </div>
      <div
        v-else-if="previousAuths.length > 0"
        class="d-flex flex-row text-dark py-3"
        v-for="(auth, i) in previousAuths"
        :key="auth.eventId"
        :class="{'border-bottom': i < previousAuths.length - 1}"
      >
        <div style="flex: 0 0 52px;">
          <RiskScore
            :small="true"
            :score="parseFloat(auth.risk)"
          />
        </div>
        <div
          style="flex: 0 0 190px; margin-top: -0.5rem;"
          class="pr-3"
        >
          <Explainability
            :reasons="explainability"
          />
        </div>
        <div
          style="flexbasis: 200px;"
          class="pr-3">
          <div class="text-capitalize">
            {{ auth.weekday }} {{ auth.dayparting }}
          </div>
          <div class="mt-1">
            {{ formatTime(auth.timestamp, auth.timezone) }}
          </div>
        </div>
        <div
          style="flex: 1 1 20%;"
          class="pr-3">
          <div
            class="text-dark text-capitalize"
            v-if="auth.geoData"
          >
            <div>
              {{ auth.geoData.city }}
            </div>
            <div class="mt-1">
              {{ auth.geoData.country }}
            </div>
          </div>
          <div
            class="text-dark text-capitalize"
            v-else>
            —
          </div>
        </div>
        <div
          style="flex: 1 1 12%;"
          class="pr-3">
          <div>
            {{ auth.deviceType }}
          </div>
          <div class="mt-1">
            {{ auth.device }}
          </div>
        </div>
        <div style="flex: 1 1 15%;">
          <div>
            {{ auth.os }} {{ auth.osVersion }}
          </div>
          <div class="mt-1">
            {{ auth.userAgentType }}
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-dark text-center py-4"
      >
        No previous authentications
      </div>
    </div>
    <template #modal-footer="{ ok }">
      <BButton
        size="md"
        variant="primary"
        @click="ok()">
        {{ $t("autoAccess.access.activity.detailModal.doneBtn") }}
      </BButton>
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import RiskScore from '../../Shared/RiskScore';
import Explainability from '../../Explainability';
import { getEventLogs, apiToInternalEvent } from '../api/ActivityAPI';
import { getBrowserLocale } from '../../Shared/utils/util-functions';
import MiniMap from './MiniMap';

export default {
  name: 'EventDetail',
  components: {
    BModal,
    BButton,
    FrSpinner,
    RiskScore,
    Explainability,
    MiniMap,
  },
  props: {
    data: {
      default: () => ({}),
      type: Object,
    },
  },
  data() {
    return {
      show: false,
      isLoading: true,
      previousAuths: [],
    };
  },
  watch: {
    data(newValue) {
      this.show = newValue !== null;
      if (newValue) {
        this.fetchData();
      }
    },
  },
  computed: {
    explainability() {
      if (!this.data) {
        return [];
      }
      const { heuristicReasons, clusteringReasons, uebaReasons } = this.data;
      return [...heuristicReasons, ...clusteringReasons, ...uebaReasons];
    },
    miniMapAuths() {
      return [this.data, ...this.previousAuths].filter((auth) => auth.geoData?.lat && auth.geoData?.longitude);
    },
  },
  methods: {
    fetchData() {
      this.isLoading = true;

      const param = {
        sort: [
          {
            'predictionResult.features.timestamp': {
              order: 'desc',
            },
          },
        ],
        size: 5,
        track_total_hits: true,
        query: {
          bool: {
            must: [
              {
                term: {
                  'predictionResult.features.userId.keyword': this.data.userId,
                },
              },
              {
                range: {
                  'predictionResult.features.timestamp': {
                    lte: this.data.timestamp,
                  },
                },
              },
              {
                term: {
                  'predictionResult.risk_score_data.is_risky_event': true,
                },
              },
            ],
            must_not: [
              {
                term: {
                  'predictionResult.features.eventId.keyword': this.data.eventId,
                },
              },
            ],
          },
        },
      };
      getEventLogs(param)
        .then((response) => {
          this.previousAuths = response.data.hits.hits.map((data) => apiToInternalEvent(data)).filter((ev) => this.data.id !== ev.id);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    formatTime(time, timezone) {
      return new Date(time).toLocaleString(
        getBrowserLocale(),
        {
          timeZone: timezone,
          timeZoneName: 'short',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      );
    },
  },
};
</script>
