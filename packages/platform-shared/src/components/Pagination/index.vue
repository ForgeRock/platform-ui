<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="['d-flex align-items-center px-4 py-3', alignClasses[datasetSize === DatasetSize.SMALL ? Position.CENTER : align], { 'border-top': !hideBorder }]"
  >
    <!-- Dropdown -->
    <BDropdown
      v-if="datasetSize !== DatasetSize.SMALL && !hidePageSizeSelector"
      data-testid="page_size-button"
      class="mr-1 pagination-dropdown"
      id="dropdown"
      toggle-class="btn btn-link text-dark border-0 toggle-dropdown-button"
      :boundary="boundary"
      :disabled="disabled"
      :text="totalRows > 0 ? $t('pagination.dropdown.text', { pageMin, pageMax, totalRows }) : $t('pagination.dropdown.textUnknownTotalRows', { pageMin, pageMax })"
    >
      <BDropdownItem
        v-for="(pageSize, index) in pageSizes"
        :data-testid="`page_size-${pageSize}`"
        :key="index"
        :active="pageSize === perPage"
        :disabled="pageSize === perPage"
        @click="pageSizeChanged(pageSize)"
      >
        {{ $t('pagination.dropdown.pageSize', { pageSize }) }}
      </BDropdownItem>
    </BDropdown>
    <!-- Pagination -->
    <BPagination
      class="m-0 pagination-buttons"
      id="pagination"
      tabindex="0"
      :aria-label="ariaLabel"
      :disabled="disabled"
      :ellipsis-class="['d-flex align-items-center', ellipsisClass]"
      :first-class="hideGoToFirstPageButton ? 'd-none': firstClass"
      :hide-ellipsis="datasetSize === DatasetSize.LARGE || hidePageNumbers || hideEllipsis"
      :label-first-page="labelFirstPage"
      :label-last-page="labelLastPage"
      :label-next-page="labelNextPage"
      :label-page="labelPage"
      :label-prev-page="labelPrevPage"
      :last-class="totalRows <= 0 || hideGoToLastPageButton ? 'd-none': lastClass"
      :limit="limit"
      :page-class="pageClasses"
      :per-page="perPage"
      :prev-class="prevClass"
      :total-rows="totalRows > 0 ? totalRows : totalRowsOnDemand"
      :value="value"
      @change="$emit('change', $event)"
      @input="$emit('input', $event)"
    >
      <template #first-text>
        <FrIcon
          data-testid="first_page-button"
          icon-class="md-24"
          name="first_page" />
      </template>
      <template #prev-text>
        <FrIcon
          data-testid="prev_page-button"
          icon-class="md-24"
          name="chevron_left" />
      </template>
      <template #next-text>
        <FrIcon
          data-testid="next_page-button"
          icon-class="md-24"
          name="chevron_right" />
      </template>
      <template #last-text>
        <FrIcon
          data-testid="last_page-button"
          icon-class="md-24"
          name="last_page" />
      </template>
    </BPagination>
  </div>
</template>

<script>
import { BDropdown, BDropdownItem, BPagination } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { Position, DatasetSize } from './types';
import i18n from '@/i18n';

