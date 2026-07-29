/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { getApplications } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

// Display labels for known source keys returned by /agent/config. Any source
// key not listed here falls back to being displayed as-is.
export const sourceLabels = {
  privilege: i18n.global.t('governance.agents.integration.sources.privilege'),
};

/**
 * Display label for a source key; raw key for unknown sources.
 * @param {String} source source key from the /agent/config sources object
 * @returns {String} display label
 */
export function getSourceLabel(source) {
  return sourceLabels[source] || source;
}

/**
 * A subtype's account objectClass nativeName, falling back to the subtype key.
 * @param {String} key subtype key within the source
 * @param {Object} subtype subtype schema entry from the /agent/config sources object
 * @returns {String} display name
 */
export function getSubtypeDisplayName(key, subtype) {
  const accountClass = subtype?.objectClasses?.find((objectClass) => objectClass.name === '__ACCOUNT__');
  return accountClass?.nativeName || key;
}

/**
 * One row per subtype with its display name and configured state.
 * @param {Object} sources the /agent/config sources object (null-safe)
 * @param {String} sourceKey source key within sources
 * @param {Array} applications applications configured for the source
 * @returns {Array} rows of { key, displayName, configured }
 */
export function buildSubtypeRows(sources, sourceKey, applications) {
  const subtypes = sources?.[sourceKey] || {};
  return Object.entries(subtypes).map(([key, value]) => ({
    key,
    displayName: getSubtypeDisplayName(key, value),
    configured: (applications || []).some((app) => app?.ingestion?.connector?.subtype === key),
  }));
}

// Retry backoff for the (eventually consistent) applications search index;
// plain export so tests can shorten it.
export const STATUS_REFRESH_BACKOFF_MS = 1000;

/**
 * Fetches the disconnected applications configured for one discovery source,
 * exposed reactively. Per-instance state: create one per component.
 */
export function useSourceApplications() {
  const sourceApplications = ref([]);
  const isLoadingApplications = ref(false);

  /**
   * Fetches applications already configured for a discovery source, so each of that
   * source's subtypes can be marked as configured or not.
   * @param {String} source source key (e.g. 'privilege')
   * @returns {Promise<Array>} the fetched applications (also exposed via sourceApplications)
   */
  async function fetchSourceApplications(source) {
    isLoadingApplications.value = true;
    sourceApplications.value = [];
    try {
      const { data } = await getApplications(null, {
        queryFilter: `ingestion.connector.type eq "${source}"`,
        pageSize: 100,
        fields: 'name,id,aiAgentSource,ingestion',
        disconnected: true,
      });
      sourceApplications.value = data?.result || [];
      return sourceApplications.value;
    } catch (err) {
      showErrorMessage(err, i18n.global.t('governance.agents.integration.errors.loadError'));
      return [];
    } finally {
      isLoadingApplications.value = false;
    }
  }

  return {
    sourceApplications,
    isLoadingApplications,
    fetchSourceApplications,
  };
}
