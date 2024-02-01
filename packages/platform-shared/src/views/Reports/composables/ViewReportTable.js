/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { camelCase } from 'lodash';
import dayjs from 'dayjs';
import { getReportResult } from '@forgerock/platform-shared/src/api/AutoApi';
import { ref } from 'vue';
import i18n from '@/i18n';

export default function useViewReportTable() {
  const expiredMessage = ref('');
  const isExpired = ref(false);
  const pageToken = ref('');
  const tableLoading = ref(false);
  const totalRows = ref(0);

  /**
   * Displays a message instead of the table in case the report is expired.
   */
  function handleExpiredResponse(tableItems) {
    isExpired.value = true;
    expiredMessage.value = tableItems.message;
  }

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
            rearrangedObj[camelCase(heading)] = dayjs(obj[heading]).format('MM/D/YYYY h:mm A');
            break;
          default:
            rearrangedObj[camelCase(heading)] = formatTableCellValueFromArray(obj[heading]);
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
      return handleExpiredResponse(tableItems);
    }
    if (tableItems.result && tableItems.result.length > 0) {
      return createTableFields(tableItems);
    }
    return [];
  }

  /**
   * Calls the endpoint to get the View Report data.
   * @param {String} template The name of the template.
   * @param {String} id The Job ID of the Report Run.
   * @param {String} pageSize The amount of results to show.
   * @param {String} pagedResultsOffset The results batch to fetch.
   * @param {String} pagedResultsCookie pagination cookie.
   * @returns {Array}
   */
  const fetchViewReport = async (template, id, pageSize, pagedResultsOffset, pagedResultsCookie) => {
    tableLoading.value = true;
    try {
      const tableItems = await getReportResult(id, template, pageSize, pagedResultsOffset, pagedResultsCookie);
      totalRows.value = tableItems.total;
      pageToken.value = tableItems.pageToken;
      return arrangeTable(tableItems);
    } catch (error) {
      isExpired.value = true;
      expiredMessage.value = i18n.t('reports.notAvailable');
      return [];
    } finally {
      tableLoading.value = false;
    }
  };

  return {
    fetchViewReport,
    expiredMessage,
    isExpired,
    pageToken,
    tableLoading,
    totalRows,
  };
}