/**
 * @description pagination component used to interact with data tables, it is composed by a dropdown menu with a list
 * of allowed page sizes for the table [10, 20, 50, 100] by default, when the pages size is changed the component
 * emits an on-page-size-change event with the new page size. Also is composed by the left and right arrows to change
 * the current page, when the page is changed the component emits an input event with the value of the new page.
 * The component supports all the properties for b-pagination component from Bootstrap Vue library
 * @tutorial https://bootstrap-vue.org/docs/components/pagination#component-reference
 *
 * @param {string}    align                     alignment to position the component, it could be left, center or right,
 *                                              right by default
 * @param {string}    ariaLabel                 Value to place in the 'aria-label' attribute of the pagination control,
 *                                              $t('pagination.label') by default
 * @param {string}    datasetSize               Changes the look and feel of the component for small or large datasets,
 *                                              posible values 'sm' for small and 'lg' for large, 'sm' by default
 * @param {string}    ellipsisClass             Class to apply to the 'ellipsis' placeholders, null by default
 * @param {string}    firstClass                Class to apply to the 'Go to first page' button, null by default
 * @param {boolean}   hideEllipsis              Do not show ellipsis buttons, false by default
 * @param {boolean}   hideGoToFirstPageButton   hides the go to first page button, hidden by default
 * @param {boolean}   hideGoToLastPageButton    hides the go to last page button, hidden by default
 * @param {boolean}   hidePageNumbers           hides go to page buttons, visible by default
 * @param {boolean}   hidePageSizeSelector      hides the page sizes dropdown, hidden by default
 * @param {string}    labelFirstPage            Value to place in the 'aria-label' attribute of the goto first page
 *                                              button, $t('pagination.gotoFirstPage') by default
 * @param {string}    labelLastPage             Value to place in the 'aria-label' attribute of the goto last page
 *                                              button, $t('pagination.gotoLastPage') by default
 * @param {string}    labelNextPage             Value to place in the 'aria-label' attribute of the goto next page
 *                                              button, $t('pagination.gotoNextPage') by default
 * @param {string}    labelPage                 Value to place in the 'aria-label' attribute of the goto page button.
 *                                              Page number will be prepended automatically, $t('pagination.gotoPage')
 *                                              by default
 * @param {string}    labelPrevPage             Value to place in the 'aria-label' attribute of the goto previous page
 *                                              button, $t('pagination.gotoPreviousPage') by default
 * @param {string}    lastClass                 Class to apply to the 'Go to last page' button, null by default
 * @param {boolean}   lastPage                  specifies if the current page (value) is the last page. It is mandatory
 *                                              to hide the ellipsis on the last page when is an on demand pagination
 *                                              that means the total number of rows is unknown
 * @param {number}    limit                     Maximum number of buttons to show (including ellipsis if shown, but
 *                                              excluding the bookend buttons)
 * @param {string}    pageClass                 Class to apply to the 'Go to page #' buttons, null by default
 * @param {array}     pageSizes                 allowed page sizes, [10, 20, 50, 100] by default
 * @param {number}    perPage                   number of displayed items on the page, 10 by default
 * @param {number}    prevClass                 Class to apply to the previous page button, null by default
 * @param {number}    totalRows                 number of total items in the data table, 0 by default
 * @param {number}    value                     actual page index, 1 by default
 *
 * @fires input
 * @fires on-page-size-change
 */
