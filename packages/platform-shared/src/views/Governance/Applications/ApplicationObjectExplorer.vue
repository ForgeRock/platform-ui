<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="card-tabs-vertical">
    <div class="d-flex">
      <BNav
        class="border-right object-explorer-nav"
        vertical
        pills>
        <FrMenuItem
          v-for="item in navItems"
          :key="item.key"
          v-bind="item"
          is-nav
          @item-click="selectSelection(Number($event))" />
      </BNav>
      <div
        v-if="activeSelection"
        class="flex-grow-1 overflow-hidden position-inherit">
        <component
          :is="activeSelection.tab.component"
          v-bind="activeSelection.tab.getComponentProps(props.applicationId, props.applicationName, activeSelection.tab.key, activeSelection.subKey)" />
      </div>
    </div>
  </BCard>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BCard, BNav } from 'bootstrap-vue';
import FrMenuItem from '@forgerock/platform-shared/src/components/MenuItem';
import FrAccounts from '@forgerock/platform-shared/src/views/Governance/Accounts/Accounts';
import FrAgentTable from '@forgerock/platform-shared/src/views/Governance/Agents/AgentTable';
import FrEntitlementList from '@forgerock/platform-shared/src/components/governance/LCM/Entitlements/EntitlementList';
import FrResourceList from '@forgerock/platform-shared/src/components/governance/LCM/Resources/ResourceList';
import store from '@/store';

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  applicationName: {
    type: String,
    default: '',
  },
  // The hosting application's resolved logo, for views that brand rows with it
  logoSource: {
    type: String,
    default: '',
  },
  // Optional side-tab slug from the URL (vertical side-tab deep links)
  objectTab: {
    type: String,
    default: '',
  },
  // Optional nested sub-tab slug (e.g. an account type under the Accounts side tab)
  objectSubTab: {
    type: String,
    default: '',
  },
});

const router = useRouter();
const selectedFlatIndex = ref(0);

/**
 * Shared embed props handed to every object-type view: render without the
 * standalone page chrome and scope all queries to this application.
 * @param {string} applicationId The hosting application's id
 * @param {string} applicationName The hosting application's display name
 * @param {string} objectTab The side-tab key the view is hosted under
 * @returns {Object} The props for the embedded view
 */
function embeddedProps(applicationId, applicationName, objectTab) {
  return {
    isEmbedded: true,
    applicationIds: [applicationId],
    applicationName,
    logoSource: props.logoSource,
    objectTab,
  };
}

/**
 * Extensibility point (IGA-4890): adding a future object type to the explorer is a
 * single entry here — key, i18n title, component, optional flag gate, and optionally
 * subOptions to render as a nested group in the side nav — no redesign.
 */
const objectTabs = [
  {
    key: 'accounts',
    titleKey: 'common.accounts',
    component: FrAccounts,
    enabled: () => true,
    // Account-type selectors nested under the Accounts side tab; the selected
    // option is passed down as accountType so Accounts renders table-only
    subOptions: [
      { key: 'all', titleKey: 'governance.accounts.tabs.all' },
      { key: 'correlated', titleKey: 'governance.accounts.tabs.correlated' },
      { key: 'uncorrelated', titleKey: 'governance.accounts.tabs.uncorrelated' },
      { key: 'machine', titleKey: 'governance.accounts.tabs.machine' },
    ],
    getComponentProps: (applicationId, applicationName, objectTab, subKey) => ({
      ...embeddedProps(applicationId, applicationName, objectTab),
      accountType: subKey || 'all',
    }),
  },
  {
    key: 'entitlements',
    titleKey: 'common.entitlements',
    component: FrEntitlementList,
    enabled: () => true,
    getComponentProps: embeddedProps,
  },
  {
    // Agents scoped to this application as a flat table (the full governance
    // Agents view keeps its template tabs and charts on the standalone page)
    key: 'agents',
    titleKey: 'governance.agents.title',
    component: FrAgentTable,
    enabled: () => !!store.state.SharedStore.governanceAgentsEnabled || !!store.state.SharedStore.governanceDevEnabled,
    getComponentProps: embeddedProps,
  },
  // Dev-flagged object types (governanceDevEnabled) — in-progress features
  {
    key: 'resources',
    titleKey: 'governance.administer.resources.title',
    component: FrResourceList,
    enabled: () => !!store.state.SharedStore.governanceDevEnabled,
    getComponentProps: embeddedProps,
  },
];

