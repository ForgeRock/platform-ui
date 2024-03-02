<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

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
      v-if="eventData"
      class="d-flex flex-row">
      <div class="col-8 p-0">
        <div class="d-flex flex-row w-100 mb-5">
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.eventId") }}
            </div>
            <div class="text-dark">
              {{ eventData.eventId }}
            </div>
          </div>
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.user") }}
            </div>
            <div class="text-dark">
              <div class="d-flex flex-row mb-2">
                <img
                  :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                  class="align-self-center"
                  alt="Avatar"
                  width="34"
                  height="34">
                <div class="ml-3">
                  <div>
                    {{ eventData.raw.username }}
                  </div>
                </div>
              </div>
              <BButton
                size="sm"
                variant="outline-primary"
                @click="$router.push({name: 'AutoAccessUserBehavior', params: { username: eventData.raw.username}})">
                <FrIcon
                  icon-class="mr-2"
                  name="insights">
                  {{ $t("autoAccess.access.activity.viewRecentBehavior") }}
                </FrIcon>
              </BButton>
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
                {{ eventData.weekday }} {{ eventData.dayparting }}
              </div>
              <div class="mt-1">
                {{ formatTime(eventData.timestamp, eventData.timezone) }}
              </div>
            </div>
          </div>
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.location") }}
            </div>
            <div
              class="text-dark text-capitalize"
              v-if="eventData.geoData"
            >
              <div>
                {{ eventData.geoData.city }}
              </div>
              <div class="mt-1">
                {{ eventData.geoData.country }}
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
                {{ eventData.deviceType }}
              </div>
              <div class="mt-1">
                {{ eventData.device }}
              </div>
            </div>
          </div>
          <div class="w-50">
            <div class="text-muted mb-2">
              {{ $t("autoAccess.access.activity.userAgent") }}
            </div>
            <div class="text-dark">
              <div>
                {{ eventData.os }} {{ eventData.osVersion }}
              </div>
              <div class="mt-1">
                {{ eventData.userAgentType }}
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
              {{ eventData.ipAddress }}
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
              :score="parseFloat(eventData.risk)"
            />
          </div>

          <div v-if="eventData.riskScoreData.is_risky_event">
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
      <template v-if="isLoading">
        <div

          class="d-flex justify-content-center align-items-center">
          <FrSpinner
            class="py-5"
            size="md"
          />
        </div>
      </template>
      <template v-else-if="previousAuths.length > 0">
        <div
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
      </template>
      <template v-else>
        <div class="text-dark text-center py-4">
          No previous authentications
        </div>
      </template>
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
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
    FrIcon,
    FrSpinner,
    RiskScore,
    Explainability,
    MiniMap,
  },
  props: {
    eventData: {
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
    eventData(newValue) {
      this.show = newValue !== null;
      if (newValue) {
        this.fetchData();
      }
    },
  },
  computed: {
    explainability() {
      if (!this.eventData) {
        return [];
      }
      const { heuristicReasons, clusteringReasons, uebaReasons } = this.eventData;
      return [...heuristicReasons, ...clusteringReasons, ...uebaReasons];
    },
    miniMapAuths() {
      return [this.eventData, ...this.previousAuths].filter((auth) => auth.geoData?.lat && auth.geoData?.longitude);
    },
  },
  methods: {
    fetchData() {
      this.isLoading = true;

      const param = {
        sort: [
          {
            'predictionResult.risk_score_data.risk_score': {
              order: 'desc',
            },
            'predictionResult.features.timestamp': {
              order: 'desc',
            },
            'predictionResult.features.userId.keyword': {
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
                  'predictionResult.features.userId.keyword': this.eventData.userId,
                },
              },
              {
                term: {
                  'predictionResult.risk_score_data.is_risky_event': true,
                },
              },
              {
                range: {
                  'predictionResult.features.timestamp': {
                    lte: this.eventData.timestamp,
                  },
                },
              },
            ],
            must_not: [
              {
                term: {
                  'predictionResult.features.eventId': this.eventData.eventId,
                },
              },
            ],
          },
        },
      };
      getEventLogs(param)
        .then((response) => {
          this.previousAuths = response.data.hits.hits.map((data) => apiToInternalEvent(data));
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
