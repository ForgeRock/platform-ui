/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  buildRevokesExportTargetFilter,
  FINAL_REMEDIATION_STATUSES,
  REVOKES_ITEM_TYPES,
  getRevokesItemTypesForCampaign,
  getSingleRevokesTypeForCampaign,
  resolveRevokesExportTypes,
  buildRevokesExportFields,
  buildRevokesExportMappers,
} from './revokeExportFilter';

/** Runs one item through all mappers and returns the merged CSV row. */
function mapItem(item, itemType, columnConfig) {
  const mappers = buildRevokesExportMappers(itemType, columnConfig);
  return Object.assign(...mappers.map((map) => map(item)));
}

describe('revokeExportFilter', () => {
  it('builds an AND filter with signed-off status, revoke decision, and not-final remediation', () => {
    const filter = buildRevokesExportTargetFilter('accountGrants');

    expect(filter.operator).toBe('AND');
    expect(filter.operand).toHaveLength(4);

    const [status, decision, remediation, itemTypeClause] = filter.operand;

    expect(status).toEqual({
      operator: 'EQUALS',
      operand: { targetName: 'decision.certification.status', targetValue: 'signed-off' },
    });

    expect(decision).toEqual({
      operator: 'EQUALS',
      operand: { targetName: 'decision.certification.decision', targetValue: 'revoke' },
    });

    expect(remediation.operator).toBe('NOT');
    expect(remediation.operand).toHaveLength(1);
    expect(remediation.operand[0]).toEqual({
      operator: 'IN',
      operand: {
        targetName: 'decision.certification.remediationStatus',
        targetValue: ['complete', 'failed', 'canceled'],
      },
    });

    expect(itemTypeClause).toEqual({
      operator: 'IN',
      operand: { targetName: 'item.type', targetValue: ['accountGrant', 'AccountGrant', 'sharedAccount'] },
    });
  });

  it('omits the item.type clause when the group is unknown (whole-campaign export)', () => {
    const filter = buildRevokesExportTargetFilter('something-new');
    expect(filter.operand).toHaveLength(3);
    expect(filter.operand.map((o) => o.operator)).toEqual(['EQUALS', 'EQUALS', 'NOT']);
  });

  it('matches the remediation statuses pinned by the backend export contract', () => {
    expect(FINAL_REMEDIATION_STATUSES).toEqual(['complete', 'failed', 'canceled']);
  });

  it('returns a fresh filter object on every call (no shared mutable state)', () => {
    const first = buildRevokesExportTargetFilter('entitlementGrants');
    const second = buildRevokesExportTargetFilter('entitlementGrants');

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    // The IN-clause arrays are spread per call, so mutating one filter's copy
    // must not leak into another.
    expect(first.operand[2].operand[0].operand.targetValue).not.toBe(second.operand[2].operand[0].operand.targetValue);
    expect(first.operand[3].operand.targetValue).not.toBe(second.operand[3].operand.targetValue);
  });

  it('expands legacy AccountGrant into the accountGrants group item types', () => {
    expect(REVOKES_ITEM_TYPES.accountGrants.itemTypes).toContain('accountGrant');
    expect(REVOKES_ITEM_TYPES.accountGrants.itemTypes).toContain('AccountGrant');
    expect(REVOKES_ITEM_TYPES.accountGrants.itemTypes).toContain('sharedAccount');
  });

  it('maps each campaign type to the item-type groups it can hold', () => {
    // identity and agentAccess are the mixed campaigns
    expect(getRevokesItemTypesForCampaign('identity')).toEqual(['accountGrants', 'entitlementGrants', 'roleMemberships']);
    expect(getRevokesItemTypesForCampaign('agentAccess')).toEqual(['accountGrants', 'entitlementGrants', 'roleMemberships']);
    expect(getRevokesItemTypesForCampaign('agentProfile')).toEqual(['accountGrants']);
    expect(getRevokesItemTypesForCampaign('entitlement')).toEqual(['entitlementGrants']);
    expect(getRevokesItemTypesForCampaign('roleMembership')).toEqual(['roleMemberships']);
    expect(getRevokesItemTypesForCampaign('roleComposition')).toEqual(['roleCompositions']);
    expect(getRevokesItemTypesForCampaign('entitlementComposition')).toEqual(['entitlementCompositions']);
    expect(getRevokesItemTypesForCampaign('identityProfile')).toEqual(['identityProfiles']);
  });

  it('falls back to every group for unknown campaign types', () => {
    expect(getRevokesItemTypesForCampaign('something-new')).toEqual(Object.keys(REVOKES_ITEM_TYPES));
  });
});

