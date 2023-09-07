<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    id="sortBy"
    toggle-class="text-dark px-0 d-flex"
    variant="link">
    <template #button-content>
      <FrIcon
        class="mr-2 pt-02"
        name="sort" />
      <div :class="{ 'd-none d-lg-block': hideLabelsOnMobile }">
        <span class="font-weight-bold mr-1">
          {{ $t('governance.sortBy') }}:
        </span>
        {{ selectedSortFieldText }}
      </div>
    </template>
    <BDropdownText style="width: 250px;">
      <h2 class="h5 mt-3">
        {{ $t('governance.sortBy') }}
      </h2>
    </BDropdownText>
    <BDropdownForm>
      <FrField
        v-model="sortField"
        class="mb-2"
        name="sortField"
        type="select"
        :options="sortByOptions"
        @input="$emit('sort-field-change', $event)" />
      <FrField
        v-model="sortDirection"
        class="mb-3"
        name="sortDirection"
        type="select"
        :options="sortDirectionOptions"
        @input="$emit('sort-direction-change', $event)">
        <template
          v-for="slotName in ['singleLabel', 'option']"
          :key="slotName"
          #[slotName]="{ option }">
          <div :class="{ 'mb-1': slotName === 'singleLabel' }">
            <span class="mr-2">
              <FrIcon :name="option.value === 'asc' ? 'arrow_upward' : 'arrow_downward'" />
            </span>
            <span>
              {{ option.text }}
            </span>
          </div>
        </template>
      </FrField>
    </BDropdownForm>
  </BDropdown>
</template>

<script>
import {
  BDropdown,
  BDropdownForm,
  BDropdownText,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * Reusable dropdown containing two sort fields for the field to sort by
 * and the direction to sort by
 */
export default {
  name: 'SortDropdown',
  components: {
    BDropdown,
    BDropdownForm,
    BDropdownText,
    FrField,
    FrIcon,
  },
  props: {
    hideLabelsOnMobile: {
      type: Boolean,
      default: false,
    },
    selectedItem: {
      type: String,
      default: '',
    },
    sortByOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      sortDirection: 'desc',
      sortDirectionOptions: [
        {
          text: this.$t('common.ascending'),
          value: 'asc',
        },
        {
          text: this.$t('common.descending'),
          value: 'desc',
        },
      ],
      sortField: this.selectedItem,
    };
  },
  computed: {
    selectedSortFieldText() {
      return this.sortByOptions.find((option) => option.value === this.sortField)?.text || '';
    },
  },
  watch: {
    selectedItem(value) {
      if (value && this.sortField !== value) {
        this.sortField = value;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.pt-02 {
  padding-top: 0.2rem;
}

.h5 {
  font-weight: 600;
}

:deep(.multiselect .multiselect__option--selected:after) {
  content: 'check';
  font-family: 'Material Icons Outlined', Serif;
  font-size: 15px;
  color: $green !important;
  padding-top: 0.25rem;
  background: initial;
  padding-left: 10px;
}

:deep(.btn-link:hover) {
  text-decoration: none;

  div {
    text-decoration: underline;
  }
}
</style>
