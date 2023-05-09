<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="event-item p-4 border-bottom text-dark"
    @click="handleClick"
  >
    <div class="d-flex">
      <RiskScore
        class="mr-3"
        :score="risk"
        :small="true"
      />
      <div>{{ userName }}</div>
      <span class="mx-1">
        &middot;
      </span>
      <RelativeTime
        :timestamp="timestamp"
      />
    </div>
    <Explainability
      class="my-2"
      :reasons="explainability" />
    <div>
      <span v-if="cityCountry.length > 0">
        <span>
          {{ cityCountry }}
        </span>
        <span class="mx-1">
          &middot;
        </span>
      </span>
      <span>
        {{ os }}
      </span>
      <span class="mx-1">
        &middot;
      </span>
      <span>
        {{ userAgent }}
      </span>
    </div>
  </div>
</template>
<script>
import Explainability from '../../../Explainability';
import RelativeTime from '../../../Shared/RelativeTime';
import RiskScore from '../../../Shared/RiskScore';

export default {
  name: 'EventItem',
  components: {
    Explainability,
    RelativeTime,
    RiskScore,
  },
  props: {
    eventItemData: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    handleClick() {
      this.$emit('show-detail', this.eventItemData);
    },
  },
  computed: {
    cityCountry() {
      try {
        const { city, country } = this.eventItemData?.geoData;
        return `${city}, ${country}`;
      } catch {
        return '';
      }
    },
    explainability() {
      const { heuristicReasons, clusteringReasons, uebaReasons } = this.eventItemData;
      return [...heuristicReasons, ...clusteringReasons, ...uebaReasons];
    },
    os() {
      const { os, osVersion } = this.eventItemData;
      return `${os} ${osVersion}`;
    },
    risk() {
      return parseFloat(this.eventItemData.risk);
    },
    timestamp() {
      return this.eventItemData.timestamp;
    },
    userAgent() {
      return this.eventItemData.userAgentType;
    },
    userName() {
      return this.eventItemData.raw.username;
    },
  },
};
</script>
<style lang="scss" scoped>
.event-item {
  border-radius: 0;
  cursor: pointer;
  font-size: 0.875rem;
  margin-bottom: 0;

  &:hover {
    background: $gray-100;
  }

}
</style>
