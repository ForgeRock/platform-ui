import { generateFeatureFlags } from './menuFeatureFlags';

describe('generateFeatureFlags', () => {
  it('returns an empty array if store is undefined', () => {
    expect(generateFeatureFlags(undefined)).toEqual([]);
  });

  it('returns an empty array if store.state is undefined', () => {
    expect(generateFeatureFlags({})).toEqual([]);
  });

  it('returns correct flags when all properties are present and governance is enabled in alpha realm', () => {
    const store = {
      state: {
        govLcmEnabled: true,
        govLcmUser: true,
        govLcmEntitlement: false,
        realm: 'alpha',
        SharedStore: {
          autoAccessEnabled: true,
          autoReportsEnabled: false,
          governanceEnabled: true,
          workforceEnabled: true,
        },
      },
    };
    expect(generateFeatureFlags(store)).toEqual({
      autoAccessEnabled: true,
      autoReportsEnabled: false,
      govLcmEnabled: true,
      govLcmEntitlement: false,
      govLcmUser: true,
      ifGovernance: true,
      realm: 'alpha',
      workforceEnabled: true,
    });
  });

  it('returns correct flags when governance is not enabled', () => {
    const store = {
      state: {
        govLcmEnabled: false,
        govLcmUser: false,
        govLcmEntitlement: false,
        realm: 'beta',
        SharedStore: {
          autoAccessEnabled: false,
          autoReportsEnabled: false,
          governanceEnabled: false,
          workforceEnabled: false,
        },
      },
    };
    expect(generateFeatureFlags(store)).toEqual({
      autoAccessEnabled: false,
      autoReportsEnabled: false,
      govLcmEnabled: false,
      govLcmEntitlement: false,
      govLcmUser: false,
      ifGovernance: false,
      realm: 'beta',
      workforceEnabled: false,
    });
  });

  it('handles missing SharedStore gracefully', () => {
    const store = {
      state: {
        govLcmEnabled: true,
        govLcmUser: true,
        govLcmEntitlement: true,
        realm: 'alpha',
      },
    };
    expect(generateFeatureFlags(store)).toEqual({
      autoAccessEnabled: undefined,
      autoReportsEnabled: undefined,
      govLcmEnabled: true,
      govLcmEntitlement: true,
      govLcmUser: true,
      ifGovernance: undefined,
      realm: 'alpha',
      workforceEnabled: undefined,
    });
  });
});
