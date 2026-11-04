/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as RoleMiningSessionApi from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import NewMiningSession from './NewMiningSession';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));

mockValidation(['required', 'min_value']);

const userProperties = {
  columns: ['accountStatus', 'city', 'country', 'department', 'mail', 'sn'],
};

const departmentValues = {
  column: 'department',
  values: ['Engineering', 'Sales', 'Marketing'],
};

describe('NewMiningSession', () => {
  let wrapper;
  let routerPush;

  const app = createAppContainer();
  async function mountComponent({ historyState = {} } = {}) {
    ({ routerPush } = mockRouter());
    setupTestPinia();
    wrapper = mount(NewMiningSession, {
      attachTo: app,
      global: {
        plugins: [i18n],
        mocks: {
          $route: { params: {} },
        },
      },
    });
    // history.state is read in onMounted; jsdom history starts empty, so apply the
    // duplicated-session prefill directly the way onMounted does
    await flushPromises();
    if (historyState.duplicatedSession) {
      await wrapper.vm.applyDuplicatedSession(historyState.duplicatedSession);
      await flushPromises();
    }
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  beforeEach(() => {
    RoleMiningSessionApi.getRoleMiningUserProperties.mockResolvedValue({ data: userProperties });
    RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockResolvedValue({ data: departmentValues });
    CommonsApi.getFilterSchema.mockResolvedValue({
      data: {
        user: [
          { key: 'accountStatus', displayName: 'Account Status' },
          { key: 'city', displayName: 'City' },
          { key: 'country', displayName: 'Country' },
          { key: 'department', displayName: 'Department' },
          { key: 'mail', displayName: 'Email' },
          { key: 'sn', displayName: 'Last Name' },
        ],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.unmount();
  });

  it('loads identity attributes from the popRoleMining userProperties endpoint, labeled with schema display names', async () => {
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningUserProperties).toHaveBeenCalled();
    // text is the schema display name; the option slot appends the raw key in italics
    expect(wrapper.vm.attributeOptions).toEqual([
      { text: 'Account Status', value: 'accountStatus' },
      { text: 'City', value: 'city' },
      { text: 'Country', value: 'country' },
      { text: 'Department', value: 'department' },
      { text: 'Email', value: 'mail' },
      { text: 'Last Name', value: 'sn' },
    ]);
  });

  it('offers only the role-mining columns the filter schema also lists, alphabetized', async () => {
    // 'adminOfOrg' is filterable per the role-mining endpoint but absent from the schema
    RoleMiningSessionApi.getRoleMiningUserProperties.mockResolvedValue({
      data: { columns: ['sn', 'mail', 'adminOfOrg'] },
    });
    await mountComponent();
    // sorted by display name: Email before Last Name, even though sn is listed first
    expect(wrapper.vm.attributeOptions).toEqual([
      { text: 'Email', value: 'mail' },
      { text: 'Last Name', value: 'sn' },
    ]);
  });

  /**
   * Select an attribute in a row's first dropdown through the field's v-model compat event,
   * the same path a user's interaction takes.
   */
  async function selectAttribute(uniqueIndex, attribute) {
    const fields = wrapper.findAllComponents({ name: 'FrField' });
    const attributeField = fields.find((field) => field.props('name') === `filterAttribute_${uniqueIndex}`);
    await attributeField.vm.$emit('modelCompat:input', attribute);
    await flushPromises();
  }

  /**
   * Fill the first filter row with an attribute and values through the fields' events. The
   * values are emitted as the string array FrMultiselect itself emits after a real user
   * selection (case preserved).
   */
  async function fillFirstRow(attribute = 'department', values = ['Engineering']) {
    await selectAttribute(1, attribute);
    const fields = wrapper.findAllComponents({ name: 'FrField' });
    const valuesField = fields.find((field) => field.props('name') === 'filterValues_1');
    await valuesField.vm.$emit('modelCompat:input', values);
    await flushPromises();
  }

  it('loads distinct values when an attribute is selected', async () => {
    await mountComponent();
    await selectAttribute(1, 'department');

    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('department', {});
    expect(wrapper.vm.filterRows[0].valueOptions).toEqual([
      { text: 'Engineering', value: 'Engineering' },
      { text: 'Sales', value: 'Sales' },
      { text: 'Marketing', value: 'Marketing' },
    ]);
    expect(wrapper.vm.filterRows[0].values).toEqual([]); // previous selections cleared on attribute change
  });

  it('fetches values with the attribute the user just selected, never the previous one', async () => {
    await mountComponent();

    // First selection: city. Before the stale-read fix this produced NO values call at all.
    await selectAttribute(1, 'city');
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('city', {});

    // Changing to accountStatus must fire for accountStatus, not city (the previous value)
    RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockClear();
    await selectAttribute(1, 'accountStatus');
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledTimes(1);
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('accountStatus', {});
  });

  it('re-queries the values endpoint with the typed prefix after the debounce', async () => {
    jest.useFakeTimers();
    try {
      await mountComponent();
      await selectAttribute(1, 'department');
      RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockClear();
      // the prefix query only matches one of the three preloaded values
      RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockResolvedValue({
        data: { column: 'department', values: ['Engineering'] },
      });

      const valuesField = wrapper.findAllComponents({ name: 'FrField' })
        .find((field) => field.props('name') === 'filterValues_1');
      // emit the search-change event the underlying MultiselectBase emits as the user types
      valuesField.findComponent({ name: 'MultiSelect' }).vm.$emit('search-change', 'Eng');
      jest.advanceTimersByTime(500);
      await flushPromises();

      // the API's q param prefix-matches the typed text
      expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('department', { q: 'Eng' });
      // the prefix result replaces the list — unrelated values must not linger
      expect(wrapper.vm.filterRows[0].valueOptions.map((option) => option.value)).toEqual(['Engineering']);
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps already-selected values in the options when a prefix search replaces the list', async () => {
    jest.useFakeTimers();
    try {
      await mountComponent();
      await selectAttribute(1, 'department');
      // select Sales, then type a prefix that no longer matches it
      await fillFirstRow('department', ['Sales']);
      RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockClear();
      RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockResolvedValue({
        data: { column: 'department', values: ['Engineering'] },
      });

      const valuesField = wrapper.findAllComponents({ name: 'FrField' })
        .find((field) => field.props('name') === 'filterValues_1');
      valuesField.findComponent({ name: 'MultiSelect' }).vm.$emit('search-change', 'Eng');
      jest.advanceTimersByTime(500);
      await flushPromises();

      // the selected tag's option survives so it keeps rendering
      expect(wrapper.vm.filterRows[0].valueOptions.map((option) => option.value))
        .toEqual(['Sales', 'Engineering']);
    } finally {
      jest.useRealTimers();
    }
  });

  it('collapses rapid keystrokes into one debounced values request', async () => {
    jest.useFakeTimers();
    try {
      await mountComponent();
      await selectAttribute(1, 'department');
      RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockClear();

      const valuesField = wrapper.findAllComponents({ name: 'FrField' })
        .find((field) => field.props('name') === 'filterValues_1');
      const multiselect = valuesField.findComponent({ name: 'MultiSelect' });
      multiselect.vm.$emit('search-change', 'E');
      multiselect.vm.$emit('search-change', 'En');
      multiselect.vm.$emit('search-change', 'Eng');
      jest.advanceTimersByTime(500);
      await flushPromises();

      expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledTimes(1);
      expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('department', { q: 'Eng' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not offer free-typed custom values — only options returned by the API', async () => {
    await mountComponent();
    await selectAttribute(1, 'department');

    const valuesField = wrapper.findAllComponents({ name: 'FrField' })
      .find((field) => field.props('name') === 'filterValues_1');
    // the underlying multiselect is not taggable: typed text never becomes an option
    const multiselect = valuesField.findComponent({ name: 'MultiSelect' });
    expect(multiselect.props('taggable')).toBe(false);

    // external search mode: typed text cannot resolve to an option and must not be committed
    multiselect.vm.$emit('search-change', 'Not A Real Value');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filterRows[0].values).toEqual([]);
  });

  it('hides the search button until a filter row has values', async () => {
    await mountComponent();
    expect(wrapper.find('[data-testid="search-population-button"]').exists()).toBe(false);

    await fillFirstRow();
    expect(wrapper.find('[data-testid="search-population-button"]').exists()).toBe(true);
  });

  /** Mock the preview endpoint returning the given identities */
  function mockPreview(identities, total = identities.length) {
    RoleMiningSessionApi.getPopulationPreview.mockResolvedValue({
      data: {
        total, page: 1, pageSize: 10, identities,
      },
    });
  }

  const matchedUsers = [
    {
      id: 'u1', userName: 'jdoe', givenName: 'Jane', sn: 'Doe', mail: 'jdoe@example.com', accountStatus: 'active', department: 'Engineering',
    },
    {
      id: 'u2', userName: 'asmith', givenName: 'Alex', sn: 'Smith', mail: 'asmith@example.com', accountStatus: 'active', department: 'Sales',
    },
  ];

  it('previews the population via the popRoleMining preview endpoint and renders the matches', async () => {
    mockPreview(matchedUsers);
    await mountComponent();
    await fillFirstRow('department', ['Engineering', 'Sales']);

    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    // filterCriteria is the same flat map the create-session body takes
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith({
      filterCriteria: { department: ['Engineering', 'Sales'] },
      page: 1,
      pageSize: 10,
    });
    const text = wrapper.text();
    expect(text).toContain('jdoe');
    expect(text).toContain('Jane'); // givenName renders in the name column
    expect(text).toContain('jdoe@example.com');
    // the selected attribute renders as its own column, header + per-row values
    expect(text).toContain('department');
    expect(text).toContain('Sales');
    expect(text).not.toContain(i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.noUsersMatch'));
  });

  it('renders the results table inside a card', async () => {
    mockPreview([
      {
        id: 'u1', userName: 'jdoe', givenName: 'Jane', sn: 'Doe', mail: 'j@example.com',
      },
    ]);
    await mountComponent();
    await fillFirstRow();

    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    const resultsTable = wrapper.find('table');
    expect(resultsTable.exists()).toBe(true);
    expect(resultsTable.element.closest('.card')).not.toBeNull();
  });

  it('renders the page as Select Identities with the filter rows and search button in their own card', async () => {
    await mountComponent();
    // renamed page copy
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.title'));
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.subtitle'));

    await fillFirstRow();
    // the filter rows and the search button share one card, separate from the results card
    const searchButton = wrapper.find('[data-testid="search-population-button"]');
    const filterField = wrapper.find('[data-testid="fr-field-filterAttribute_1"]');
    expect(filterField.element.closest('.card')).not.toBeNull();
    expect(searchButton.element.closest('.card')).not.toBeNull();
    expect(searchButton.element.closest('.card')).toBe(filterField.element.closest('.card'));
  });

  it('filters the loaded search results client-side from the results search bar', async () => {
    mockPreview(matchedUsers);
    await mountComponent();
    await fillFirstRow('department', ['Engineering', 'Sales']);
    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-testid="search-results-input"]').exists()).toBe(true);

    // typing filters the loaded rows without refetching
    await wrapper.find('[data-testid="search-results-input"] input').setValue('jdoe');
    await wrapper.vm.$nextTick();
    const keys = wrapper.findAll('tbody tr td:nth-child(2)').map((cell) => cell.text());
    expect(keys).toEqual(['jdoe']);
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledTimes(1);

    // clearing restores all rows
    await wrapper.find('[data-testid="search-results-input"] input').setValue('');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr').length).toBe(2);
  });

  it('searches only the visible result columns and matches the name column as rendered', async () => {
    mockPreview(matchedUsers);
    await mountComponent();
    await fillFirstRow('department', ['Engineering', 'Sales']);
    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    // department is a visible column: its value matches
    await wrapper.find('[data-testid="search-results-input"] input').setValue('Engineering');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr').length).toBe(1);

    // the composite name column matches on rendered "givenName sn", not on user.name
    await wrapper.find('[data-testid="search-results-input"] input').setValue('Jane Doe');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr').length).toBe(1);

    // givenName/sn are not columns of their own: an unrendered value never matches.
    // 'jdoe@example.com' is the mail column, 'Smith' only appears inside the name
    // column of u2 (via sn) — both must match through their visible columns.
    await wrapper.find('[data-testid="search-results-input"] input').setValue('Smith');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr td:nth-child(2)').map((cell) => cell.text())).toEqual(['asmith']);
  });

  it('sends one filterCriteria entry per filled row, values as an array', async () => {
    mockPreview([]);
    await mountComponent();
    await fillFirstRow('department', ['Engineering']);

    wrapper.vm.addFilterRow();
    await wrapper.vm.$nextTick();
    await selectAttribute(2, 'country');
    const fields = wrapper.findAllComponents({ name: 'FrField' });
    const secondValuesField = fields.find((field) => field.props('name') === 'filterValues_2');
    await secondValuesField.vm.$emit('modelCompat:input', ['USA']);
    await flushPromises();

    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith(expect.objectContaining({
      filterCriteria: { department: ['Engineering'], country: ['USA'] },
    }));
  });

  it('renders the no-results state when the preview returns no users', async () => {
    mockPreview([]);
    await mountComponent();
    await fillFirstRow();

    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.noUsersMatch'));
  });

  it('paginates the search results server-side and restarts from page 1 on a new search', async () => {
    mockPreview(matchedUsers, 11);
    await mountComponent();
    await fillFirstRow();
    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    // more than one page of results: standard pagination renders with the results-count dropdown
    expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(true);
    expect(wrapper.find('#dropdown').exists()).toBe(true);
    // moving to page 2 requests the preview's 1-based page 2, showing the table's busy spinner in flight
    RoleMiningSessionApi.getPopulationPreview.mockClear();
    let resolvePageTwo;
    RoleMiningSessionApi.getPopulationPreview.mockImplementation(() => new Promise((resolve) => { resolvePageTwo = resolve; }));
    wrapper.findComponent({ name: 'Pagination' }).vm.$emit('input', 2);
    await flushPromises();
    await wrapper.vm.$nextTick();
    // BTable renders the #table-busy slot row while :busy is true
    expect(wrapper.find('tbody .b-table-busy-slot .spinner-border').exists()).toBe(true);
    resolvePageTwo({
      data: {
        total: 11, page: 2, pageSize: 10, identities: matchedUsers,
      },
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));

    // changing the page size reloads from the first page at the new size
    RoleMiningSessionApi.getPopulationPreview.mockClear();
    RoleMiningSessionApi.getPopulationPreview.mockResolvedValue({
      data: {
        total: 11, page: 1, pageSize: 20, identities: matchedUsers,
      },
    });
    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('on-page-size-change', 20);
    await flushPromises();
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      pageSize: 20,
    }));

    // re-running the search resets to the first page instead of keeping the stale page
    RoleMiningSessionApi.getPopulationPreview.mockClear();
    RoleMiningSessionApi.getPopulationPreview.mockResolvedValue({
      data: {
        total: 11, page: 1, pageSize: 10, identities: matchedUsers,
      },
    });
    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('keeps the pagination controls visible when results fit within one page', async () => {
    mockPreview([matchedUsers[0]]);
    await mountComponent();
    await fillFirstRow();
    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    // even below the page size the controls render, keeping the page-size selector reachable
    expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(true);
    expect(wrapper.find('.pagination').exists()).toBe(true);
  });

  it('shows an error notification when the preview search fails', async () => {
    RoleMiningSessionApi.getPopulationPreview.mockRejectedValue(new Error('failed'));
    await mountComponent();
    await fillFirstRow();

    await wrapper.find('[data-testid="search-population-button"]').trigger('click');
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalled();
  });

  it('pre-fills the mining thresholds with the backend-documented defaults', async () => {
    await mountComponent();
    expect(wrapper.vm.settings).toEqual({
      similarityThreshold: 0.30,
      universalThreshold: 0.90,
      coverageThreshold: 0.80,
      softThreshold: 0.50,
      outlierThreshold: 0.30,
      birthrightCooccurrenceThreshold: 0.95,
      maxRoles: 25,
      minGroupSize: 30,
    });
  });

  it('disables Discover Roles until a filter row has an attribute and values', async () => {
    await mountComponent();
    expect(wrapper.vm.canDiscover).toBe(false);

    wrapper.vm.filterRows[0].attribute = 'department';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.canDiscover).toBe(false); // attribute but no values

    wrapper.vm.filterRows[0].values = ['Engineering'];
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.canDiscover).toBe(true);
  });

  it('keeps at least one filter row when removing, and adds new rows', async () => {
    await mountComponent();
    expect(wrapper.vm.filterRows.length).toBe(1);
    wrapper.vm.removeFilterRow(wrapper.vm.filterRows[0]);
    expect(wrapper.vm.filterRows.length).toBe(1); // never drops below one

    wrapper.vm.addFilterRow();
    expect(wrapper.vm.filterRows.length).toBe(2);
  });

  it('clears a row\'s values when its attribute changes', async () => {
    await mountComponent();
    await selectAttribute(1, 'department');
    const row = wrapper.vm.filterRows[0];
    row.values = ['Engineering'];

    await selectAttribute(1, 'accountStatus');

    expect(row.values).toEqual([]); // stale selections from the previous attribute are dropped
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('accountStatus', {});
  });

  it('preserves a filled sibling row\'s values when an empty row before it is removed', async () => {
    await mountComponent();
    wrapper.vm.addFilterRow(); // rows: [empty, empty]
    await fillFirstRow('department', ['Engineering']); // rows: [filled, empty]

    // remove the FILLED first row: the surviving (previously second) row is untouched,
    // and positional diffing must not wipe or refetch it
    const secondRow = wrapper.vm.filterRows[1];
    secondRow.attribute = 'city';
    await wrapper.vm.$nextTick(); // let the attribute-change watcher flush before setting values
    secondRow.values = ['London'];
    await wrapper.vm.$nextTick();
    RoleMiningSessionApi.getRoleMiningUserPropertyValues.mockClear();
    wrapper.vm.removeFilterRow(wrapper.vm.filterRows[0]);
    await flushPromises();

    expect(wrapper.vm.filterRows).toHaveLength(1);
    expect(wrapper.vm.filterRows[0].attribute).toBe('city');
    expect(wrapper.vm.filterRows[0].values).toEqual(['London']);
    // the removal itself triggers no options re-fetch for the surviving row
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).not.toHaveBeenCalled();
  });

  it('cancels the removed row\'s pending debounce and drops it from the search map', async () => {
    await mountComponent();
    wrapper.vm.addFilterRow();
    await fillFirstRow('department', ['Engineering']);
    const removedRow = wrapper.vm.filterRows[0];

    wrapper.vm.removeFilterRow(removedRow);

    expect(wrapper.vm.debouncedValueSearches.has(removedRow.uniqueIndex)).toBe(false);
  });

  it('pre-populates settings and filter rows from a duplicated session and auto-runs the search', async () => {
    RoleMiningSessionApi.getPopulationPreview.mockResolvedValue({
      data: {
        total: 1,
        page: 1,
        pageSize: 10,
        identities: [
          {
            id: 'u1', userName: 'jdoe', givenName: 'Jane', sn: 'Doe', mail: 'j@example.com', accountStatus: 'active', department: 'Engineering',
          },
        ],
      },
    });
    const duplicatedSession = {
      id: 'source-session',
      parameters: {
        roleType: 'job',
        filterCriteria: { department: ['Engineering'] },
        similarityThreshold: 0.45,
        maxRoles: 10,
        minGroupSize: 5,
      },
    };
    await mountComponent({ historyState: { duplicatedSession } });

    // settings restored from the parameters map, defaults untouched elsewhere
    expect(wrapper.vm.settings.similarityThreshold).toBe(0.45);
    expect(wrapper.vm.settings.maxRoles).toBe(10);
    expect(wrapper.vm.settings.minGroupSize).toBe(5);
    expect(wrapper.vm.settings.universalThreshold).toBe(0.90);

    // one filter row per criteria attribute, values pre-selected
    expect(wrapper.vm.filterRows.length).toBe(1);
    expect(wrapper.vm.filterRows[0].attribute).toBe('department');
    expect(wrapper.vm.filterRows[0].values).toEqual(['Engineering']);

    // values endpoint consulted to enrich the row's options; pre-selected values survive
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('department', {});
    expect(wrapper.vm.filterRows[0].valueOptions.map((option) => option.value))
      .toEqual(expect.arrayContaining(['Engineering']));

    // the population preview auto-fired with the restored criteria
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith(expect.objectContaining({
      filterCriteria: { department: ['Engineering'] },
      page: 1,
    }));
    expect(wrapper.text()).toContain('jdoe');
  });

  it('pre-populates multiple filter rows from a duplicated session with several criteria', async () => {
    RoleMiningSessionApi.getPopulationPreview.mockResolvedValue({
      data: {
        total: 0, page: 1, pageSize: 10, identities: [],
      },
    });
    const duplicatedSession = {
      id: 'source-session',
      parameters: {
        roleType: 'birthright',
        filterCriteria: { department: ['Engineering', 'Sales'], country: ['USA'] },
      },
    };
    await mountComponent({ historyState: { duplicatedSession } });

    expect(wrapper.vm.filterRows.length).toBe(2);
    expect(wrapper.vm.filterRows[0].values).toEqual(['Engineering', 'Sales']);
    expect(wrapper.vm.filterRows[1].values).toEqual(['USA']);
    // both rows' values were enriched from the endpoint
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('department', {});
    expect(RoleMiningSessionApi.getRoleMiningUserPropertyValues).toHaveBeenCalledWith('country', {});
    // the preview carries the restored rows as one flat criteria map
    expect(RoleMiningSessionApi.getPopulationPreview).toHaveBeenCalledWith(expect.objectContaining({
      filterCriteria: { department: ['Engineering', 'Sales'], country: ['USA'] },
    }));
  });

  it('leaves the page empty when the duplicated session has no parameters', async () => {
    await mountComponent({ historyState: { duplicatedSession: { id: 'empty' } } });
    expect(wrapper.vm.filterRows.length).toBe(1);
    expect(wrapper.vm.filterRows[0].attribute).toBeNull();
    expect(RoleMiningSessionApi.getPopulationPreview).not.toHaveBeenCalled();
  });

  it('flags an invalid softThreshold/coverageThreshold combination and blocks submit', async () => {
    await mountComponent();
    wrapper.vm.filterRows[0].attribute = 'department';
    wrapper.vm.filterRows[0].values = ['Engineering'];
    wrapper.vm.settings.softThreshold = 0.9;
    wrapper.vm.settings.coverageThreshold = 0.8;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.softThresholdInvalid).toBe(true);
    expect(wrapper.vm.canDiscover).toBe(false);
  });

  it('creates and runs a birthright session from the filter rows then navigates to the sessions list', async () => {
    RoleMiningSessionApi.createRoleMiningSession.mockResolvedValue({ data: { sessionId: 'session-1' } });
    RoleMiningSessionApi.runRoleMiningSession.mockResolvedValue({});
    await mountComponent();

    await fillFirstRow('department', ['Engineering', 'Sales']);
    await wrapper.vm.discoverRoles('birthright');

    expect(RoleMiningSessionApi.createRoleMiningSession).toHaveBeenCalledWith(expect.objectContaining({
      roleType: 'birthright',
      // sessions API takes filterCriteria as a flat map of attribute -> array of values
      filterCriteria: { department: ['Engineering', 'Sales'] },
      similarityThreshold: 0.30,
    }));
    // the sessionId returned by POST /sessions is what gets passed to the run endpoint
    expect(RoleMiningSessionApi.runRoleMiningSession).toHaveBeenCalledWith('session-1');
    expect(displayNotification).toHaveBeenCalledWith('success', expect.any(String));
    expect(routerPush).toHaveBeenCalledWith({ name: 'PopulationRoleMiningSessions' });
  });

  it('shows a spinner on the Discover Roles button while the session is being created', async () => {
    let resolveCreate;
    RoleMiningSessionApi.createRoleMiningSession.mockReturnValue(new Promise((resolve) => { resolveCreate = resolve; }));
    await mountComponent();

    await fillFirstRow();
    const promise = wrapper.vm.discoverRoles('birthright');
    await wrapper.vm.$nextTick();

    // the dropdown disables and its label swaps for a spinner while in flight
    const dropdown = wrapper.find('[data-testid="discover-roles-button"]');
    expect(dropdown.find('button').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain(i18n.global.t('common.loadingEtc'));

    resolveCreate({ data: { sessionId: 'session-1' } });
    await promise;
    await flushPromises();
  });

  it('shows a specific error when the session limit (HTTP 429) is reached', async () => {
    const error = { response: { status: 429 } };
    RoleMiningSessionApi.createRoleMiningSession.mockRejectedValue(error);
    await mountComponent();

    await fillFirstRow();
    await wrapper.vm.discoverRoles('job');

    expect(showErrorMessage).toHaveBeenCalledWith(error, i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.sessionLimitError'));
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('shows a generic error notification when session creation fails for another reason', async () => {
    const error = new Error('failed');
    RoleMiningSessionApi.createRoleMiningSession.mockRejectedValue(error);
    await mountComponent();

    await fillFirstRow();
    await wrapper.vm.discoverRoles('job');

    expect(showErrorMessage).toHaveBeenCalledWith(error, i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.failedToStartSession'));
  });

  it('passes accessibility checks', async () => {
    await mountComponent();
    // FrThresholdSlider's underlying vue-slider-component handle has no accessible name
    // (no aria-label/aria-labelledby support) - a pre-existing gap in that shared component,
    // also present in its only other consumer (platform-admin Recommendations.vue) which has
    // no a11y test coverage either. Tracked separately from this page's own accessibility.
    await runA11yTest(wrapper, { overrideRules: { rules: { 'aria-input-field-name': { enabled: false } } } });
  });
});
