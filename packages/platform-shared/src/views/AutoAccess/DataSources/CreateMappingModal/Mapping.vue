<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex flex-row">
      <div class="w-50 p-3">
        <h5 class="mb-0">
          {{ "Data Source" }}
        </h5>
      </div>
      <div
        class="w-50 p-3 border-left"
        style="background: var(--light);">
        <h5 class="mb-0">
          {{ "Auto Access Feature" }}
        </h5>
      </div>
    </div>
    <div
      v-for="feature in features"
      :key="feature.key"
      class="d-flex flex-row border-top"
    >
      <div class="w-50 px-3 py-2">
        <FrField
          :field="mapping[feature.key]"
          v-if="!readOnly"
          @valueChange="(value) => handleValueChange(feature.key, value)"
        >
          <template v-slot:option="{ option }">
            {{ option.text }}
          </template>
          <template v-slot:singleLabel="{ option }">
            {{ option.text }}
          </template>
        </FrField>
        <div
          v-else
          class="py-2 d-flex align-items-center justify-content-between"
        >
          <div class="text-dark mr-2">
            {{ mapping[feature.key].value }}
          </div>
          <i class="material-icons-outlined">
            swap_horiz
          </i>
        </div>
      </div>
      <div
        class="w-50 p-3 border-left d-flex align-items-center"
        style="background: var(--light);">
        {{ feature.key }}
      </div>
    </div>
  </div>
</template>
<script>
import FrField from '../../Shared/Field';
import store from '@/store';

export default {
  name: 'Mapping',
  components: {
    FrField,
  },
  props: {
    dataSource: {
      type: Object,
    },
    mapping: {
      type: Object,
    },
    readOnly: {
      type: Boolean,
    },
  },
  data() {
    return {
      loading: false,
      options: [],
    };
  },
  computed: {
    features() {
      return store.state.DataSources.auth_properties;
    },
  },
  methods: {
    handleValueChange(key, value) {
      const newMap = {
        ...this.mapping,
        [key]: {
          ...this.mapping[key],
          value,
        },
      };
      this.$emit('updateMapping', newMap);
    },
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep
  .create-mapping-modal-mapping {
    .list-group-item-action {
      display: block;
      width: 100%;
      padding: 0.675rem 1.5rem;
      clear: both;
      font-weight: 400;
      color: #455469;
      text-align: inherit;
      white-space: nowrap;
      border: 0;

      &.active {
        color: #181b20;
        text-decoration: none;
        background-color: #e4f4fd;
      }
    }
  }
</style>
