<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <FrHeader
      class="mt-5 mb-4 text-capitalize"
      :title="reportConfigData ? prettyTemplateName : $t('pageTitles.Reports')"
      :top-text="reportConfigData ? $t('reports.heading') : $t('common.loadingEtc')" />
    <BTabs
      content-class="mt-3"
      nav-class="fr-tabs mb-4"
      v-model="tabIndex">
      <BTab
        v-for="(tab, index) in tabItems"
        :active="tabIndex === index"
        :key="tab.displayName"
        :title="tab.displayName">
        <Component
          v-if="tabIndex === index"
          :is="tab.component"
          :new-report-job-id="newReportJobId"
          :report-config="reportConfigData"
          :template-name="templateName"
          @update-tab="updateTab"
          @table-data-ready="newReportJobId = null" />
      </BTab>
    </BTabs>
  </BContainer>
</template>

<script setup>
/**
 * @description Displays the report template tabs for running reports and viewing reports history.
 */
import {
  ref,
  watch,
} from 'vue';
import { BContainer, BTabs, BTab } from 'bootstrap-vue';
import { getReportTemplates } from '@forgerock/platform-shared/src/api/AutoApi';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { useRoute, useRouter } from 'vue-router';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrRunReport from './RunReport';
import FrRunHistory from './RunHistory';
import i18n from '@/i18n';

/**
 * LOCALS
 */
useBreadcrumb().setBreadcrumb('/reports', i18n.global.t('routeNames.Reports'));

// Composables
const router = useRouter();
const route = useRoute();

/**
 * GLOBALS
 */
const reportConfigData = ref(null);
const newReportJobId = ref(null);
const routerMap = ['ReportTemplate', 'ReportTemplateHistory'];
const templateName = route.params.template;
const prettyTemplateName = templateName.toLowerCase().replace(/-/g, ' ');
const tabIndex = ref(routerMap.indexOf(route.name));
const tabItems = [
  {
    id: 'run-report',
    displayName: i18n.global.t('reports.tabs.runReport.title'),
    component: FrRunReport,
  },
  {
    id: 'report-history',
    displayName: i18n.global.t('reports.tabs.runHistory.title'),
    component: FrRunHistory,
  },
];

/**
 * ACTIONS
 * @description
 * .Updates tab
 * .Request to get all report templates
 */

/**
 * Tab update event
 * @param {String} tabName name of tab
 * @param {String} jobId id of most recently created job
 */
function updateTab(tabName, jobId) {
  tabIndex.value = tabItems.findIndex((tab) => tab.id === tabName);
  newReportJobId.value = jobId || null;
}

/**
 * Gets and validates report template from url. If template is not found,
 * user gets redirected back to the main report templates grid view.
 * @returns {Object} report template
 */
async function getReportTemplate() {
  try {
    const { result } = await getReportTemplates({ queryFilter: `name eq ${templateName.toUpperCase()}` });
    const [reportTemplate] = result;

    if (!reportTemplate) {
      throw new Error(404);
    }
    return reportTemplate;
  } catch (error) {
    const errorData = error.message === '404'
      ? { type: 'warning', message: i18n.global.t('reports.tabs.runReport.errors.templateDoesNotExist') }
      : { type: 'danger', message: i18n.global.t('reports.tabs.runReport.errors.errorRetrievingTemplate') };

    displayNotification(errorData.type, errorData.message);
    router.push({ name: 'Reports' });
    return {};
  }
}

/**
 * WATCHERS
 */
watch(tabIndex, (index) => {
  const routeUrl = index === 0 ? '' : 'history';
  window.history.pushState(window.history.state, '', `#/reports/${templateName}/${routeUrl}`);
});

/**
 *      |>>>
 *      |
 * [ * START * ]
 *  |;|_|;|_|;|
 */
(async () => {
  const { reportConfig } = await getReportTemplate();

  if (reportConfig) {
    reportConfigData.value = JSON.parse(reportConfig);
  }
})();
</script>
