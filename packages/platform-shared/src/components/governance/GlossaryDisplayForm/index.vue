<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BRow>
    <template
      v-for="(prop, index) in glossary"
      :key="`prop-${index}`">
      <dt
        :data-testid="`prop-${index}`"
        class="col-lg-4">
        {{ prop.name }}
      </dt>
      <dd
        :data-testid="`prop-value-${index}`"
        class="col-lg-8 mb-4">
        {{ prop.value }}
      </dd>
    </template>
  </BRow>
</template>

<script>
import { BRow } from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'GlossaryDisplayForm',
  components: {
    BRow,
  },
  props: {
    glossarySchema: {
      type: Array,
      default: () => ([]),
    },
    glossaryValues: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      blankValueIndicator,
    };
  },
  computed: {
    glossary() {
      return this.glossarySchema.map((prop) => {
        let value = blankValueIndicator;
        if (this.glossaryValues[prop.name]) value = this.glossaryValues[prop.name];
        return {
          name: prop.displayName || prop.name,
          value,
        };
      });
    },
  },
};
</script>
