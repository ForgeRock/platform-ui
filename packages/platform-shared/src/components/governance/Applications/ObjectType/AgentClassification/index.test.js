/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as GlossaryUtils from '@forgerock/platform-shared/src/utils/governance/glossary';
import AgentClassification from './index';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));
jest.mock('@forgerock/platform-shared/src/utils/governance/glossary');
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: jest.fn(),
  showErrorMessage: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/utils/governance/filters', () => ({
  convertTargetFilterToQueryFilter: jest.fn().mockReturnValue(''),
  getGovernanceFilter: jest.fn().mockReturnValue({}),
}));
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('test-uuid') }));

const DEFAULT_FILTER_STATE = {
  operator: 'AND',
  operand: [
    { operator: 'NOT EQUALS', operand: { targetName: 'accountType', targetValue: 'agent' } },
  ],
};

function setup(props = {}) {
  return shallowMount(AgentClassification, {
    global: { mocks: { $t: (k) => k } },
    props: {
      applicationId: 'app-1',
      objectType: { id: 'User', type: 'account', properties: {} },
      ...props,
    },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  GlossaryUtils.getGlossarySchema.mockResolvedValue([]);
  ApplicationsApi.getApplicationTasks.mockResolvedValue({ data: { result: [] } });
  ApplicationsApi.getApplicationTask.mockResolvedValue({ data: {} });
  ApplicationsApi.saveApplicationTask.mockResolvedValue({ data: { name: 'rule-1' } });
  ApplicationsApi.triggerApplicationTask.mockResolvedValue({});
});

// ─── scimToTargetFilter ───────────────────────────────────────────────────────

describe('scimToTargetFilter', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = setup();
    await flushPromises();
  });

  it('returns null for an empty string', () => {
    expect(wrapper.vm.scimToTargetFilter('')).toBeNull();
  });

  it('returns null for the string "true"', () => {
    expect(wrapper.vm.scimToTargetFilter('true')).toBeNull();
  });

  it('parses a SCIM eq atom (single-quoted value)', () => {
    expect(wrapper.vm.scimToTargetFilter("(accountType eq 'agent')")).toEqual({
      operator: 'AND',
      operand: [{ operator: 'EQUALS', operand: { targetName: 'accountType', targetValue: 'agent' } }],
    });
  });

  it('parses a SCIM eq atom (double-quoted legacy value)', () => {
    expect(wrapper.vm.scimToTargetFilter('(attr eq "value")')).toEqual({
      operator: 'AND',
      operand: [{ operator: 'EQUALS', operand: { targetName: 'attr', targetValue: 'value' } }],
    });
  });

  it('parses a SCIM ne atom → NOT EQUALS', () => {
    expect(wrapper.vm.scimToTargetFilter("(attr ne 'x')")).toEqual({
      operator: 'AND',
      operand: [{ operator: 'NOT EQUALS', operand: { targetName: 'attr', targetValue: 'x' } }],
    });
  });

  it('parses a SCIM co atom → CONTAINS', () => {
    expect(wrapper.vm.scimToTargetFilter("(attr co 'x')")).toEqual({
      operator: 'AND',
      operand: [{ operator: 'CONTAINS', operand: { targetName: 'attr', targetValue: 'x' } }],
    });
  });

  it('parses a SCIM sw atom → STARTS_WITH', () => {
    expect(wrapper.vm.scimToTargetFilter("(attr sw 'x')")).toEqual({
      operator: 'AND',
      operand: [{ operator: 'STARTS_WITH', operand: { targetName: 'attr', targetValue: 'x' } }],
    });
  });

  it('parses a SCIM pr (presence) atom → EXISTS with empty targetValue', () => {
    expect(wrapper.vm.scimToTargetFilter('(attr pr)')).toEqual({
      operator: 'AND',
      operand: [{ operator: 'EXISTS', operand: { targetName: 'attr', targetValue: '' } }],
    });
  });

  it('parses a SCIM negation atom → NOT operator wrapping inner atom', () => {
    expect(wrapper.vm.scimToTargetFilter("(!(attr eq 'x'))")).toEqual({
      operator: 'AND',
      operand: [{
        operator: 'NOT',
        operand: [{ operator: 'EQUALS', operand: { targetName: 'attr', targetValue: 'x' } }],
      }],
    });
  });

  it('parses a SCIM AND compound into an AND group', () => {
    expect(wrapper.vm.scimToTargetFilter("(a eq 'v1') and (b eq 'v2')")).toEqual({
      operator: 'AND',
      operand: [
        { operator: 'EQUALS', operand: { targetName: 'a', targetValue: 'v1' } },
        { operator: 'EQUALS', operand: { targetName: 'b', targetValue: 'v2' } },
      ],
    });
  });

  it('parses a SCIM OR compound into an OR group', () => {
    expect(wrapper.vm.scimToTargetFilter("(a eq 'v1') or (b eq 'v2')")).toEqual({
      operator: 'OR',
      operand: [
        { operator: 'EQUALS', operand: { targetName: 'a', targetValue: 'v1' } },
        { operator: 'EQUALS', operand: { targetName: 'b', targetValue: 'v2' } },
      ],
    });
  });

  it('parses a legacy (no-parens) atom with double-quoted value', () => {
    expect(wrapper.vm.scimToTargetFilter('attr eq "value"')).toEqual({
      operator: 'AND',
      operand: [{ operator: 'EQUALS', operand: { targetName: 'attr', targetValue: 'value' } }],
    });
  });

  it('parses a single legacy atom regardless of "and" appearing inside a greedy double-quoted value', () => {
    // The leafMatch regex uses a greedy ".*" so 'a eq "v1" and b eq "v2"' is consumed
    // as one atom with a corrupted value rather than a two-clause AND. This documents
    // the existing parser behaviour so regressions are caught.
    const result = wrapper.vm.scimToTargetFilter('a eq "v1" and b eq "v2"');
    expect(result).not.toBeNull();
    expect(result.operand).toHaveLength(1);
    expect(result.operand[0].operator).toBe('EQUALS');
    expect(result.operand[0].operand.targetName).toBe('a');
  });

  it('returns null for a completely unrecognised input', () => {
    expect(wrapper.vm.scimToTargetFilter('completely invalid')).toBeNull();
  });

  it('drops unrecognised operators and returns null rather than partial results', () => {
    // 'gt' is not in SCIM_OP_MAP — atom parser returns null, group yields nothing
    expect(wrapper.vm.scimToTargetFilter('(attr gt "value")')).toBeNull();
  });
});

