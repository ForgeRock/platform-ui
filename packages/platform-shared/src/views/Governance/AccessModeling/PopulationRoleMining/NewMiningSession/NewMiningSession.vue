<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5 mb-5">
      <FrHeader
        :title="$t('governance.accessModeling.populationRoleMining.newSessionPage.title')"
        :subtitle="$t('governance.accessModeling.populationRoleMining.newSessionPage.subtitle')" />
      <div class="d-flex justify-content-end align-items-center mt-n5 mb-4">
        <BButton
          variant="outline-secondary"
          class="mr-3"
          data-testid="mining-settings-button"
          @click="showSettingsModal = true">
          <FrIcon
            icon-class="mr-2"
            name="settings" />
          {{ $t('governance.accessModeling.populationRoleMining.newSessionPage.settingsButton') }}
        </BButton>
        <BDropdown
          data-testid="discover-roles-button"
          :disabled="isSaving || !canDiscover"
          variant="primary"
          right>
          <template #button-content>
            <template v-if="isSaving">
              <FrSpinner
                size="sm"
                class="spinner-border-sm mr-2"
                button-spinner />
              {{ $t('common.loadingEtc') }}
            </template>
            <template v-else>
              {{ $t('governance.accessModeling.populationRoleMining.newSessionPage.discoverRoles') }}
            </template>
          </template>
          <BDropdownItemButton
            :disabled="isSaving"
            @click="discoverRoles('birthright')">
            {{ $t('governance.accessModeling.populationRoleMining.mode.birthright') }}
          </BDropdownItemButton>
          <BDropdownItemButton
            :disabled="isSaving"
            @click="discoverRoles('job')">
            {{ $t('governance.accessModeling.populationRoleMining.mode.job') }}
          </BDropdownItemButton>
        </BDropdown>
      </div>

      <h2 class="h5 mb-3">
        {{ $t('governance.accessModeling.populationRoleMining.newSessionPage.filterIdentities') }}
      </h2>
      <BCard class="mb-4">
        <BRow
          v-for="filterRow in filterRows"
          :key="filterRow.uniqueIndex"
          class="mb-3"
          align-v="start"
          no-gutters>
          <BCol
            md="4"
            class="pr-3">
            <!-- The sr-only label supplies the accessible name without changing the
              visual design; the placeholder stays visible as a hint only (WCAG 3.3.2). -->
            <label
              :id="`filter-attribute-${filterRow.uniqueIndex}-label`"
              :for="`filter-attribute-${filterRow.uniqueIndex}`"
              class="sr-only">
              {{ $t('governance.accessModeling.populationRoleMining.newSessionPage.selectAttribute') }}
            </label>
            <FrField
              v-model="filterRow.attribute"
              type="select"
              :disabled="isSaving"
              :id="`filter-attribute-${filterRow.uniqueIndex}`"
              :name="`filterAttribute_${filterRow.uniqueIndex}`"
              :input-labelledby="`filter-attribute-${filterRow.uniqueIndex}-label`"
              :options="attributeOptions"
              :placeholder="$t('governance.accessModeling.populationRoleMining.newSessionPage.selectAttribute')">
              <template #option="{ option }">
                <!-- single wrapper: the option row is display:flex, so sibling text and
                  span would become separate flex items and stack -->
                <span>
                  {{ option.text }}
                  <span
                    v-if="attributeKey(option)"
                    class="text-muted font-italic">
                    ({{ attributeKey(option) }})
                  </span>
                </span>
              </template>
            </FrField>
          </BCol>
          <BCol
            md="5"
            class="pr-3">
            <label
              :id="`filter-values-${filterRow.uniqueIndex}-label`"
              :for="`filter-values-${filterRow.uniqueIndex}`"
              class="sr-only">
              {{ $t('governance.accessModeling.populationRoleMining.newSessionPage.selectValues') }}
            </label>
            <FrField
              v-model="filterRow.values"
              type="multiselect"
              :internal-search="false"
              :disabled="isSaving || !filterRow.attribute"
              :id="`filter-values-${filterRow.uniqueIndex}`"
              :name="`filterValues_${filterRow.uniqueIndex}`"
              :input-labelledby="`filter-values-${filterRow.uniqueIndex}-label`"
              :options="filterRow.valueOptions"
              :placeholder="$t('governance.accessModeling.populationRoleMining.newSessionPage.selectValues')"
              :validation="filterRow.attribute ? { required: true } : ''"
              @search-change="debouncedValueSearch(filterRow, $event)" />
          </BCol>
          <BButton
            variant="outline-secondary"
            class="size-36 mr-2 d-flex align-items-center justify-content-center"
            :disabled="isSaving || filterRows.length === 1"
            :aria-label="$t('governance.accessModeling.populationRoleMining.newSessionPage.removeFilter')"
            :data-testid="`remove-filter-${filterRow.uniqueIndex}`"
            @click="removeFilterRow(filterRow)">
            <FrIcon name="close" />
          </BButton>
          <BButton
            variant="outline-secondary"
            class="size-36 ml-2 d-flex align-items-center justify-content-center"
            :disabled="isSaving"
            :aria-label="$t('governance.accessModeling.populationRoleMining.newSessionPage.addFilter')"
            :data-testid="`add-filter-${filterRow.uniqueIndex}`"
            @click="addFilterRow">
            <FrIcon name="add" />
          </BButton>
        </BRow>

        <div
          v-if="canSearch"
          class="d-flex justify-content-end mb-0">
          <FrButtonWithSpinner
            variant="primary"
            testid="search-population-button"
            :button-text="$t('governance.accessModeling.populationRoleMining.newSessionPage.search')"
            :disabled="isSearching"
            :show-spinner="isSearching"
            :spinner-text="$t('governance.accessModeling.populationRoleMining.newSessionPage.searching')"
            @click="runSearch" />
        </div>
      </BCard>

      <FrSpinner
        v-if="isSearching && !searchResults.length"
        class="py-5" />
      <BCard
        v-else-if="searchResults.length"
        no-body>
        <BCardBody class="pb-3">
          <FrSearchInput
            v-model="resultsSearchQuery"
            class="col-12 col-md-4 p-0"
            data-testid="search-results-input"
            :placeholder="$t('common.search')" />
        </BCardBody>
        <BTable
          class="border-top mb-0"
          responsive
          :busy="isSearching"
          :fields="searchResultFields"
          :items="filteredSearchResults">
          <template #table-busy>
            <FrSpinner class="py-4" />
          </template>
          <template #cell(name)="{ item }">
            <span class="text-truncate">{{ [item.givenName, item.sn].filter(Boolean).join(' ') || item.name || item.userName }}</span>
          </template>
          <template
            v-for="attribute in searchedAttributes"
            :key="attribute"
            #[`cell(${attribute})`]="{ item }">
            {{ formatCellValue(item[attribute]) }}
          </template>
          <template #cell(mail)="{ item }">
            {{ item.mail || blankValueIndicator }}
          </template>
          <template #cell(accountStatus)="{ item }">
            {{ item.accountStatus || blankValueIndicator }}
          </template>
        </BTable>
        <!-- shown whenever there is at least one result, even below one page, so the
          page-size selector stays reachable -->
        <FrPagination
          v-if="totalSearchResults"
          class="p-3"
          :value="searchPage"
          :per-page="searchPageSize"
          :total-rows="totalSearchResults"
          @input="handleSearchPageChange"
          @on-page-size-change="handleSearchPageSizeChange" />
      </BCard>
      <BCard
        v-else-if="searched && !isSearching">
        <FrNoData
          :card="false"
          icon="person_search"
          class="py-3 mb-0"
          :subtitle="$t('governance.accessModeling.populationRoleMining.newSessionPage.noUsersMatch')" />
      </BCard>

      <div
        v-if="!filterRows.some((row) => row.values.length)"
        class="text-center text-muted mt-5 pt-5">
        <FrIcon
          icon-class="md-72 opacity-20"
          name="grid_view" />
        <p class="mt-2">
          {{ $t('governance.accessModeling.populationRoleMining.newSessionPage.emptyFilterHint') }}
        </p>
      </div>

      <BModal
        v-model="showSettingsModal"
        size="lg"
        centered
        no-close-on-backdrop
        :title="$t('governance.accessModeling.populationRoleMining.newSessionPage.settingsTitle')">
        <p class="text-muted">
          <small>{{ $t('governance.accessModeling.populationRoleMining.newSessionPage.settingsSubtitle') }}</small>
        </p>
        <BRow>
          <BCol
            v-for="threshold in sliderThresholds"
            :key="threshold.key"
            md="6"
            class="mb-4">
            <FrThresholdSlider
              :value="settings[threshold.key]"
              :label="$t(`governance.accessModeling.populationRoleMining.newSessionPage.settings.${threshold.key}`)"
              show-label-count
              hide-labels
              :min="0"
              :max="1"
              :marks="[0, 1]"
              :interval="0.01"
              @input="settings[threshold.key] = $event" />
            <small class="text-muted">{{ $t(`governance.accessModeling.tooltips.populationRoleMining.${threshold.key}`) }}</small>
          </BCol>
        </BRow>
        <BRow>
          <BCol
            v-for="numberField in numberThresholds"
            :key="numberField.key"
            md="6">
            <FrField
              v-model="settings[numberField.key]"
              type="number"
              :validation="{ min_value: { min: 1 } }"
              :name="$t(`governance.accessModeling.populationRoleMining.newSessionPage.settings.${numberField.key}`)"
              :label="$t(`governance.accessModeling.populationRoleMining.newSessionPage.settings.${numberField.key}`)" />
            <small class="text-muted">{{ $t(`governance.accessModeling.tooltips.populationRoleMining.${numberField.key}`) }}</small>
          </BCol>
        </BRow>
        <div
          v-if="softThresholdInvalid"
          class="text-danger mt-2">
          <small>{{ $t('governance.accessModeling.populationRoleMining.newSessionPage.softThresholdError') }}</small>
        </div>
        <template #modal-footer>
          <BButton
            variant="link"
            @click="showSettingsModal = false">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            :disabled="softThresholdInvalid"
            @click="showSettingsModal = false">
            {{ $t('common.save') }}
          </BButton>
        </template>
      </BModal>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BButton,
  BCard,
  BCardBody,
  BCol,
  BContainer,
  BDropdown,
  BDropdownItemButton,
  BModal,
  BRow,
  BTable,
} from 'bootstrap-vue';
import {
  computed, nextTick, onMounted, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrThresholdSlider from '@forgerock/platform-shared/src/components/governance/ThresholdSlider';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  createRoleMiningSession,
  getPopulationPreview,
  getRoleMiningUserProperties,
  getRoleMiningUserPropertyValues,
  runRoleMiningSession,
} from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import { getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

/**
 * Starts a new population-based role mining session: an analyst defines a group of identities
 * with attribute/value filter rows, optionally tunes mining settings, and picks a mining mode
 * (birthright or job roles) from the Discover Roles action.
 * @component NewMiningSession
 */

// Defaults per the population-based role mining API spec (IGA-3955).
const DEFAULT_SETTINGS = {
  similarityThreshold: 0.30,
  universalThreshold: 0.90,
  coverageThreshold: 0.80,
  softThreshold: 0.50,
  outlierThreshold: 0.30,
  birthrightCooccurrenceThreshold: 0.95,
  maxRoles: 25,
  minGroupSize: 30,
};

const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();

let nextFilterIndex = 0;

/**
 * Build a new empty filter row
 * @returns {Object} filter row with a unique index
 */
function createFilterRow() {
  nextFilterIndex += 1;
  return {
    uniqueIndex: nextFilterIndex,
    attribute: null,
    values: [],
    valueOptions: [],
  };
}

const attributeOptions = ref([]);
const filterRows = ref([createFilterRow()]);
const settings = ref({ ...DEFAULT_SETTINGS });
const isSaving = ref(false);
const showSettingsModal = ref(false);
const isSearching = ref(false);
const searched = ref(false);
const searchResults = ref([]);
const totalSearchResults = ref(0);
const searchPage = ref(1);
const searchPageSize = ref(10);
// Client-side filter over the loaded search results
const resultsSearchQuery = ref('');
// Attributes selected in the filter rows at the time of the last search - each becomes a
// column in the results table.
const searchedAttributes = ref([]);

const searchResultFields = computed(() => {
  const baseFields = [
    { key: 'name', label: i18n.global.t('common.name') },
    { key: 'userName', label: i18n.global.t('common.user.userName') },
  ];
  const attributeFields = searchedAttributes.value
    .filter((attribute) => !['name', 'userName', 'mail', 'accountStatus'].includes(attribute))
    .map((attribute) => ({
      key: attribute,
      label: attribute,
    }));
  return [
    ...baseFields,
    ...attributeFields,
    { key: 'mail', label: i18n.global.t('common.email') },
    { key: 'accountStatus', label: i18n.global.t('common.status') },
  ];
});

const filteredSearchResults = computed(() => {
  const query = resultsSearchQuery.value.trim().toLowerCase();
  if (!query) return searchResults.value;
  // search only the table's visible columns; the composite name column matches
  // the way its cell renders (givenName + sn)
  const searchableKeys = searchResultFields.value.map((field) => field.key);
  return searchResults.value.filter((user) => searchableKeys.some((key) => {
    let value = user[key];
    if (key === 'name') {
      value = [user.givenName, user.sn].filter(Boolean).join(' ') || user.userName;
    }
    return value && String(
      typeof value === 'object' ? (value.displayName || value.name || value.id || '') : value,
    ).toLowerCase().includes(query);
  }));
});

const sliderThresholds = [
  { key: 'similarityThreshold' },
  { key: 'universalThreshold' },
  { key: 'coverageThreshold' },
  { key: 'softThreshold' },
  { key: 'outlierThreshold' },
  { key: 'birthrightCooccurrenceThreshold' },
];

const numberThresholds = [
  { key: 'maxRoles' },
  { key: 'minGroupSize' },
];

const softThresholdInvalid = computed(() => Number(settings.value.softThreshold) >= Number(settings.value.coverageThreshold));

const canDiscover = computed(() => (
  filterRows.value.some((row) => row.attribute && row.values.length)
  && !softThresholdInvalid.value
  && !isSaving.value
));

const hasFilterValues = computed(() => filterRows.value.some((row) => row.values.length));

const canSearch = computed(() => (
  hasFilterValues.value
  && !softThresholdInvalid.value
  && !isSaving.value
));

/**
 * Build the population filter criteria from the rows that have an attribute and values
 * @returns {Array} filter criteria, one entry per filled row
 */
function buildFilterCriteria() {
  return filterRows.value
    .filter((row) => row.attribute && row.values.length)
    .map((row) => ({
      field: row.attribute,
      operator: 'in',
      values: row.values.map((selected) => selected.value ?? selected),
    }));
}

/**
 * The raw attribute key for an option, shown in italics in parentheses after the display
 * name. Only shown when the display name differs from the key.
 * @param {Object} option an attribute option ({ text, value })
 * @returns {String} the attribute key, or '' when it should not be shown
 */
function attributeKey(option) {
  return option.value !== option.text ? option.value : '';
}

/**
 * Load the identity attributes usable as population filter criteria. The API returns the
 * attribute names under a `columns` key, e.g. { columns: ['accountStatus', 'mail', ...] }.
 * Display names come from the standard user filter schema (the same source the other
 * governance pickers use); the option slot renders them as "DisplayName (key)" with the
 * key italicized and gray.
 */
async function loadAttributeOptions() {
  try {
    const [{ data }, { data: schema }] = await Promise.all([
      getRoleMiningUserProperties(),
      getFilterSchema(),
    ]);
    const schemaAttributes = new Map((schema?.user || []).map((attribute) => [attribute.key, attribute.displayName]));
    // only offer attributes the filter schema knows - the schema supplies the display name;
    // alphabetized by display name so the picker is easy to scan
    attributeOptions.value = (data?.columns || [])
      .filter((column) => schemaAttributes.has(column))
      .map((column) => ({
        text: schemaAttributes.get(column) || column,
        value: column,
      }))
      .sort((a, b) => a.text.localeCompare(b.text));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedGettingAttributes'));
  }
}

/**
 * Load the distinct values for the selected attribute and offer them in the row's values
 * dropdown. The API returns { column: '<attribute>', values: ['active', ...] } and accepts a
 * `q` prefix-match query. The response replaces the row's options — a type-ahead result must
 * not leave unrelated values visible — except for options the user has already selected,
 * which are retained so their tags keep rendering.
 * @param {Object} filterRow the row whose attribute was selected
 * @param {String} query optional prefix to match values against
 */
// Request tokens so a slow response can never overwrite a newer one's results
let valueOptionsSeq = 0;
let searchSeq = 0;

async function loadValueOptions(filterRow, query) {
  valueOptionsSeq += 1;
  const seq = valueOptionsSeq;
  try {
    const params = query ? { q: query } : {};
    const { data } = await getRoleMiningUserPropertyValues(filterRow.attribute, params);
    if (seq !== valueOptionsSeq) return; // a newer request superseded this one
    const loadedOptions = (data?.values || []).map((value) => ({
      text: value?.displayName || value?.label || (typeof value === 'string' ? value : value?.id),
      value: typeof value === 'string' ? value : value?.id,
    }));
    const resultValues = new Set(loadedOptions.map((option) => option.value));
    const selectedValues = new Set(filterRow.values);
    const retainedSelected = filterRow.valueOptions
      .filter((option) => selectedValues.has(option.value) && !resultValues.has(option.value));
    filterRow.valueOptions = [...retainedSelected, ...loadedOptions];
  } catch (error) {
    if (seq !== valueOptionsSeq) return;
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedGettingValues'));
  }
}

// Per-row debounced value searches, keyed by the row's unique index (which is never reused).
// A module-level map keeps one trailing timer per row so rapid keystrokes collapse into a
// single request instead of one per keystroke.
const debouncedValueSearches = new Map();

/**
 * Re-query the values endpoint as the user types in a values dropdown (prefix match via the
 * API's `q` param), debounced per row. The row is captured so a value change mid-debounce
 * never loads options for the wrong attribute.
 *
 * @param {Object} filterRow the row whose values are being typed into
 * @param {String} query the typed search text
 */
function debouncedValueSearch(filterRow, query) {
  if (!debouncedValueSearches.has(filterRow.uniqueIndex)) {
    debouncedValueSearches.set(filterRow.uniqueIndex, debounce((q) => loadValueOptions(filterRow, q), 500));
  }
  debouncedValueSearches.get(filterRow.uniqueIndex)(query);
}

/**
 * When a row's attribute changes, clear its selected values, cancel any pending type-ahead
 * (its prefix would query the new attribute with the old text), and load the new attribute's
 * distinct values. Watched (rather than listening to the field's input event) because the
 * input event fires before v-model commits, which read the previous selection. Suppressed
 * while a duplicated session's rows are being restored — that flow sets attributes and
 * values together and loads options itself.
 */
const isRestoringSession = ref(false);

watch(
  () => filterRows.value.map((row) => ({ uniqueIndex: row.uniqueIndex, attribute: row.attribute })),
  (newRows, oldRows) => {
    if (isRestoringSession.value) return;
    // Diff per row identity: positional comparison would misfire when rows are
    // added or removed and the array shifts.
    const oldByIndex = new Map((oldRows ?? []).map((row) => [row.uniqueIndex, row.attribute]));
    filterRows.value.forEach((filterRow) => {
      if (filterRow.attribute && filterRow.attribute !== oldByIndex.get(filterRow.uniqueIndex)) {
        const pendingSearch = debouncedValueSearches.get(filterRow.uniqueIndex);
        if (pendingSearch) {
          pendingSearch.cancel();
        }
        filterRow.values = [];
        loadValueOptions(filterRow);
      }
    });
  },
);

function addFilterRow() {
  filterRows.value.push(createFilterRow());
}

/**
 * Remove a filter row, keeping at least one row on the page
 * @param {Object} filterRow the row to remove
 */
function removeFilterRow(filterRow) {
  if (filterRows.value.length > 1) {
    filterRows.value = filterRows.value.filter((row) => row.uniqueIndex !== filterRow.uniqueIndex);
    // cancel a trailing debounce so it can't fire against the detached row
    const pendingSearch = debouncedValueSearches.get(filterRow.uniqueIndex);
    if (pendingSearch) {
      pendingSearch.cancel();
    }
    debouncedValueSearches.delete(filterRow.uniqueIndex);
  }
}

/**
 * Search users matching the current filter criteria via the pop-mining preview
 * endpoint. filterCriteria is the flat attribute→values map the sessions API
 * takes (same shape as the create-session body), so the preview always matches
 * what the session will mine.
 */
async function searchPopulation() {
  searchSeq += 1;
  const seq = searchSeq;
  isSearching.value = true;
  resultsSearchQuery.value = '';
  try {
    const criteria = buildFilterCriteria();
    const { data } = await getPopulationPreview({
      filterCriteria: Object.fromEntries(criteria.map((clause) => [clause.field, clause.values])),
      page: searchPage.value,
      pageSize: searchPageSize.value,
    });
    if (seq !== searchSeq) return; // a newer search superseded this one
    searchResults.value = data?.identities || [];
    totalSearchResults.value = data?.total || 0;
    searchedAttributes.value = criteria.map((clause) => clause.field);
    searched.value = true;
  } catch (error) {
    if (seq !== searchSeq) return;
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.failedSearch'));
    searchResults.value = [];
  } finally {
    if (seq === searchSeq) {
      isSearching.value = false;
    }
  }
}

/**
 * Search users matching the current filter criteria, always from the first page — a new
 * search must not inherit the previous search's page offset.
 */
function runSearch() {
  searchPage.value = 1;
  searchPopulation();
}

/**
 * Update the search page and load that page of results
 * @param {Number} page the page to display
 */
function handleSearchPageChange(page) {
  searchPage.value = page;
  searchPopulation();
}

/**
 * Change the results page size and reload from the first page
 * @param {Number} size the new page size
 */
function handleSearchPageSizeChange(size) {
  searchPageSize.value = size;
  searchPage.value = 1;
  searchPopulation();
}

/**
 * Render a filter-attribute cell value: arrays joined for multi-valued attributes, the blank
 * value indicator for anything missing
 * @param {String|Array|Object} value the attribute value from the user record
 * @returns {String} the value to display
 */
function formatCellValue(value) {
  if (value === null || value === undefined || value === '') {
    return blankValueIndicator;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => formatCellValue(entry)).join(', ');
  }
  if (typeof value === 'object') {
    return value.displayName || value.name || value.id || blankValueIndicator;
  }
  return value;
}

