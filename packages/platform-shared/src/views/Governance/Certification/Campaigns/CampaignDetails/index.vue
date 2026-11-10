<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <div class="mt-5">
      <FrHeader
        class="mb-4"
        data-testid="header"
        :title="campaignDetails && campaignDetails.name"
        :top-text="campaignDetails && $t(`governance.editTemplate.templateType.${campaignDetails.certificationType}`)"
      />
      <BTabs
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        data-testid="cert-tabs"
        @activate-tab="selectTab">
        <BTab
          data-testid="overview-tab"
          key="overview"
          :active="tabIndex === 0"
          :title="$t('governance.certificationDetails.detailsTabTitle')"
        >
          <FrCampaignOverview
            data-testid="campaign-overview"
            v-if="campaignDetails"
            :campaign="campaignDetails"
            :is-revokes-exporting="isRevokesExporting"
            :is-campaign-owner-or-admin="isCampaignOwnerOrAdmin"
            @update:status="campaignDetails.status = $event"
            @update:ownerInfo="campaignDetails.ownerInfo = $event"
            @update:name="campaignDetails.name = $event"
            @refresh-campaign="refreshCampaign"
            @export-revokes="openExportRevokesModal"
          />
        </BTab>
        <BTab
          data-testid="access-reviews-tab"
          key="accessReviews"
          lazy
          :title="$t('governance.certificationDetails.accessReviewsTabTitle')"
        >
          <FrAccessReviews
            :campaign-id="$route.params.campaignId"
            :campaign-status="campaignDetails && campaignDetails.status" />
        </BTab>
        <BTab
          data-testid="system-messages-tab"
          key="systemMessages"
          lazy
          :title="$t('governance.certificationDetails.systemMessages.systemMessagesTabTitle')"
        >
          <FrSystemMessages :system-messages="campaignDetails?.systemMessages" />
        </BTab>
      </BTabs>
    </div>
    <FrDownloadItemsModal
      modal-id="export-revocation-decisions-modal"
      grant-type="campaigns"
      skip-scope-step
      :is-loading="isRevokesExporting"
      :totals="{ currentPage: 0, all: 0 }"
      :item-type-options="revokesItemTypeOptions"
      :ok-function="exportRevokesToFile" />
  </BContainer>
</template>

<script>
import {
  BContainer,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { computed } from 'vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import {
  getCampaignDetails,
} from '@forgerock/platform-shared/src/api/governance/CampaignApi';
import { getCertificationTasksListByCampaign } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import {
  buildRevokesExportTargetFilter,
  buildRevokesExportFields,
  buildRevokesExportMappers,
  getRevokesItemTypesForCampaign,
  resolveRevokesExportTypes,
} from '@forgerock/platform-shared/src/views/Governance/utils/revokeExportFilter';
import FrDownloadItemsModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/TaskList/modals/DownloadItemsModal/DownloadItemsModal';
import FrCampaignOverview from './CampaignOverview';
import FrAccessReviews from './AccessReviews';
import FrSystemMessages from './SystemMessages/SystemMessages';

