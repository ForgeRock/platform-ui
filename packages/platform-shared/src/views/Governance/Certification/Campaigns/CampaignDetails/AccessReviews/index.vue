<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard no-body>
      <BCardHeader class="p-0">
        <div class="btn-toolbar justify-content-between p-3 border-bottom-0">
          <BDropdown
            id="dropdown-status"
            variant="link"
            class="ml-2 text-decoration-none">
            <template #button-content>
              <span class="font-weight-bold mr-1">
                {{ `${$t('common.status')}:` }}
              </span>
              <span v-if="statusSort">
                {{ statusSort.text }}
              </span>
            </template>
            <template>
              <BDropdownItem
                v-for="(state, i) in Object.keys(states)"
                :key="i"
                @click="handleSort(states[state])">
                <span>
                  {{ states[state].text }}
                </span>
              </BDropdownItem>
            </template>
          </BDropdown>
          <div class="d-flex align-items-center">
            <BButton
              class="mr-2 text-body"
              variant="link"
              :aria-label="$t('governance.certificationTask.export')"
              @click="openDownloadModal()">
              <FrIcon
                id="access-reviews-export-icon"
                icon-class="mr-1"
                name="file_download" />
            </BButton>
            <BTooltip
              target="access-reviews-export-icon"
              triggers="hover"
              placement="top">
              {{ $t('governance.certificationTask.export') }}
            </BTooltip>
            <FrSearchInput
              v-model="searchQuery"
              :placeholder="$t('common.search')"
              @clear="clear"
              @search="search" />
          </div>
        </div>
      </BCardHeader>
      <FrSpinner
        v-if="tableLoading"
        class="py-5" />
      <BTable
        v-else-if="accessReviewList.length"
        class="mb-0"
        v-resizable-table="{ persistKey: `certification-access-reviews-${campaignId}` }"
        hover
        tbody-tr-class="cursor-pointer"
        primary-key="id"
        responsive
        :fields="fields"
        :items="accessReviewList"
        :per-page="pageSize"
        @row-clicked="viewApplicationDetails($event)"
        @sort-changed="sortAccessReviews">
        <template #cell(actorGivenName)="{ item }">
          <BMedia no-body>
            <BMediaAside vertical-align="center">
              <BImg
                v-if="isCertifierAUser(item.actor)"
                class="rounded-circle"
                height="36"
                width="36"
                :alt="item.actor.givenName"
                :aria-hidden="true"
                :src="item.actor.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              <div
                v-else
                class="rounded-circle bg-lightblue color-blue font-weight-bold mr-1">
                <FrIcon
                  class="d-flex align-items-center justify-content-center"
                  style="width: 36px; height: 36px;"
                  name="assignment_ind" />
              </div>
            </BMediaAside>
            <BMediaBody class="text-truncate">
              <h5 class="mb-0 text-truncate">
                {{ $t('governance.certificationDetails.ownerNameLabel', { givenName: certifierName(item.actor).givenName, sn: certifierName(item.actor).sn }) }}
              </h5>
              <small class="text-muted text-truncate">
                {{ certifierUsername(item.actor) }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(status)="{ item }">
          <BBadge
            class="w-100px d-block"
            :variant="variantsByStatus[item.status]">
            {{ getStatusCampaignTranslationLabel(item.status) }}
          </BBadge>
        </template>
        <template #cell(progress)="{ item, index }">
          <FrCircleProgressBar
            :id="`taskProgress${index}`"
            :progress="calculateTaskProgress(item.complete, item.total)"
            :thickness="6"
            :empty-thickness="6"
            :empty-color="styles.brightGray"
            :size="50">
            <template #count="{ count }">
              <small class="font-weight-bold mb-0">
                {{ count.currentValue }}%
              </small>
            </template>
          </FrCircleProgressBar>
          <BPopover
            triggers="hover"
            boundary="window"
            placement="top"
            :target="`taskProgress${index}`">
            <div class="p-1">
              <h5 class="mb-1">
                {{ $t('governance.certificationDetails.accessReviewsTable.taskPopoverCompletedText', { percentage: calculateTaskProgress(item.complete, item.total) }) }}
              </h5>
              {{ $t('governance.certificationDetails.accessReviewsTable.taskPopoverItemsCompletedText', { completed: item.complete, total: item.total }) }}
            </div>
          </BPopover>
        </template>
      </BTable>
      <FrNoData
        v-else
        :card="false"
        class="mb-4"
        data-testid="access-review-no-data"
        icon="inbox"
        :subtitle="$t('governance.certificationTask.noAccessReview', { type: statusSort.text })" />
      <FrPagination
        v-if="totalRows"
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="pageSize"
        @input="paginationChange"
        @on-page-size-change="pageSizeChange" />
    </BCard>
    <FrDownloadItemsModal
      modal-id="access-reviews-download-items-modal"
      grant-type="accessReviews"
      :is-loading="isExporting"
      :totals="{ currentPage: accessReviewList.length, all: totalRows }"
      :ok-function="exportItemsToFile" />
  </div>
</template>

<script>
import {
  BBadge,
  BButton,
  BCard,
  BCardHeader,
  BDropdown,
  BDropdownItem,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BPopover,
  BTable,
  BTooltip,
} from 'bootstrap-vue';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import { getCampaignTasks } from '@forgerock/platform-shared/src/api/governance/CampaignApi';
import { DATE_FORMAT_MMM_D_COMMA_YYYY } from '@forgerock/platform-shared/src/utils/constants';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import FrDownloadItemsModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/TaskList/modals/DownloadItemsModal/DownloadItemsModal';
import styles from '@/scss/main.scss';

export default {
  name: 'AccessReviews',
  components: {
    BBadge,
    BButton,
    BCard,
    BCardHeader,
    BDropdown,
    BDropdownItem,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BPopover,
    BTable,
    BTooltip,
    FrCircleProgressBar,
    FrDownloadItemsModal,
    FrNoData,
    FrPagination,
    FrSearchInput,
    FrSpinner,
    FrIcon,
  },
  props: {
    campaignId: {
      type: String,
      required: true,
    },
    campaignStatus: {
      type: String,
      default: null,
    },
  },
  mixins: [
    CertificationMixin,
    NotificationMixin,
  ],
  data() {
    return {
      accessReviewList: [],
      currentSelectedActor: null,
      currentPage: 1,
      DATE_FORMAT_MMM_D_COMMA_YYYY,
      isStaging: false,
      pageSize: 10,
      selectedCertId: null,
      sortBy: null,
      sortDesc: false,
      styles,
      totalRows: 0,
      tableLoading: true,
      isExporting: false,
      fields: [
        {
          key: 'actorGivenName',
          label: this.$t('governance.certificationDetails.accessReviewsTable.certifierColumnName'),
          sortable: true,
          class: 'w-305px text-truncate',
        },
        {
          key: 'status',
          label: this.$t('common.status'),
          class: 'w-305px',
        },
        {
          key: 'progress',
          label: this.$t('common.progress'),
          class: 'w-140px',
        },
      ],
      userType: new Map([
        ['organization', this.$t('governance.certificationTask.organizationAdmin')],
        ['role', this.$t('pages.access.role')],
      ]),
      variantsByStatus: {
        'in-progress': 'success',
        expiring: 'warning',
        overdue: 'danger',
        expired: 'danger',
        closed: 'success',
        complete: 'success',
      },
    };
  },
  mounted() {
    this.isStaging = this.campaignStatus === CampaignStates.STAGING;
    this.loadAccessReviewsList();
  },
  methods: {
    /**
     * this method loads the data for the access reviews table, the sorting status is changed depending on the status
     * of the campaign, active or staging
     */
    loadAccessReviewsList() {
      if (this.isStaging) this.statusSort = this.states.staging;
      else if (this.campaignStatus === CampaignStates.SIGNED_OFF) this.statusSort = this.states.closed;
      else this.statusSort = this.states.active;
      this.getList();
    },
    calculateTaskProgress(taskComplete, taskTotal) {
      const actualProgress = (taskComplete * 100) / taskTotal;
      return actualProgress >= 50
        ? Math.floor(actualProgress)
        : Math.ceil(actualProgress);
    },
    getItems(params) {
      this.tableLoading = true;
      const requestParams = {
        ...params,
        sortBy: this.sortBy,
        sortDesc: this.sortDesc,
        pageSize: this.pageSize,
        status: this.isStaging ? CampaignStates.STAGING : params.status,
      };
      return getCampaignTasks(this.campaignId, requestParams);
    },
    viewApplicationDetails(task) {
      this.$router.push({
        name: 'CampaignDetailsTask',
        params: {
          campaignId: this.campaignId,
          certifier: task.actor,
          isAdmin: true,
        },
        query: {
          actorId: task.actor.key,
          taskStatus: this.statusSort.param,
        },
      });
    },
    handleSort(status) {
      this.statusSort = status;
      this.currentPage = 1;
      this.getList();
    },
    sortAccessReviews({ sortBy }) {
      this.sortBy = sortBy;
      this.sortDesc = !this.sortDesc;
      this.getList();
    },
    paginationChange(pageNumber) {
      this.currentPage = pageNumber;
      this.getList();
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.getList();
    },
    certifierName(item) {
      const givenName = item.givenName || item.name;
      const sn = item.sn || '';

      return {
        givenName,
        sn,
      };
    },
    certifierUsername(item) {
      const userTypeKey = item.key.split('/')[1];
      return item.userName || this.userType.get(userTypeKey);
    },
    isCertifierAUser(item) {
      return item.key.startsWith('managed/user');
    },
    openDownloadModal() {
      this.$bvModal.show('access-reviews-download-items-modal');
    },
    async exportItemsToFile(downloadOptions) {
      const { format, rows } = downloadOptions;
      let items = this.accessReviewList;
      try {
        this.isExporting = true;
        if (rows === 'all') {
          const pageSize = format === 'pdf' ? 1000 : 10000;
          const requestParams = {
            ...this.statusSort && { status: this.isStaging ? CampaignStates.STAGING : this.statusSort.param },
            sortBy: this.sortBy,
            sortDesc: this.sortDesc,
            pageSize,
          };
          const { data } = await getCampaignTasks(this.campaignId, requestParams);
          items = data?.result || [];
        }
        const exportData = items.map((item) => ({
          [this.$t('common.user.givenName')]: item.actor?.givenName || '',
          [this.$t('common.user.sn')]: item.actor?.sn || '',
          [this.$t('common.user.userName')]: item.actor?.userName || '',
          [this.$t('common.user.mail')]: item.actor?.mail || '',
          [this.$t('common.status')]: this.getStatusCampaignTranslationLabel(item.status),
          [this.$t('common.complete')]: item.complete ?? '',
          [this.$t('governance.certificationDetails.accessReviewsTable.inProgress')]: (item.total ?? 0) - (item.complete ?? 0),
          [this.$t('governance.certificationDetails.accessReviewsTable.total')]: item.total ?? '',
          [this.$t('common.progress')]: `${this.calculateTaskProgress(item.complete, item.total)}%`,
        }));
        const fileName = this.$t('governance.certificationDetails.accessReviewsTabTitle');
        downloadAsType(exportData, format, `${fileName}.${format}`, fileName);
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.exportError'));
      } finally {
        this.isExporting = false;
      }
    },
  },
  computed: {
    states() {
      return this.isStaging
        ? {
          staging: {
            param: 'staging',
            text: this.$t('governance.status.staging'),
          },
        }
        : {
          active: {
            param: 'active',
            text: this.$t('governance.status.active'),
          },
          expired: {
            param: 'expired',
            text: this.$t('governance.status.expired'),
          },
          closed: {
            param: 'closed',
            text: this.$t('governance.status.closed'),
          },
        };
    },
  },
  watch: {
    campaignStatus(newVal) {
      this.isStaging = newVal === CampaignStates.STAGING;
      this.loadAccessReviewsList();
    },
  },
};
</script>
<style lang="scss" scoped>
#dropdown-status:deep {
  button {
    color: $black;
    padding-left: 0;
    padding-right: 0;
  }
}
:deep {
  .w-305px {
    width: 305px;
  }
}
</style>