/**
 * Create the session (population filter + settings) and start its mining run
 * @param {String} roleType 'birthright' or 'job'
 */
async function discoverRoles(roleType) {
  isSaving.value = true;
  try {
    // The sessions API takes filterCriteria as a flat object keyed by attribute name with
    // the selected values as an array, e.g. { city: ['London', 'Paris'] } - unlike the
    // search query filter, which uses the array-of-clauses shape.
    const filterCriteria = Object.fromEntries(
      buildFilterCriteria().map((clause) => [clause.field, clause.values]),
    );
    const { data } = await createRoleMiningSession({
      roleType,
      filterCriteria,
      ...settings.value,
    });
    await runRoleMiningSession(data.sessionId);
    displayNotification('success', i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.sessionStarted'));
    router.push({ name: 'PopulationRoleMiningSessions' });
  } catch (error) {
    if (error?.response?.status === 429) {
      showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.sessionLimitError'));
    } else {
      showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.newSessionPage.failedToStartSession'));
    }
  } finally {
    isSaving.value = false;
  }
}

/**
 * Pre-populate the page from a duplicated session (handed over via router state by the
 * sessions table's Duplicate action). The session's `parameters` map carries the mining
 * settings (filterCriteria plus every threshold/limit), and its known attributes are
 * offered as options so the restored selections resolve even if the values endpoint no
 * longer returns them. Rows restored here keep their attribute/value loads serialized
 * through the same loadValueOptions path as interactive selection.
 * @param {Object} duplicatedSession the session to pre-populate from
 */
async function applyDuplicatedSession(duplicatedSession) {
  const parameters = duplicatedSession?.parameters || {};
  if (!Object.keys(parameters).length) return;

  isRestoringSession.value = true;
  try {
    // settings: every recognized threshold/limit key present in parameters
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      if (parameters[key] !== undefined && parameters[key] !== null) {
        settings.value[key] = parameters[key];
      }
    });

    // filter rows: one per filterCriteria attribute, values pre-selected
    const criteria = parameters.filterCriteria || {};
    const attributes = Object.keys(criteria);
    if (!attributes.length) return;

    // offer each duplicated attribute as an option even if it is not in the standard list,
    // so its selections have something to resolve against
    const knownValues = new Set(attributeOptions.value.map((option) => option.value));
    attributes.forEach((attribute) => {
      if (!knownValues.has(attribute)) {
        attributeOptions.value.push({ text: attribute, value: attribute });
      }
    });

    filterRows.value = attributes.map((attribute) => {
      const row = createFilterRow();
      row.attribute = attribute;
      row.values = [...(criteria[attribute] || [])];
      row.valueOptions = [...new Set(row.values)].map((value) => ({ text: value, value }));
      return row;
    });

    // flush the watcher's queued callbacks under the guard before re-enabling it
    await nextTick();

    // enrich each row's options from the values endpoint, one row at a time (the endpoint
    // is per-attribute and rows are independent, but serial keeps the code simple)
    await filterRows.value.reduce(async (previous, row) => {
      await previous;
      await loadValueOptions(row);
    }, Promise.resolve());
  } finally {
    isRestoringSession.value = false;
  }

  if (filterRows.value.some((row) => row.values.length)) {
    runSearch();
  }
}

onMounted(() => {
  setBreadcrumb('/access-modeling/population-role-mining', i18n.global.t('governance.accessModeling.title'));
  loadAttributeOptions();
  applyDuplicatedSession(window.history.state?.duplicatedSession);
});
</script>