const visibleTabs = computed(() => objectTabs.filter((tab) => tab.enabled()));

/**
 * Flat list of selectable entries: a tab with subOptions contributes one entry
 * per option, a plain tab contributes itself.
 */
const selections = computed(() => visibleTabs.value.flatMap((tab) => (
  tab.subOptions
    ? tab.subOptions.map((sub) => ({ tab, subKey: sub.key }))
    : [{ tab, subKey: '' }]
)));

const activeSelection = computed(() => selections.value[selectedFlatIndex.value] || null);

/**
 * Side-nav model: tabs with subOptions render as an expandable FrMenuItem group,
 * plain tabs as simple items — all sharing one flat event index space.
 */
const navItems = computed(() => {
  let flatIndex = 0;
  return visibleTabs.value.map((tab) => {
    if (tab.subOptions) {
      const subItems = tab.subOptions.map((sub) => {
        const index = flatIndex;
        flatIndex += 1;
        return {
          displayName: sub.titleKey,
          active: selectedFlatIndex.value === index,
          event: String(index),
        };
      });
      return {
        key: tab.key,
        displayName: tab.titleKey,
        subItems,
        expand: subItems.some((sub) => sub.active),
      };
    }
    const index = flatIndex;
    flatIndex += 1;
    return {
      key: tab.key,
      displayName: tab.titleKey,
      active: selectedFlatIndex.value === index,
      event: String(index),
    };
  });
});

// Keep the selection valid if flag changes shrink the visible list
watch(visibleTabs, (tabs) => {
  const count = tabs.reduce((sum, tab) => sum + (tab.subOptions?.length || 1), 0);
  if (selectedFlatIndex.value >= count) {
    selectedFlatIndex.value = Math.max(0, count - 1);
  }
});

/**
 * Resolves the flat index matching the given objectTab/objectSubTab slugs.
 * @param {string} objectTab The side-tab key
 * @param {string} objectSubTab The nested sub-tab key, if any
 * @returns {number|null} The matching flat index, or null when objectTab is unset or unknown
 */
function findFlatIndex(objectTab, objectSubTab) {
  if (!objectTab) return null;
  const tabIndex = selections.value.findIndex((selection) => selection.tab.key === objectTab);
  if (tabIndex === -1) return null;
  if (objectSubTab) {
    const subIndex = selections.value.findIndex(
      (selection) => selection.tab.key === objectTab && selection.subKey === objectSubTab,
    );
    if (subIndex > -1) return subIndex;
  }
  return tabIndex;
}

/**
 * Selects the entry at the given flat index and pushes it through the router so
 * it survives refresh, deep links, and browser Back/Forward. Horizontal tabs
 * remain component state; only the vertical sub-tab selection syncs here.
 * @param {number} index The flat index of the selected entry
 */
function selectSelection(index) {
  const selection = selections.value[index];
  if (!selection) return;
  selectedFlatIndex.value = index;
  router.push({
    name: 'EditUnmanagedApplication',
    params: {
      applicationId: props.applicationId,
      tab: 'objects',
      objectTab: selection.tab.key,
      ...(selection.subKey ? { objectSubTab: selection.subKey } : {}),
    },
  });
}

// Seed the selection from the URL slugs on first mount (after flag filtering)
const initialFlatIndex = findFlatIndex(props.objectTab, props.objectSubTab);
if (initialFlatIndex !== null) selectedFlatIndex.value = initialFlatIndex;

// Re-sync when objectTab/objectSubTab change later, e.g. the router updating
// these props after a browser Back/Forward navigation
watch(() => [props.objectTab, props.objectSubTab], ([objectTab, objectSubTab]) => {
  const index = findFlatIndex(objectTab, objectSubTab);
  if (index !== null) selectedFlatIndex.value = index;
});
</script>

<style lang="scss" scoped>
// The side nav mirrors the Object Types tab's navigation: flush items against the
// divider, indented submenu options under the expandable Accounts group
.object-explorer-nav {
  min-width: 180px;
}

:deep(.object-explorer-nav) {
  padding: 0 !important;

  .nav-link {
    border-radius: 0 !important;
  }

  button.btn.dropdown-toggle {
    width: 100%;
    padding-left: 1.48rem !important;
  }

  .dropdown-toggle::after {
    right: 0.6875rem;
    position: absolute;
  }

  .fr-menu-item-submenuitems li a {
    padding: 10px 5px 10px 40px !important;
  }
}
</style>
