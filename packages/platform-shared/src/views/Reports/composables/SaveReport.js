/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * TODO: Complete this in IAM-5718 - My next ticket
 */

// eslint-disable-next-line import/extensions
import { useAsyncState } from '@vueuse/core';
import { saveAnalyticsReport } from '../../../api/AutoApi';

/**
 * Composable to save new Report Templates.
 *
 * @returns {Object} Composable state
 */
export default function useSaveReport() {
  const {
    state, isLoading, isReady, error, execute,
  } = useAsyncState(
    (...args) => saveAnalyticsReport(...args),
    null,
    { immediate: false },
  );

  /**
   * Calls the useFetchApi composable to save the report data.
   *
   * @param {Object} payload - Name, description, viewers and report configuration values to be stored
   */
  async function saveReport(payload) {
    const {
      description, name, viewers, reportConfig, displayName,
    } = payload;

    execute(0, name, reportConfig ? JSON.parse(reportConfig) : {}, viewers, description, displayName);
  }

  return {
    templateData: state,
    saveReport,
    saveReportError: error,
    saveReportPending: isLoading,
    saveReportReady: isReady,
  };
}
