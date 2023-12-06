/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { camelCase, startCase } from 'lodash';
import dayjs from 'dayjs';
import { getReportResult } from '@forgerock/platform-shared/src/api/AutoApi';
import { ref } from 'vue';
import i18n from '@/i18n';

export default function useViewReportTable() {
  const expiredMessage = ref('');
  const headingOrder = ['org-names', 'application_names', 'role_names', 'email', 'user_name'];
  const tableLoading = ref(false);
  const isExpired = ref(false);
  const isTableEmpty = ref(false);
  const response = ref({});
  const tableFields = ref([]);
  const tableItems = ref([]);
  const tableOrder = ref([]);
  const reportConfig = ref({});

  /**
   * Displays a message instead of the table in case the report is expired.
   */
  function handleNoDataMessage() {
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
   * Rearranges the order of the columns of the table.
   */
  function handleTableColumnOrder() {
    tableOrder.value = Object.keys(response.value.result[0]);
    headingOrder.forEach((heading) => {
      if (tableOrder.value.includes(heading)) {
        tableOrder.value.splice(tableOrder.value.indexOf(heading), 1);
        tableOrder.value.unshift(heading);
      }
    });
    tableOrder.value.forEach((row) => {
      switch (row) {
        case ('user_name'):
        case ('mail'):
          tableFields.value.push({
            key: 'user',
            label: i18n.t('reports.tableHeadings.user'),
            tdClass: 'align-top',
          });
          break;
        case ('first_name'):
          break;
        case ('last_name'):
          break;
        case ('node_details'):
          tableFields.value.push({
            key: camelCase(row),
            label: startCase(camelCase(row)),
            thStyle: { width: '40%' },
            tdClass: 'align-top',
          });
          break;
        default:
          tableFields.value.push({
            key: camelCase(row),
            label: i18n.te(`reports.tableHeadings.${camelCase(row)}`)
              ? i18n.t(`reports.tableHeadings.${camelCase(row)}`)
              : startCase(camelCase(row)),
            tdClass: 'align-top',
          });
      }
    });
  }

  /**
   * Adds format to certain items of the table.
   */
  function createTableFields() {
    tableItems.value = Array.from(response.value.result, (obj) => {
      const rearrangedObj = {};
      tableOrder.value.forEach((heading) => {
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
      handleNoDataMessage();
    } else if (response.value.result && response.value.result.length > 0) {
      handleTableColumnOrder();
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
  const fetchViewReport = async (template, id, config) => {
    try {
      tableLoading.value = true;
      reportConfig.value = config;
      const result = await getReportResult(id, template);
      response.value = result;
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
    tableLoading,
    isExpired,
    isTableEmpty,
    tableFields,
    tableItems,
  };
}