describe('resolveRevokesExportTypes', () => {
  it('passes an explicit modal choice through unchanged', () => {
    expect(resolveRevokesExportTypes('roleMemberships', 'identity')).toEqual(['roleMemberships']);
  });

  it('fans a mixed campaign with no choice into one export per candidate type', () => {
    expect(resolveRevokesExportTypes(null, 'identity')).toEqual(['accountGrants', 'entitlementGrants', 'roleMemberships']);
    expect(resolveRevokesExportTypes(null, 'agentAccess')).toEqual(['accountGrants', 'entitlementGrants', 'roleMemberships']);
  });

  it('fans the all-types choice into one export per candidate type', () => {
    expect(resolveRevokesExportTypes('all', 'identity')).toEqual(['accountGrants', 'entitlementGrants', 'roleMemberships']);
  });

  it('exports the one group for single-type campaigns regardless of choice', () => {
    expect(resolveRevokesExportTypes(null, 'roleMembership')).toEqual(['roleMemberships']);
    expect(resolveRevokesExportTypes('all', 'entitlement')).toEqual(['entitlementGrants']);
  });

  it('keeps the whole-worklist union fallback for unknown campaign types', () => {
    expect(resolveRevokesExportTypes(null, 'something-new')).toEqual([null]);
    expect(resolveRevokesExportTypes('all', undefined)).toEqual([null]);
  });
});

describe('getSingleRevokesTypeForCampaign', () => {
  it('returns the group for single-type campaigns and null for mixed or unknown ones', () => {
    expect(getSingleRevokesTypeForCampaign('roleMembership')).toBe('roleMemberships');
    expect(getSingleRevokesTypeForCampaign('identity')).toBeNull();
    expect(getSingleRevokesTypeForCampaign('something-new')).toBeNull();
  });
});

describe('buildRevokesExportFields', () => {
  it('requests account fields for accountGrants, including the descriptor account display name', () => {
    const fields = buildRevokesExportFields('accountGrants');
    expect(fields).toEqual(expect.arrayContaining([
      'user.userName',
      'application.name',
      'keys.accountId',
      'account.id',
      'descriptor.idx./account.displayName',
    ]));
    expect(fields).not.toEqual(expect.arrayContaining(['descriptor.idx./entitlement.displayName', 'role.name']));
  });

  it('requests grant fields for entitlementGrants, including both descriptor display names', () => {
    const fields = buildRevokesExportFields('entitlementGrants');
    expect(fields).toEqual(expect.arrayContaining([
      'user.userName',
      'application.name',
      'keys.accountId',
      'descriptor.idx./account.displayName',
      'descriptor.idx./entitlement.displayName',
      'entitlement.displayName',
    ]));
  });

  it('requests role + user fields for roleMemberships but role-only for roleCompositions', () => {
    expect(buildRevokesExportFields('roleMemberships')).toEqual(expect.arrayContaining(['role.name', 'user.userName']));
    const compositionFields = buildRevokesExportFields('roleCompositions');
    expect(compositionFields).toEqual(expect.arrayContaining(['role.name']));
    expect(compositionFields).not.toEqual(expect.arrayContaining(['user.userName', 'application.name', 'keys.accountId']));
  });

  it('requests composition fields without user paths for entitlementCompositions', () => {
    const fields = buildRevokesExportFields('entitlementCompositions');
    expect(fields).toEqual(expect.arrayContaining(['application.name', 'descriptor.idx./entitlement.displayName']));
    expect(fields).not.toEqual(expect.arrayContaining(['user.userName']));
  });

  it('requests user-only fields for identityProfiles', () => {
    const fields = buildRevokesExportFields('identityProfiles');
    expect(fields).toEqual(expect.arrayContaining(['user.userName']));
    expect(fields).not.toEqual(expect.arrayContaining(['application.name', 'role.name', 'keys.accountId']));
  });

  it('falls back to the union of every type for unknown types', () => {
    const fields = buildRevokesExportFields('something-new');
    expect(fields).toEqual(expect.arrayContaining(['user.userName', 'application.name', 'role.name']));
    expect(fields).toEqual(expect.arrayContaining(['descriptor.idx./account.displayName']));
  });
});

