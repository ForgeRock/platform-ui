<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="container-fluid">
    <div class="my-5">
      <div class="d-flex align-items-center">
        <h1 class="text-left w-50 h4">
          {{ userId }}
        </h1>
        <div class="w-50 d-flex justify-content-end">
          <FrDatepicker
            class="mr-2 date-field"
            :placeholder="$t('access.dashboard.startDate')"
            v-model="startDate"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }" />
          <FrDatepicker
            class="date-field"
            :placeholder="$t('access.dashboard.endDate')"
            v-model="endDate"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }" />
        </div>
      </div>
      <div class="mt-2">
        <FrSpinner
          class="my-2"
          v-if="isLoading" />
        <BCard
          v-else
          no-body
          bg-variant="light">
          <BTabs
            v-model="tabIndex"
            card>
            <BTab
              :title="$t('access.identities.analysis')"
              lazy>
              <Analysis
                :score="score"
                :id="userId"
                :date-range="{ startDate, endDate }" />
            </BTab>
            <BTab
              :title="$t('access.identities.features')"
              :date-range="{ startDate, endDate }"
              lazy>
              <div class="position-relative">
                <Features
                  :id="userId"
                  :date-range="{ startDate, endDate }" />
              </div>
            </BTab>
          </BTabs>
        </BCard>
      </div>
    </div>
  </div>
</template>

<script>
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import dayjs from 'dayjs';
import { BTab, BTabs, BCard } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import Features from './Features';
import Analysis from './Analysis';

export default {
  name: 'Identities',
  components: {
    FrDatepicker,
    BTab,
    BTabs,
    Analysis,
    Features,
    BCard,
    FrSpinner,
  },
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
  data() {
    return {
      userId: this.$route.params.id,
      startDate: dayjs()
        .subtract(1, 'year')
        .startOf('year')
        .format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      tabIndex: 0,
      score: { vae: 1, ae: 1, ensemble: 1 },
      isLoading: false,
    };
  },
  mounted() {
    this.setBreadcrumb('/dashboard', this.$t('access.sideMenu.dashboard'));
    this.isLoading = true;
    // fetchRiskData()
    //   .then((data) => {
    //     const riskConfig = data?.hits?.hits[0]._source.riskConfig;
    //     this.isLoading = false;
    //     if (riskConfig) {
    //       const vae = riskConfig["vae_riskThreshold"] ? riskConfig["vae_riskThreshold"] : 10;
    //       const ae = riskConfig["autoencoder_riskThreshold"] ? riskConfig["autoencoder_riskThreshold"] : 10;
    //       const ensemble = 0.6 * vae + 0.4 * ae;
    //       this.score = { vae, ae, ensemble };
    //     }
    //   })
    //   .catch((e) => {
    //     this.isLoading = false;
    //   });
  },
};
</script>

<style lang="scss" scoped>
.date-field {
  width: 250px;
}
</style>
