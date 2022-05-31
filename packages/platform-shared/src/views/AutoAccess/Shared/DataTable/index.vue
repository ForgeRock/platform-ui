<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-datatable">
    <!-- @slot Toolbar above the datatable for buttons, search, etc. -->
    <slot name="toolbar" />
    <BTable
      class="table-responsive"
      responsive
      outline
      :hover="hover"
      v-bind="$attrs"
      :per-page="perPage"
      :current-page="currentPage"
      v-on="$listeners">
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <!-- @slot Custom cell slot. -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>

      <template #head(checkbox)="data">
        <span
          v-if="isCustomLabel('checkbox', data.label)">
          {{ data.label }}
        </span>
        <BFormCheckbox
          v-else
          id="checkbox-all"
          name="checkbox-all"
          v-model="allSelected"
          @change="toggleAll"
        />
      </template>

      <template #cell(checkbox)="data">
        <BFormCheckbox
          :id="`checkbox-${data.index}`"
          :name="`checkbox-${data.index}`"
          v-model="selected"
          :value="data.index"
        />
      </template>

      <template #head(dropdown)="data">
        <span
          v-if="isCustomLabel('dropdown', data.label)">
          {{ data.label }}
        </span>
      </template>

      <template #cell(dropdown)="data">
        <BDropdown
          variant="link"
          no-caret
          right
          toggle-class="text-decoration-none">
          <template #button-content>
            <i class="material-icons-outlined text-muted">
              more_horiz
            </i>
          </template>
          <div
            v-for="(lineItem, index) in data.item.dropdown"
            :key="index">
            <BDropdownItem @click="lineItem.action">
              <i
                class="material-icons-outlined mr-3"
                aria-hidden="true">
                {{ lineItem.icon }}
              </i> {{ lineItem.text }}
            </BDropdownItem>
            <hr
              v-if="index !== data.item.dropdown.length - 1"
              class="m-0">
          </div>
        </BDropdown>
      </template>
      <template #cell(material_icon)="data">
        <i class="material-icons-outlined">
          {{ data.item.material_icon }}
        </i>
      </template>
    </BTable>
    <div
      v-if="pagination && multiplePages"
      class="border-top pt-3">
      <div class="pagination justify-content-center">
        <BPagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="my-table">
          <template v-slot:first-text>
            <i class="material-icons material-icons-outlined md-24">
              first_page
            </i>
          </template>
          <template v-slot:prev-text>
            <i class="material-icons material-icons-outlined md-24">
              chevron_left
            </i>
          </template>
          <template v-slot:next-text>
            <i class="material-icons material-icons-outlined md-24">
              chevron_right
            </i>
          </template>
          <template v-slot:last-text>
            <i class="material-icons material-icons-outlined md-24">
              last_page
            </i>
          </template>
        </BPagination>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BDropdown,
  BDropdownItem,
  BFormCheckbox,
  BPagination,
  BTable,
} from 'bootstrap-vue';

/**
 * Extends out vue's inbuilt data table. Adds toolbar, pagination, custom cells, and html cells.
 */
export default {
  name: 'DataTable',
  components: {
    BDropdown,
    BDropdownItem,
    BFormCheckbox,
    BPagination,
    BTable,
  },
  props: {
    /**
     * Initial value for bootstrap table currentPage.
     */
    initialPage: {
      type: Number,
      default: 1,
    },
    /**
     * Initial value for bootstrap table perPage.
     */
    initialPerPage: {
      type: Number,
      default: 10,
    },
    /**
     * Initial value for checkbox rows selected.
     */
    initialSelected: {
      type: Array,
      default: () => [],
    },
    /**
     * Boolean to show pagination.
     */
    pagination: {
      type: Boolean,
      default: true,
    },
    /**
     * Boolean to enable hover highlighting on table rows.
     */
    hover: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      allSelected: this.initialSelected.length === this.pageRows,
      currentPage: this.initialPage,
      perPage: this.pagination ? this.initialPerPage : 0,
      selected: this.initialSelected,
      items: this.$attrs.items,
    };
  },
  computed: {
    pageRows() {
      return this.totalRows >= this.currentPage * this.perPage
        ? this.perPage
        : this.totalRows % this.perPage;
    },
    totalRows() {
      return this.items.length;
    },
    multiplePages() {
      return this.totalRows > this.perPage;
    },
  },
  methods: {
    emitSelected() {
      const start = (this.currentPage - 1) * this.perPage;
      const selectedArray = this.selected.map((tableIndex) => ({ ...this.items[+tableIndex + start], tableIndex: +tableIndex }));
      /**
       * On change event for checkbox selection. Payload: array[indexOfSelected].
       *
       * @event update-selected
       * @property {array} selectedArray Array of selected table indexes.
       */
      this.$emit('update-selected', selectedArray);
    },
    isCustomLabel(headerKey, label) {
      return label.toLowerCase() !== headerKey.toLowerCase();
    },
    toggleAll(checked) {
      this.selected = checked ? [...Array(this.pageRows).keys()] : [];
    },
  },
  watch: {
    currentPage() {
      this.selected = [];
    },
    selected(newVal) {
      if (newVal.length === this.pageRows) {
        this.allSelected = true;
      } else {
        this.allSelected = false;
      }
      this.emitSelected();
    },
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep {
    .table {
      table-layout: auto !important;
    }
  }

  .fr-datatable {
    ::v-deep {
      .table-responsive {
        margin-bottom: 0;

        thead th {
          border-width: 0;
        }
      }

      .table {
        td {
          vertical-align: middle;
        }
      }
    }
  }
</style>
