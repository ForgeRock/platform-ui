<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer fluid>
      <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
        <BCol lg="8">
          <FrHeader
            :title="$t('governance.accessAnalysis.title')"
            :subtitle="$t('governance.accessAnalysis.subtitle')" />
        </BCol>
      </BRow>
      <BRow>
        <BCol>
          <BTabs
            v-model="tabIndex"
            content-class="mt-4"
            nav-class="fr-tabs"
            @activate-tab="tabActivated">
            <BTab :title="$t('governance.accessAnalysis.tabs.compareUserAccess')">
              <FrCompareUserAccess :get-scope-by-id="getScope" />
            </BTab>
            <BTab :title="$t('governance.accessAnalysis.tabs.accessSimulator')">
              <FrAccessSimulator
                :get-scope-list="getScopeList"
                :get-scope-by-id="getScope" />
            </BTab>
          </BTabs>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import {
  BCol,
  BContainer,
  BRow,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrCompareUserAccess from '@forgerock/platform-shared/src/views/Governance/AccessAnalysis/CompareUserAccess';
import FrAccessSimulator from '@forgerock/platform-shared/src/views/Governance/AccessAnalysis/AccessSimulator';
import { getScope, getScopeList } from '@forgerock/platform-shared/src/api/governance/ScopeApi';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import i18n from '@/i18n';

const props = defineProps({
  showBackButton: { type: Boolean, default: false },
});

const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();

const tabMap = ['compare-user-access', 'access-simulator'];
const routeTabIndex = tabMap.findIndex((key) => key === route.params.accessAnalysisTab);
const tabIndex = ref(routeTabIndex !== -1 ? routeTabIndex : 0);

function tabActivated(selectedTabIndex) {
  // Reflect the tab in the URL without a router navigation: mutating the
  // params in place and rewriting the history entry with replaceState keeps
  // the URL shareable while avoiding a $route.fullPath change, which would
  // remount the whole page (App.vue keys the routed component on fullPath).
  // replaceState (not pushState) mirrors the previous router.replace behaviour.
  route.params.accessAnalysisTab = tabMap[selectedTabIndex];
  // Rewrite only the tab segment of the live hash: admin mounts this view at
  // /access-analysis/:tab, enduser nested at /access-modeling/access-analysis/:tab.
  const [path, search] = window.location.hash.split('?');
  const url = path.replace(
    /access-analysis(?:\/[^/]*)?$/,
    `access-analysis/${route.params.accessAnalysisTab}`,
  );
  window.history.replaceState(window.history.state, '', search ? `${url}?${search}` : url);
}

onMounted(() => {
  if (props.showBackButton) {
    setBreadcrumb('/access-modeling', i18n.global.t('governance.accessModeling.hub.title'));
  }
});
</script>
