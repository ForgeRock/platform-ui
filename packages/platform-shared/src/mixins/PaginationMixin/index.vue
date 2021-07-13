<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
/**
 * @description Pagination mixin used for providing basic defaults for the Pagination component
 *
 */
export default {
  name: 'PaginationMixin',
  data() {
    return {
      pagination: {},
      queryParams: {
        pagedResultsOffset: 0,
        pageSize: 10,
        totalPagedResultsPolicy: 'EXACT',
      },
    };
  },
  methods: {
    /**
     * Removes all null fields from the data param and sets it to the pagination field
     * @param {Object} data - Object containing pagination data
     */
    setPaginationData(data) {
      const cleanData = { ...data };
      Object.keys(cleanData).forEach((k) => cleanData[k] == null && delete cleanData[k]);
      this.pagination = { ...this.pagination, ...cleanData };
    },
  },
};
</script>