describe('buildRevokesExportMappers', () => {
  const baseItem = {
    id: 'task-1',
    user: { userName: 'andrew.och' },
    application: { name: 'SNOW' },
    keys: { accountId: 'system/SNOW/User/abc' },
    entitlement: { displayName: 'sn_incident_write' },
    decision: { certification: { remediationStatus: 'pending' } },
  };
  const expectedEditable = {
    'Remediation Status': 'pending',
    'Completion Date': '',
    'Remediation Comments': '',
    'Evidence Reference': '',
  };

  it('maps account grant items with identity, application, and account (display name first)', () => {
    const row = mapItem({
      ...baseItem,
      descriptor: { idx: { '/account': { displayName: 'andrew@snow' } } },
    }, 'accountGrants');
    expect(row).toEqual({
      'Task ID': 'task-1',
      Identity: 'andrew.och',
      Application: 'SNOW',
      Account: 'andrew@snow',
      ...expectedEditable,
    });
    expect(Object.keys(row)).not.toContain('Entitlement');
  });

  it('falls back to the raw account path when no descriptor display name exists', () => {
    const row = mapItem(baseItem, 'accountGrants');
    expect(row.Account).toBe('system/SNOW/User/abc');
  });

  it('maps entitlement grant items with identity, application, account, and entitlement by default', () => {
    expect(mapItem(baseItem, 'entitlementGrants')).toEqual({
      'Task ID': 'task-1',
      Identity: 'andrew.och',
      Application: 'SNOW',
      Account: 'system/SNOW/User/abc',
      Entitlement: 'sn_incident_write',
      ...expectedEditable,
    });
  });

  it('maps roleMembership items with Identity and Role columns only', () => {
    const row = mapItem({ ...baseItem, role: { name: 'auditor' } }, 'roleMemberships');
    expect(row).toEqual({
      'Task ID': 'task-1',
      Identity: 'andrew.och',
      Role: 'auditor',
      ...expectedEditable,
    });
    expect(Object.keys(row)).not.toContain('Application');
    expect(Object.keys(row)).not.toContain('Account');
  });

  it('maps roleComposition items without any Identity column — no user is ever involved', () => {
    const row = mapItem({ ...baseItem, role: { name: 'auditor' } }, 'roleCompositions');
    expect(row).toEqual({
      'Task ID': 'task-1',
      Role: 'auditor',
      ...expectedEditable,
    });
    expect(Object.keys(row)).not.toContain('Identity');
  });

  it('maps entitlementComposition items without any Identity column', () => {
    const row = mapItem(baseItem, 'entitlementCompositions');
    expect(row).toEqual({
      'Task ID': 'task-1',
      Application: 'SNOW',
      Entitlement: 'sn_incident_write',
      ...expectedEditable,
    });
    expect(Object.keys(row)).not.toContain('Identity');
    expect(Object.keys(row)).not.toContain('Account');
  });

  it('maps identityProfile items with Identity only', () => {
    const row = mapItem(baseItem, 'identityProfiles');
    expect(row).toEqual({
      'Task ID': 'task-1',
      Identity: 'andrew.och',
      ...expectedEditable,
    });
    expect(Object.keys(row)).not.toContain('Entitlement');
  });

  it('always keeps the five upload-required columns for every type', () => {
    for (const type of Object.keys(REVOKES_ITEM_TYPES)) {
      const row = mapItem(baseItem, type);
      for (const required of ['Task ID', 'Remediation Status', 'Completion Date', 'Remediation Comments', 'Evidence Reference']) {
        expect(row).toHaveProperty(required);
      }
    }
  });

  it('falls back to the grant-shaped defaults for unknown types', () => {
    // unknown item types read the grant-shaped defaults; the base item has
    // no descriptor account display name, so the raw path shows
    const row = mapItem(baseItem, 'something-new');
    expect(row.Identity).toBe('andrew.och');
    expect(row.Application).toBe('SNOW');
    expect(row.Account).toBe('system/SNOW/User/abc');
    expect(row.Entitlement).toBe('sn_incident_write');
  });

  it('pins the Account column even when the template configuration dropped it', () => {
    // accounts template without account.account — the file must still name
    // the account being revoked
    const row = mapItem({
      ...baseItem,
      descriptor: { idx: { '/account': { displayName: 'andrew@snow' } } },
    }, 'accountGrants', {
      accounts: ['user.user', 'application.application'],
    });
    expect(row).toEqual({
      'Task ID': 'task-1',
      Identity: 'andrew.och',
      Application: 'SNOW',
      Account: 'andrew@snow',
      ...expectedEditable,
    });
  });

  it('pins the Role column and drops a stale Entitlement column on role types', () => {
    // roles template misconfigured with the entitlement slot, which is empty
    // for roleMembership items
    const row = mapItem({ ...baseItem, role: { name: 'auditor' } }, 'roleMemberships', {
      roles: ['user.user', 'entitlement.entitlement'],
    });
    expect(row).toEqual({
      'Task ID': 'task-1',
      Identity: 'andrew.och',
      Role: 'auditor',
      ...expectedEditable,
    });
    expect(Object.keys(row)).not.toContain('Entitlement');
    expect(Object.keys(row)).not.toContain('Application');
    expect(Object.keys(row)).not.toContain('Account');
  });

  it('builds Identity from givenName + sn when userName is absent', () => {
    const row = mapItem({ ...baseItem, user: { givenName: 'Andrew', sn: 'Och' } }, 'entitlementGrants');
    expect(row.Identity).toBe('Andrew Och');
  });

  it('falls back to the descriptor entitlement for the Entitlement column', () => {
    const withDescriptor = mapItem({
      ...baseItem,
      entitlement: undefined,
      descriptor: { idx: { '/entitlement': { displayName: 'descriptor-name' } } },
    }, 'entitlementGrants');
    expect(withDescriptor.Entitlement).toBe('descriptor-name');
  });

  describe('campaign column configuration (uiConfig)', () => {
    it('follows the template configuration when one exists', () => {
      // admin removed Application from the entitlements template — that
      // column goes; the Account column is pinned and stays
      const row = mapItem(baseItem, 'entitlementGrants', {
        entitlements: ['user.user', 'entitlement.entitlement'],
      });
      expect(row).toEqual({
        'Task ID': 'task-1',
        Identity: 'andrew.och',
        Account: 'system/SNOW/User/abc',
        Entitlement: 'sn_incident_write',
        ...expectedEditable,
      });
      expect(Object.keys(row)).not.toContain('Application');
    });

    it('reads role.role columns from a customized roles template', () => {
      const row = mapItem({ ...baseItem, role: { name: 'auditor' } }, 'roleMemberships', {
        roles: ['role.role', 'user.user'],
      });
      expect(row).toEqual({
        'Task ID': 'task-1',
        Role: 'auditor',
        Identity: 'andrew.och',
        ...expectedEditable,
      });
    });

    it('emits custom glossary columns using their item path as the header', () => {
      const item = {
        ...baseItem,
        glossary: { idx: { '/user': { department: 'Engineering' } } },
      };
      const row = mapItem(item, 'entitlementGrants', {
        entitlements: ['user.user', 'user.glossary.department'],
      });
      expect(row['user.glossary.department']).toBe('Engineering');
    });

    it('ignores review columns (flags/comments) — reviewer annotations, not artifact data', () => {
      const row = mapItem(baseItem, 'entitlementGrants', {
        entitlements: ['user.user', 'review.flags', 'review.comments', 'entitlement.entitlement'],
      });
      expect(Object.keys(row)).not.toContain('review.flags');
      expect(Object.keys(row)).not.toContain('review.comments');
      expect(row.Identity).toBe('andrew.och');
    });

    it('keeps the five upload-required columns even when the config omits everything', () => {
      const row = mapItem(baseItem, 'entitlementGrants', { entitlements: ['review.flags'] });
      for (const required of ['Task ID', 'Remediation Status', 'Completion Date', 'Remediation Comments', 'Evidence Reference']) {
        expect(row).toHaveProperty(required);
      }
      expect(Object.keys(row)).not.toContain('Identity');
    });
  });
});