export default {
  name: 'Pagination',
  components: {
    BDropdown,
    BDropdownItem,
    BPagination,
    FrIcon,
  },
  data() {
    return {
      alignClasses: {
        right: 'justify-content-end',
        center: 'justify-content-center',
        left: 'justify-content-start',
      },
      DatasetSize,
      Position,
    };
  },
  props: {
    align: {
      type: String,
      validator(value) {
        return Object.values(Position).includes(value);
      },
      default: Position.RIGHT,
    },
    ariaLabel: {
      type: String,
      default: () => i18n.global.t('pagination.label'),
    },
    boundary: {
      type: String,
      default: 'window',
    },
    datasetSize: {
      type: String,
      validator(value) {
        return Object.values(DatasetSize).includes(value);
      },
      default: DatasetSize.LARGE,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    ellipsisClass: {
      type: String,
      default: null,
    },
    firstClass: {
      type: String,
      default: null,
    },
    hideBorder: {
      type: Boolean,
      default: false,
    },
    hideEllipsis: {
      type: Boolean,
      default: false,
    },
    hideGoToFirstPageButton: {
      type: Boolean,
      default: true,
    },
    hideGoToLastPageButton: {
      type: Boolean,
      default: true,
    },
    hidePageNumbers: {
      type: Boolean,
      default: false,
    },
    hidePageSizeSelector: {
      type: Boolean,
      default: false,
    },
    labelFirstPage: {
      type: String,
      default: () => i18n.global.t('pagination.gotoFirstPage'),
    },
    labelLastPage: {
      type: String,
      default: () => i18n.global.t('pagination.gotoLastPage'),
    },
    labelNextPage: {
      type: String,
      default: () => i18n.global.t('pagination.gotoNextPage'),
    },
    labelPage: {
      type: String,
      default: () => i18n.global.t('pagination.gotoPage'),
    },
    labelPrevPage: {
      type: String,
      default: () => i18n.global.t('pagination.gotoPreviousPage'),
    },
    lastClass: {
      type: String,
      default: null,
    },
    lastPage: {
      type: Boolean,
      default: true,
    },
    limit: {
      type: Number,
      default: 4,
    },
    pageClass: {
      type: String,
      default: null,
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100],
    },
    perPage: {
      type: Number,
      default: 10,
    },
    prevClass: {
      type: String,
      default: null,
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    value: {
      type: Number,
      default: 1,
    },
  },
  methods: {
    pageSizeChanged(pageSize) {
      /**
       * Emited to change the page size
       *
       * @event on-page-size-change
       * @type {object}
       * @property {number} pageSize - Indicates the new page size.
     */
      this.$emit('on-page-size-change', pageSize);
    },
  },
  computed: {
    /**
     * @description Calculates the page class to show or hide the page number buttons
     */
    pageClasses() {
      if (this.datasetSize === DatasetSize.LARGE || this.hidePageNumbers) {
        return 'd-none';
      }

      let pageOnDemandClass = '';
      if (this.totalRows <= 0 && !this.lastPage) {
        pageOnDemandClass = 'last-page-on-demand';
      }

      return ['d-flex align-items-center', this.pageClass, pageOnDemandClass];
    },
    /**
     * @description Calculates the min index row on page as the last item of previous page + 1
     */
    pageMin() {
      return (this.value - 1) * this.perPage + 1;
    },
    /**
     * @description Calculates the max index row on page as the multiplication of the current page by the page size,
     * if the total rows is less than or equal to page rows it returns the total rows instead.
     */
    pageMax() {
      const pageRows = this.value * this.perPage;
      if (this.totalRows > 0 && pageRows >= this.totalRows) {
        return this.totalRows;
      }
      return pageRows;
    },
    /**
     * @descrition Calculates the total of rows for page when is an on demand pagination, just adds 1 to the current
     * page size to always keep a next page active, it returns the real value of total rows when is the last page.
     */
    totalRowsOnDemand() {
      const itemsPerPage = this.value * this.perPage;
      if (this.lastPage) {
        return itemsPerPage;
      }
      return itemsPerPage + 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.pagination-dropdown:deep {
  .toggle-dropdown-button {
    background-color: transparent !important;

    &:active {
      background-color: transparent !important;
    }

    &:focus,
    &:focus-visible {
      box-shadow: none;
      outline: 2px solid $black;
    }
  }

  .dropdown-menu li a {
    &:hover {
      background-color: $gray-100;
    }
    &.active {
      color: $dropdown-link-color;
      background-color: $dropdown-link-active-bg;

      &:hover {
        background-color: $dropdown-link-hover-bg;
      }
    }
  }
}

.pagination-buttons {
  &:focus,
  &:focus-visible {
    outline: 2px solid $black;
  }

  &:deep(.page-item) {
    &.active .page-link {
      background-color: $gray-100;
      pointer-events: none;
      cursor: default;
    }

    .page-link {
      background-color: transparent;

      &:focus,
      &:focus-visible {
        box-shadow: none;
        outline: 2px solid $black;
      }

      &:hover {
        background-color: $gray-100;
        color: $gray-500;
      }
    }

    &.last-page-on-demand:nth-last-of-type(3) .page-link {
      color: transparent;
      pointer-events: none;
      position: relative;

      &::before {
        content: '...';
        position: absolute;
        left: 0;
        color: $gray-500;
        margin-top: -0.7rem;
        pointer-events: none;
        cursor: default;
        background-color: white;
        padding: 0.7rem 0.75rem;
      }
    }
    &.disabled {
      opacity: 0.5;
    }
  }
}
</style>