// ─── populateFromTask ─────────────────────────────────────────────────────────

describe('populateFromTask', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = setup();
    await flushPromises();
  });

  it('sets ruleName from task name', () => {
    wrapper.vm.populateFromTask({ name: 'My Rule' });
    expect(wrapper.vm.ruleName).toBe('My Rule');
  });

  it('sets form.overwrite from task data', () => {
    wrapper.vm.populateFromTask({ taskData: { action: { overwrite: false } } });
    expect(wrapper.vm.form.overwrite).toBe(false);
  });

  it('defaults form.overwrite to true when absent', () => {
    wrapper.vm.populateFromTask({ taskData: { action: {} } });
    expect(wrapper.vm.form.overwrite).toBe(true);
  });

  it('sets form.recurring from task', () => {
    wrapper.vm.populateFromTask({ recurring: true });
    expect(wrapper.vm.form.recurring).toBe(true);
  });

  it('keeps a preset interval as the intervalMs value', () => {
    wrapper.vm.populateFromTask({ intervalMs: 86400000 });
    expect(wrapper.vm.form.intervalMs).toBe(86400000);
    expect(wrapper.vm.customIntervalMs).toBe('');
  });

  it('maps a non-preset interval to "custom" and stores the raw ms value', () => {
    wrapper.vm.populateFromTask({ intervalMs: 7200000 });
    expect(wrapper.vm.form.intervalMs).toBe('custom');
    expect(wrapper.vm.customIntervalMs).toBe('7200000');
  });

  it('parses a saved filter string into filterState', () => {
    wrapper.vm.populateFromTask({
      taskData: { targets: [{ filter: "(accountType eq 'agent')" }] },
    });
    expect(wrapper.vm.filterState).toEqual({
      operator: 'AND',
      operand: [{ operator: 'EQUALS', operand: { targetName: 'accountType', targetValue: 'agent' } }],
    });
    expect(wrapper.vm.filterString).toBe("(accountType eq 'agent')");
  });

  it('falls back to DEFAULT_FILTER_STATE when no filter is saved', () => {
    wrapper.vm.populateFromTask({ taskData: { targets: [{}] } });
    expect(wrapper.vm.filterState).toEqual(DEFAULT_FILTER_STATE);
    expect(wrapper.vm.filterString).toBe('');
  });

  it('falls back to DEFAULT_FILTER_STATE when the filter string is unparseable', () => {
    wrapper.vm.populateFromTask({
      taskData: { targets: [{ filter: 'completely invalid' }] },
    });
    expect(wrapper.vm.filterState).toEqual(DEFAULT_FILTER_STATE);
  });

  it('populates mappings from saved task mappings and stamps each row with a uuid', () => {
    wrapper.vm.populateFromTask({
      taskData: {
        action: {
          mappings: [
            { target: 'department', source: { type: 'static', value: 'Engineering' } },
            { target: 'costCenter', source: { type: 'sourcePath', value: 'division' } },
          ],
        },
      },
    });
    expect(wrapper.vm.mappings).toEqual([
      {
        id: 'test-uuid',
        targetAttribute: 'department',
        sourceType: 'static',
        value: 'Engineering',
      },
      {
        id: 'test-uuid',
        targetAttribute: 'costCenter',
        sourceType: 'sourcePath',
        value: 'division',
      },
    ]);
  });

  it('sets form.conditionalUpdates to true when a condition is saved', () => {
    wrapper.vm.populateFromTask({
      taskData: { action: { condition: "(attr eq 'x')" } },
    });
    expect(wrapper.vm.form.conditionalUpdates).toBe(true);
  });

  it('parses a saved condition string into conditionFilterState', () => {
    wrapper.vm.populateFromTask({
      taskData: { action: { condition: "(status eq 'active')" } },
    });
    expect(wrapper.vm.conditionFilterState).toEqual({
      operator: 'AND',
      operand: [{ operator: 'EQUALS', operand: { targetName: 'status', targetValue: 'active' } }],
    });
  });

  it('resets conditionFilterState to {} when no condition is saved', () => {
    // seed a previous condition state
    wrapper.vm.populateFromTask({ taskData: { action: { condition: "(a eq 'b')" } } });
    // then populate a task without one
    wrapper.vm.populateFromTask({ taskData: { action: {} } });
    expect(wrapper.vm.conditionFilterState).toEqual({});
    expect(wrapper.vm.form.conditionalUpdates).toBe(false);
  });

  it('increments filterKey to force target-filter re-mount', () => {
    const before = wrapper.vm.filterKey;
    wrapper.vm.populateFromTask({});
    expect(wrapper.vm.filterKey).toBe(before + 1);
  });

  it('increments conditionFilterKey to force condition-filter re-mount', () => {
    const before = wrapper.vm.conditionFilterKey;
    wrapper.vm.populateFromTask({});
    expect(wrapper.vm.conditionFilterKey).toBe(before + 1);
  });
});

