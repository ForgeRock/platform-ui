/**
 * Generates a set of feature flags based on the provided store's state.
 * Governance menu items are only available in the alpha realm under governance environment.
 *
 * @param {Object} store - The Vuex store object containing application state.
 * @returns {Object} An object containing feature flags for filtering end user menu items.
 *
 */
// eslint-disable-next-line import/prefer-default-export
export function generateFeatureFlags(store) {
  if (!store || !store.state) {
    return [];
  }

  const {
    govLcmEnabled,
    govLcmUser,
    govLcmEntitlement,
    govLcmRole,
    realm,
    SharedStore = {},
  } = store.state;

  const {
    autoAccessEnabled,
    autoReportsEnabled,
    governanceDevEnabled,
    governanceEnabled,
    workforceEnabled,
  } = SharedStore;

  const ifGovernance = governanceEnabled && realm === 'alpha'; // governance menu items are only available in alpha realm

  // flag object which contains all the specific flags for filtering the enduser menu items
  return {
    autoAccessEnabled,
    autoReportsEnabled,
    governanceDevEnabled,
    govLcmEnabled,
    govLcmEntitlement,
    govLcmRole,
    govLcmUser,
    ifGovernance,
    realm,
    workforceEnabled,
  };
}
