<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <!-- Radio buttons for selecting filters or categories, only visible if categories props exists -->
    <BFormGroup
      v-if="categories.length"
      v-slot="{ ariaDescribedBy }"
      class="filter-type-radio"
    >
      <BFormRadioGroup
        v-model="filterTypeSelected"
        :aria-describedby="ariaDescribedBy"
        :options="filterTypeOptions"
        button-variant="outline-secondary"
        buttons />
    </BFormGroup>

    <!-- Filter select dropdown and clear button -->
    <template v-if="filterTypeSelected === 'filters'">
      <FrField
        v-model="pendingFilters"
        :label="this.$t(`${labelPath}.labelFiltersDropdown`)"
        :options="filters"
        class="mb-4"
        name="filter-list"
        type="multiselect"
      />
      <BButton
        class="p-0"
        variant="link"
        @click="clearFilters"
      >
        {{ this.$t(`${labelPath}.labelFiltersClear`) }}
      </BButton>
    </template>

    <!-- Categories select dropdown and clear button -->
    <template v-if="filterTypeSelected === 'categories'">
      <FrField
        v-model="pendingCategories"
        :label="this.$t(`${labelPath}.labelCategoriesDropdown`)"
        :options="categories"
        class="mb-4"
        name="categories-list"
        type="multiselect"
      />
      <BButton
        class="p-0"
        variant="link"
        @click="clearCategories"
      >
        {{ this.$t(`${labelPath}.labelCategoriesClear`) }}
      </BButton>
    </template>
  </div>
</template>

<script>
import {
  BButton,
  BFormRadioGroup,
  BFormGroup,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { isEqual } from 'lodash';

export default {
  name: 'FilterComponent',
  components: {
    BButton,
    BFormRadioGroup,
    BFormGroup,
    FrField,
  },
  data() {
    return {
      filterTypeSelected: 'filters',
      filterTypeOptions: [
        { text: this.$t(`${this.labelPath}.labelFiltersButton`), value: 'filters' },
        { text: this.$t(`${this.labelPath}.labelCategoriesButton`), value: 'categories' },
      ],
      pendingCategories: [],
      pendingFilters: [],
      searchFilter: '',
    };
  },
  props: {
    /**
     * The list of categories to be selected in the dropdown menu
     * @type {Array<string>}
     */
    activeCategories: {
      default: () => [],
      type: Array,
    },
    /**
     * The list of filters to be selected in the dropdown menu
     * @type {Array<string>}
     */
    activeFilters: {
      default: () => [],
      type: Array,
    },
    /**
     * The list of categories to be available in the dropdown menu. When this value exists and has data,
     * the button selector will render allowing the user to select between filters and categories.
     * @type {Array<string>}
     */
    categories: {
      default: () => [],
      type: Array,
    },
    /**
     * The list of filters to be available in the dropdown menu.
     * This field is REQUIRED.
     * @type {(Array<string> | Array<object>)}
     */
    filters: {
      required: true,
      type: Array,
    },
    /**
     *
     *
     */
    labelPath: {
      default: 'filterModal',
      type: String,
    },
  },
  methods: {
    /**
     * Resets the pending category and filter arrays back to an empty array
     */
    clearCategories() {
      this.pendingCategories = [];
      this.pendingFilters = [];
    },
    /**
     * Resets just the pending filter array back to an empty array
     */
    clearFilters() {
      this.pendingFilters = [];
    },
    /**
     * Sets the pending filters to contain the values that are contained within the selected categories
     */
    filterCategories() {
      this.selectCategoryFilter();
      if (this.pendingCategories.length) {
        this.pendingFilters = [];
        this.pendingCategories.forEach((category) => {
          this.filters.forEach((filter) => {
            if (filter.categories.includes(category) && !this.pendingFilters.includes(filter.value)) {
              this.pendingFilters.push(filter.value);
            }
          });
        });
      }
    },
    /**
     * Tells the modal that it should be showing the category selection items
     */
    selectCategoryFilter() {
      this.categoriesSelected = true;
    },
    /**
     * Tells the modal that it should be showing the filter selection items
     */
    selectDefaultFilter() {
      this.categoriesSelected = false;
    },
  },
  computed: {
    /**
     * Checks array lengths to determine if all filters are selected
     * @returns {boolean}
     */
    allSelected() {
      return this.pendingFilters.length === this.filters.length;
    },
  },
  mounted() {
    this.pendingCategories = [...this.activeCategories];
    setTimeout(() => {
      this.pendingFilters = [...this.activeFilters];
    });
  },
  watch: {
    pendingCategories(newVal) {
      if (newVal.length) { // We have new categories so we must parse out the filters
        this.filterCategories();
      } else if (this.categoriesSelected) { // We have no categories so we need to clear out the filters
        this.pendingFilters = [];
      }
    },
    pendingFilters(newVal, oldVal) {
      this.$emit('update', newVal, this.pendingCategories); // We have new filters so we will emit the filters and categories
      if (newVal.length && !isEqual(newVal, oldVal) && !this.categoriesSelected) {
        this.pendingCategories = []; // We have a new set of filters from the filters dropdown (not the categories dropdown) so we will clear out the categories
      }
    },
  },
};
</script>
