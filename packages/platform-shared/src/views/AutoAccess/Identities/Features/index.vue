<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-wrap position-relative ">
    <FrSpinner
      class="dy-2 w-100"
      v-if="isLoading" />
    <FeatureCard
      v-else
      v-for="feature in logAttributes"
      :key="feature.id"
      :feature="feature"
      :feature-data="featuresData[feature.id].buckets" />
  </div>
</template>

<script>
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { getLogAttributesForUser } from '../../Dashboard/api/DashboardAPI';
import { logAttributes } from '../../Activity/api/ActivityAPI';
import FeatureCard from './feature-card';

export default {
  name: 'Features',
  components: {
    FeatureCard,
    FrSpinner,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    dateRange: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    dateRange: {
      immediate: true,
      handler() {
        this.isLoading = true;
        getLogAttributesForUser(this.id, this.dateRange)
          .then((data) => {
            this.featuresData = data.aggregations.log_attributes;
            this.isLoading = false;
          })
          .catch(() => {
            this.isLoading = false;
          });
      },
    },
  },
  data() {
    return {
      featuresData: undefined,
      logAttributes: [...logAttributes, { label: 'Component', id: 'component' }],
      isLoading: false,
    };
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>
