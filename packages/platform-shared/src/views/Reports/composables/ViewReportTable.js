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
  const isTableEmpty = ref(false);
  const pageToken = ref('');
  const response = ref({});
  const reportConfig = ref({});
  const tableFields = ref([]);
  const tableItems = ref([]);
  const tableLoading = ref(false);
  const totalRows = ref(0);

  /**
   * Displays a message instead of the table in case the report is expired.
   */
  function handleExpiredResponse() {
    isExpired.value = true;
    expiredMessage.value = response.value.message;
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
  function createTableFields() {
    const tableOrder = Object.keys(response.value.result[0]);
    tableItems.value = Array.from(response.value.result, (obj) => {
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
  function arrangeTable() {
    if (response.value.message) {
      handleExpiredResponse();
    } else if (response.value.result && response.value.result.length > 0) {
      createTableFields();
    } else {
      isTableEmpty.value = true;
    }
  }

  /**
   * Calls the endpoint to get the View Report data.
   * @param {String} template The name of the template.
   * @param {String} id The Job ID of the Report Run.
   * @param {Object} config The object of the Report configuration.
   * @returns {Promise}
   */
  const fetchViewReport = async (template, id, config, pageSize, pagedResultsOffset, pagedResultsCookie) => {
    try {
      reportConfig.value = config;
      tableLoading.value = true;
      const result = await getReportResult(id, template, pageSize, pagedResultsOffset, pagedResultsCookie);
      response.value = result;
      totalRows.value = result.total;
      pageToken.value = result.pageToken;
      arrangeTable();
    } catch (error) {
      isExpired.value = true;
      expiredMessage.value = i18n.t('reports.notAvailable');
    } finally {
      tableLoading.value = false;
    }
  };

  return {
    fetchViewReport,
    expiredMessage,
    isExpired,
    isTableEmpty,
    pageToken,
    tableFields,
    tableItems,
    tableLoading,
    totalRows,
  };
}
