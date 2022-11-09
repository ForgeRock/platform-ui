<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="$t('common.filters')"
    v-model="show"
    @hidden="modalHidden"
    @ok="() => saveFilters()"
    size="lg"
    centered
    no-close-on-backdrop
  >
    <div class="d-flex flex-row justify-content-between align-center mb-3">
      <span class="text-dark font-weight-bold">
        {{ $t("autoAccess.access.filters.sections.attribute") }}
      </span>
      <BButton
        variant="link"
        class="close"
        @click="addTempFilter"
      >
        <span class="material-icons-outlined">
          add
        </span>
      </BButton>
    </div>
    <div class="filters-features">
      <div
        v-for="filter in tempFilters"
        :key="filter.id"
      >
        <FilterRow
          :filter="filter"
          @update="(newFilter) => updateFilter({...newFilter, id: filter.id})"
          @remove="() => removeTempFilter(filter.id)"
        />
      </div>
    </div>
    <div class="d-flex flex-row justify-content-between align-center mb-3">
      <span class="text-dark font-weight-bold">
        {{ $t("autoAccess.access.filters.sections.riskReason") }}
      </span>
    </div>
    <div class="mt-3">
      <ReasonFilter
        v-model="tempReasons"
        @update="updateReasons"
      />
    </div>
    <template #modal-footer="{ ok }">
      <div class="d-flex flex-row justify-content-between w-100">
        <BButton
          size="md"
          variant="link"
          style="margin-left: -1rem;"
          @click="resetFilters">
          {{ $t("common.reset") }}
        </BButton>
        <BButton
          size="md"
          variant="primary"
          @click="ok()">
          {{ $t("autoAccess.access.activity.apply") }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton } from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import FilterRow from './FilterRow';
import ReasonFilter from './ReasonFilter';

export default {
  name: 'Filters',
  components: {
    BModal,
    BButton,
    FilterRow,
    ReasonFilter,
  },
  props: {
    showModal: {
      type: Boolean,
    },
    filterObject: {
      default: () => {},
      type: Object,
    },
  },
  data() {
    return {
      show: false,
      tempReasons: [],
      tempFilters: [],
    };
  },
  watch: {
    showModal: {
      immediate: true,
      handler(newValue) {
        this.show = newValue;
        if (newValue) {
          this.tempFilters = this.getInitialFilters();
          this.tempReasons = this.filterObject.reasons;
        }
      },
    },
  },
  methods: {
    modalHidden() {
      this.tempReasons = [];
      this.tempFilters = [];
      this.$emit('hidden');
    },
    getInitialFilters() {
      const filters = cloneDeep(this.filterObject.features)
        .filter((f) => f.key && f.value.length > 0);

      if (filters.length === 0) {
        filters.push(
          this.getTempFilter(),
        );
      }
      return filters;
    },
    getTempFilter() {
      return {
        key: '',
        value: [],
        id: uuidv4(),
      };
    },
    addTempFilter() {
      this.tempFilters.push(this.getTempFilter());
    },
    removeTempFilter(id) {
      const filters = this.tempFilters.filter((f) => f.id !== id);

      this.tempFilters = filters;

      if (this.tempFilters.length === 0) {
        this.addTempFilter();
      }
    },
    updateFilter(filter) {
      this.tempFilters.find((f, i, arr) => {
        if (f.id === filter.id) {
          if (filter.value.findIndex((filterValue) => !filterValue) === -1) {
            arr[i] = filter;
          }
        }
        return arr;
      });
    },
    updateReasons(value) {
      this.tempReasons = value;
    },
    saveFilters() {
      this.$emit('ok', this.tempFilters.filter((f) => f.key && f.value.length > 0), this.tempReasons);
    },
    resetFilters() {
      this.tempReasons = [];
      this.tempFilters = [
        this.getTempFilter(),
      ];
    },
  },
};
</script>
<style lang="scss">
  .filters-features {
    ul {
      max-height: 30vh;
      overflow: auto;
    }

    .dropdown-toggle {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  }
</style>