export default {
  name: 'CampaignDetails',
  props: {
    /**
     * IGA-1116: governance admins reach this page through admin routes/roles
     * (the admin route passes `isAdmin: true`); admins may edit any campaign
     * and export its revokes worklist, other callers only their own.
     */
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BContainer,
    BTabs,
    BTab,
    FrAccessReviews,
    FrCampaignOverview,
    FrDownloadItemsModal,
    FrHeader,
    FrSystemMessages,
  },
  mixins: [NotificationMixin],
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    // IGA-1116: the revokes worklist is an owner/admin remediation artifact.
    // Governance admins reach this page through admin routes/roles; a caller
    // is an owner when their user id matches the campaign's owner id (the id
    // part of `managed/user/<uuid>`).
    const userStore = useUserStore();
    const currentUserId = computed(() => userStore.userId);
    return { setBreadcrumb, currentUserId };
  },
  computed: {
    /**
     * IGA-1116: the revokes worklist is an owner/admin remediation artifact.
     * Both id sides are reduced to the bare id (TaskList does the same before
     * comparing actor ids) since user references may be `managed/user/<uuid>`
     * paths or bare uuids.
     */
    isCampaignOwnerOrAdmin() {
      const ownerId = this.campaignDetails?.ownerInfo?.id?.replace?.(/^managed\/user\//, '') || this.campaignDetails?.ownerInfo?.id;
      const userId = this.currentUserId?.replace?.(/^managed\/user\//, '') || this.currentUserId;
      if (!ownerId) return this.isAdmin;
      return this.isAdmin || userId === ownerId;
    },
  },
  data() {
    return {
      tabIndex: 0,
      campaignDetails: null,
      isRevokesExporting: false,
      revokesItemTypeOptions: null,
      tabs: ['details', 'access-reviews', 'system-messages'],
    };
  },
  created() {
    this.tabIndex = this.tabs.findIndex((key) => key === this.$route.params.tab);
  },
  mounted() {
    this.setBreadcrumb('/certification/campaigns', this.$t('governance.certification.title'));

    getCampaignDetails(this.$route.params.campaignId).then((campaignDetails) => {
      this.campaignDetails = campaignDetails;
    });
  },
  beforeRouteUpdate(to, from, next) {
    // This is needed to be able to listen changes in router params when the router single page is already rendered
    if (to.params.tab !== from.params.tab) {
      this.handleRouteUpdate(to.params.tab);
    }
    next();
  },
  methods: {
    handleRouteUpdate(tab) {
      this.tabIndex = this.tabs.findIndex((key) => key === tab);
      this.selectTab(this.tabIndex);
    },
    selectTab(newTabIndex) {
      if (newTabIndex > -1) {
        const tab = this.tabs[newTabIndex];
        this.$route.params.tab = tab;
        window.history.replaceState(window.history.state, '', `#/certification/campaigns/${this.campaignDetails.id}/${tab}`);
        // Tab switches don't re-mount the page, and actions taken in another
        // tab (e.g. the sign-off that finalizes the campaign in Access
        // Reviews) change the campaign's status — so the Details tab's
        // Actions menu would be stale until a full reload. Re-fetch on the
        // way back to Details; the child emits refresh-campaign after its
        // own mutations, so this covers the rest of the round trip.
        if (tab === 'details' && this.campaignDetails) {
          this.refreshCampaign();
        }
      }
    },
    refreshCampaign() {
      getCampaignDetails(this.$route.params.campaignId).then((campaignDetails) => {
        this.campaignDetails = campaignDetails;
      });
    },
    /**
     * Opens the shared Export Certification Items modal. Campaigns whose
     * worklist can hold several item types (identity and agentAccess mix
     * account grants, entitlement grants and role memberships) get an
     * item-type step first: each type downloads as its own file with its own
     * columns, and the counts come from one totals probe per type. The modal
     * is mounted with skip-scope-step because there is no pagination context
     * behind the revokes worklist ("Current Page" would be meaningless), so
     * no rows-scope step is offered.
     */
    async openExportRevokesModal() {
      const candidateTypes = getRevokesItemTypesForCampaign(this.campaignDetails?.certificationType);
      const options = [];
      if (candidateTypes.length > 1) {
        // One totals probe per candidate type (pageSize 1, decision fields
        // only) — the counts feed the modal's type cards. A rejected probe
        // counts the type as empty rather than failing the whole open.
        const probes = await Promise.all(candidateTypes.map((itemType) => Promise.resolve(
          getCertificationTasksListByCampaign(
            { pageSize: 1, pageNumber: 0, fields: 'id' },
            this.$route.params.campaignId,
            { targetFilter: buildRevokesExportTargetFilter(itemType) },
          ),
        ).then(({ data }) => ({ itemType, count: data?.totalCount ?? 0 })).catch(() => ({ itemType, count: 0 }))));
        probes.forEach(({ itemType, count }) => {
          if (count > 0) {
            options.push({ value: itemType, count });
          }
        });
      }
      // More than one non-empty type → the modal offers the item-type step.
      // Zero or one → no step; a single type is preset on the modal so the
      // columns/filter still follow it. A campaign with none of its candidate
      // types present exports empty anyway — no type is needed to show that.
      this.revokesItemTypeOptions = options.length > 0 ? options : null;
      this.$bvModal.show('export-revocation-decisions-modal');
    },
    /**
     * Same flow as the task list's exportItemsToFile — the modal's format
     * option drives the page size and output format. The rows option is
     * accepted for modal parity but ignored: the payload carries the static
     * revocation targetFilter (signed-off certifications, revoke decisions,
     * remediation not finished) and there is no pagination context behind
     * the totals probe, so "Current Page" has no meaning here.
     *
     * Each item type resolves to its own request and file: the item.type
     * clause rides the targetFilter and the CSV columns follow that type's
     * template column configuration (uiConfig.columnConfig[grantKey] — the
     * same source the certifier's task table renders from), falling back to
     * per-type defaults; see buildRevokesExportMappers. The modal's "all
     * types" choice (or no choice on a mixed-type campaign) runs the export
     * once per candidate type, downloading one file per kind; empty kinds
     * are skipped. Unknown campaigns keep the whole-worklist union fallback
     * (null), whose one file covers the mixed worklist.
     *
     * @param {Object} downloadOptions - { format, rows, itemType } from the modal.
     */
    async exportRevokesToFile(downloadOptions = {}) {
      const { format = 'csv', itemType = null } = downloadOptions;
      const pageSize = format === 'pdf' ? 1000 : 10000;
      // 'all' resolves to the probed non-empty groups when the modal offered
      // them, so the fan-out matches the all-types card's promise even for
      // campaign types outside the known map
      const probedGroups = (this.revokesItemTypeOptions || []).map((option) => option.value);
      const exportTypes = resolveRevokesExportTypes(itemType, this.campaignDetails?.certificationType, probedGroups);
      this.isRevokesExporting = true;
      try {
        // one request + file per item type, chained so the downloads land in
        // the candidate order
        const downloadedCount = await exportTypes.reduce(
          (chain, resolvedType) => chain.then(async (count) => {
            // There is no pagination context behind the totals probe, so the
            // modal's "Current Page" option has no meaning here — treat it as
            // the full set rather than exporting a single row.
            const queryParams = {
              pageSize,
              pageNumber: 0,
              fields: buildRevokesExportFields(resolvedType).join(','),
            };
            const payload = { targetFilter: buildRevokesExportTargetFilter(resolvedType) };
            const { data } = await getCertificationTasksListByCampaign(queryParams, this.$route.params.campaignId, payload);
            const items = data?.result || [];
            // one empty slice in an all-types run is expected — skip it
            // rather than reporting the whole export empty
            if (items.length === 0) return count;
            if ((data?.totalCount ?? 0) > items.length) {
              this.displayNotification('info', this.$t('governance.certificationDetails.exportRevocationDecisionsTruncated', { limit: items.length, total: data.totalCount }));
            }
            const typeLabel = resolvedType ? this.$t(`governance.certificationDetails.exportRevocationDecisionsTypes.${resolvedType}`) : '';
            const baseTitle = this.campaignDetails?.name || this.$t('governance.certificationDetails.exportRevocationDecisions');
            const exportTitle = typeLabel ? `${baseTitle} - ${typeLabel}` : baseTitle;
            const mappers = buildRevokesExportMappers(resolvedType, this.campaignDetails?.uiConfig?.columnConfig, this.campaignDetails?.certificationType);
            const exportData = items.map((item) => Object.assign(...mappers.map((map) => map(item))));
            downloadAsType(exportData, format, `${exportTitle}.${format}`, exportTitle);
            return count + 1;
          }),
          Promise.resolve(0),
        );
        // a wholly empty worklist (no slice produced a file) reports empty —
        // the single-file shape matches the previous behavior
        if (downloadedCount === 0) {
          this.displayNotification('info', this.$t('governance.certificationDetails.exportRevocationDecisionsEmpty'));
        } else if (downloadedCount > 1) {
          this.displayNotification('success', this.$t('governance.certificationDetails.exportRevocationDecisionsAllTypesDone', { count: downloadedCount }));
        }
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationDetails.exportRevocationDecisionsError'));
      } finally {
        this.isRevokesExporting = false;
      }
    },
  },
};
</script>
