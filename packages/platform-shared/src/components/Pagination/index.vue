<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="shouldPaginate"
    class="card-footer py-2">
    <nav :aria-label="$t('common.tableNavigation')">
      <ul class="pagination justify-content-center mb-0">
        <li
          :disabled="currentPage === 0"
          :class="[{ disabled: currentPage === 0 }, 'page-item', 'first-page']">
          <a
            @click.prevent="gotoPage(0)"
            aria-label="$t('pagination.gotoFirstPage')"
            class="page-link"
            href="#">
            <FrIcon name="first_page" />
          </a>
        </li>
        <li
          :disabled="currentPage === 0"
          :class="[{ disabled: currentPage === 0 }, 'page-item', 'prev-page']">
          <a
            @click.prevent="previousPage"
            aria-label="$t('pagination.gotoPreviousPage')"
            class="page-link"
            href="#">
            <FrIcon name="keyboard_arrow_left" />
          </a>
        </li>
        <li
          :disabled="isLastPage"
          :class="[{ disabled: isLastPage }, 'page-item', 'next-page']">
          <a
            @click.prevent="nextPage"
            aria-label="$t('pagination.gotoNextPage')"
            class="page-link"
            href="#">
            <FrIcon name="keyboard_arrow_right" />
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import FrIcon from '../Icon';

/**
  * Pagination component, mostly for tabled list content, but usable by anything with paged content
  */
export default {
  name: 'Pagination',
  components: {
    FrIcon,
  },
  computed: {
    /**
     * Determines if the page results are the last page of data
     * @returns {Boolean}
     */
    isLastPage() {
      // Paged results cookie
      if (this.remainingPagedResults === -1 && this.totalPagedResults === -1) {
        return this.pagedResultsCookie !== null;
      }

      // Remaining paged results
      if (this.remainingPagedResults > 0) {
        return this.remainingPagedResults <= this.pageSize;
      }

      // Total paged results
      if (this.totalPagedResults > 0) {
        const { currentPage, pageSize, totalPagedResults } = this;
        const currentTotalResults = (currentPage + 1) * pageSize;
        return currentTotalResults >= totalPagedResults;
      }

      return true;
    },
    /**
     * Determines if the page results should allow the component to paginate
     * @returns {Boolean}
     */
    shouldPaginate() {
      // Paged results cookie
      if (this.remainingPagedResults === -1 && this.totalPagedResults === -1) {
        return this.pagedResultsCookie !== null;
      }

      // Remaining paged results
      if (this.remainingPagedResults > 0) {
        return this.currentPage > 0 || this.remainingPagedResults > this.pageSize;
      }

      // Total paged results
      if (this.totalPagedResults > 0) {
        const { resultCount, totalPagedResults } = this;
        return totalPagedResults > resultCount;
      }

      return false;
    },
  },
  data() {
    return {
      currentPage: 0,
    };
  },
  /**
    * When pagintion data is provided by the backend, that data should be passed into this component, and the component will correctly render the pagination controls.
    * When there is no provided pagination data, the following props must be provided:
    * pageSize - Amount of items to be shown on a page.
    * totalPagedResults - Total amount of pages existing for the dataset.
    *
    * TODO: Give more examples when page numbers are integrated into component.
    */
  props: {
    /**
     * Cookie @string provided by IDM/AM backend.
     * Should only be used when provided by the backend, and never created statically.
     */
    pagedResultsCookie: {
      type: String,
      default: null,
    },
    /**
     * Number of rows to be returned on a single page of items.
     */
    pageSize: {
      required: true,
      type: Number,
    },
    /**
     * Number of total results left based on the how many items per page (pageSize) and the current page (currentPage).
     */
    remainingPagedResults: {
      type: Number,
      default: -1,
    },
    /**
     * Number of total results of items to be shown in the list.
     */
    resultCount: {
      type: Number,
      default: 0,
    },
    /**
     * Number of total pages based on total results (resultCount) and and amount of items per page (pageSize).
     */
    totalPagedResults: {
      type: Number,
      default: -1,
    },
  },
  methods: {
    /**
     * Gets called when the user clicks on the next page icon
     */
    nextPage() {
      if (!this.isLastPage) {
        this.gotoPage(this.currentPage + 1);
      }
    },
    /**
     * Function to set the page to the value in param
     * @param {Number} page number to go to
     */
    gotoPage(pageNum) {
      this.currentPage = pageNum;
    },
    /**
     * Gets called when the user clicks on the previous page icon
     */
    previousPage() {
      if (this.currentPage > 0) {
        this.gotoPage(this.currentPage - 1);
      }
    },
  },
  watch: {
    currentPage(newVal) {
      /**
       * Pagination change event
       * @event pagination-change
       * @property {Number} pagedResultsOffset number of results from first to current page
       * @property {Number} newVal the page number from currentPage
       */
      const pagedResultsOffset = newVal * this.pageSize;
      this.$emit('pagination-change', pagedResultsOffset, newVal);
    },
  },
};
</script>