// ─── isFormValid ──────────────────────────────────────────────────────────────

describe('isFormValid', () => {
  let wrapper;
  const validFilter = { field: 'accountType', operator: 'EQUALS', value: 'agent' };

  beforeEach(async () => {
    wrapper = setup();
    await flushPromises();
    wrapper.vm.ruleName = 'My Rule';
    wrapper.vm.internalFilter = validFilter;
    wrapper.vm.mappings = [{ id: '1', targetAttribute: 'department', value: 'Engineering' }];
  });

  it('returns true when all required fields are valid', () => {
    expect(wrapper.vm.isFormValid).toBe(true);
  });

  it('returns false when conditionalUpdates is checked but condition filter is empty', () => {
    wrapper.vm.form = { ...wrapper.vm.form, conditionalUpdates: true };
    wrapper.vm.conditionInternalFilter = null;
    expect(wrapper.vm.isFormValid).toBe(false);
  });

  it('returns false when conditionalUpdates is checked and condition filter is invalid', () => {
    wrapper.vm.form = { ...wrapper.vm.form, conditionalUpdates: true };
    wrapper.vm.conditionInternalFilter = { field: '', operator: 'EQUALS', value: '' };
    expect(wrapper.vm.isFormValid).toBe(false);
  });

  it('returns true when conditionalUpdates is checked and condition filter is valid', () => {
    wrapper.vm.form = { ...wrapper.vm.form, conditionalUpdates: true };
    wrapper.vm.conditionInternalFilter = validFilter;
    expect(wrapper.vm.isFormValid).toBe(true);
  });

  it('returns true when conditionalUpdates is unchecked regardless of condition filter state', () => {
    wrapper.vm.form = { ...wrapper.vm.form, conditionalUpdates: false };
    wrapper.vm.conditionInternalFilter = null;
    expect(wrapper.vm.isFormValid).toBe(true);
  });
});
