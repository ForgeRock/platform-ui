/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';
import { getReportResult } from '@forgerock/platform-shared/src/api/AutoApi';
import { ref } from 'vue';
import i18n from '@/i18n';

export default function useViewReportTable() {
  const expiredMessage = ref('');
  const isExpired = ref(false);
  const nonSortableColumns = ref([]);
  const pageToken = ref('');
  const sortable = ref(false);
  const tableLoading = ref(false);
  const totalRows = ref(0);

  /**
   * Joins an array into a string if it does not contains objects as values.
   * @param {Array|String} arr The value.
   * @returns {Array|String}
   */
  function formatTableCellValueFromArray(arr) {
    if (Array.isArray(arr) && typeof arr[0] !== 'object') {
      return arr.join(', ');
    }
    return arr;
  }

  /**
   * Adds format to certain items of the table.
   */
  function createTableFields(tableItems) {
    const tableOrder = Object.keys(tableItems.result[0]);
    return Array.from(tableItems.result, (obj) => {
      const rearrangedObj = {};
      tableOrder.forEach((heading) => {
        switch (heading) {
          case ('mail'):
            rearrangedObj.userName = obj[heading];
            break;
          case ('timestamp'):
            rearrangedObj[heading] = dayjs(obj[heading]).format('MM/D/YYYY h:mm A');
            break;
          default:
            rearrangedObj[heading] = formatTableCellValueFromArray(obj[heading]);
        }
      });
      return rearrangedObj;
    });
  }

  /**
   * Rearranges the displayed data in the table.
   */
  function arrangeTable(tableItems) {
    if (tableItems.message) {
      isExpired.value = true;
      expiredMessage.value = tableItems.message;
      return [];
    }
    if (tableItems.result && tableItems.result.length > 0) {
      return createTableFields(tableItems);
    }
    return [];
  }

  /**
   * Calls the endpoint to get the View Report data.
   * @param {String} id The Job ID of the Report Run.
   * @param {String} template The name of the template.
   * @param {String} state State of the report (draft or published)
   * @param {String} pageSize The amount of results to show.
   * @param {String} pagedResultsOffset The results batch to fetch.
   * @returns {Array}
   */
  const fetchViewReport = async (id, template, state, pageSize, pagedResultsOffset, reqData) => {
    tableLoading.value = true;
    try {
      const tableItems = await getReportResult(id, template, state, pageSize, pagedResultsOffset, reqData);
      nonSortableColumns.value = tableItems.nonSortableColumns;
      sortable.value = tableItems.sortable;
      totalRows.value = tableItems.total;
      pageToken.value = tableItems.pageToken;
      return arrangeTable(tableItems);
    } catch (error) {
      isExpired.value = true;
      expiredMessage.value = i18n.global.t('reports.notAvailable');
      return [];
    } finally {
      tableLoading.value = false;
    }
  };

  return {
    fetchViewReport,
    expiredMessage,
    isExpired,
    nonSortableColumns,
    pageToken,
    sortable,
    tableLoading,
    totalRows,
  };
}
