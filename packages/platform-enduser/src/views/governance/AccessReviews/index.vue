<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <template v-if="tableLoading">
      <FrSpinner class="py-5" />
    </template>
    <div
      v-else
      class="my-5">
      <FrHeader
        :title="$t('pages.accessReview.title')"
        :subtitle="$t('pages.accessReview.subTitle')" />
      <BCard no-body>
        <BCardHeader class="p-0">
          <div class="btn-toolbar justify-content-between p-3 border-bottom-0">
            <div>
              <BDropdown
                id="dropdown-status"
                variant="link"
                class="ml-2 text-decoration-none">
                <template #button-content>
                  <span
                    class="font-weight-bold mr-1"
                  >
                    {{ `${$t('common.status')}:` }}
                  </span>
                  <span>{{ statusSort.text }}</span>
                </template>
                <template v-for="([key, statusObj]) in Array.from(statuses)">
                  <BDropdownItem
                    :key="key"
                    v-if="!statusObj.sortHide && !statusObj.sortAccessReviewHide"
                    @click="handleStatusSort(statusObj)"
                  >
                    <span
                      :class="[{'pl-3': (statusObj.type !== statuses.get('closed').type && statusObj.type !== statuses.get('in-progress').type)}]"
                    >
                      {{ statusObj.text }}
                    </span>
                  </BDropdownItem>
                </template>
              </BDropdown>
            </div>
          </div>
        </BCardHeader>
        <BTable
          v-if="accessReviewList.length"
          class="mb-0"
          hover
          responsive
          tbody-tr-class="cursor-pointer"
          primary-key="id"
          :fields="fields"
          :items="accessReviewList"
          @row-clicked="viewApplicationDetails">
          <template #cell(name)="{ item }">
            <BMedia
              class="align-items-center"
              no-body>
              <div class="media-body align-self-center">
                <h5 class="m-0">
                  {{ item.campaignName || item.name }}
                </h5>
                <small class="text-muted">
                  {{ item.description }}
                </small>
              </div>
            </BMedia>
          </template>
          <template #cell(status)="{ item }">
            <template v-if="item && item.status">
              <BBadge
                class="w-100"
                :variant="statuses.get(item.status).variant">
                {{ $t(`pages.accessReview.status.${item.status.toLowerCase()}`) }}
              </BBadge>
            </template>
          </template>
          <template #cell(progress)="{ item }">
            <FrCircleProgressBar
              :id="`taskProgress${item.id}`"
              :progress="progressPercentage(item.progress)"
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
              :target="`taskProgress${item.id}`">
              <div class="p-1">
                <h5 class="mb-1">
                  {{ $t('pages.accessReview.taskPopoverCompletedText', { percentage: progressPercentage(item.progress) }) }}
                </h5>
                {{ $t('pages.accessReview.taskPopoverItemsCompletedText', { completed: item.totals.completed, total: item.totals.total }) }}
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
          :value="currentPage"
          :total-rows="totalRows"
          :per-page="pageSize"
          @input="paginationChange"
          @on-page-size-change="pageSizeChange" />
      </BCard>
    </div>
  </BContainer>
</template>

<script>
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import {
  BBadge,
  BCard,
  BCardHeader,
  BContainer,
  BDropdown,
  BDropdownItem,
  BMedia,
  BPopover,
  BTable,
} from 'bootstrap-vue';
import {
  getCertificationItems,
  searchCertificates,
  forwardCertification,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import styles from '@/scss/main.scss';

export default {
  name: 'AccessReviews',
  components: {
    BBadge,
    BCard,
    BCardHeader,
    BContainer,
    BDropdown,
    BDropdownItem,
    BMedia,
    BPopover,
    BTable,
    FrCircleProgressBar,
    FrHeader,
    FrNoData,
    FrPagination,
    FrSpinner,
  },
  data() {
    return {
      pageSize: 10,
      currentPage: 1,
      totalRows: 0,
      tableLoading: true,
      selectedCertId: null,
      accessReviewList: [],
      fields: [
        {
          key: 'name',
          label: this.$t('common.name'),
        },
        {
          key: 'formattedDeadline',
          label: this.$t('common.deadline'),
          sortable: true,
        },
        {
          key: 'status',
          class: 'w-140px',
          label: this.$t('common.status'),
        },
        {
          key: 'progress',
          class: 'w-140px',
          label: this.$t('common.progress'),
        }],
      styles,
    };
  },
  mixins: [
    CertificationMixin,
    NotificationMixin,
  ],
  mounted() {
    this.getList();
  },
  computed: {
    ...mapState(useUserStore, ['userId']),
    currentUserId() {
      return `managed/user/${this.userId}`;
    },
  },
  methods: {
    pageSizeChange(newPageSize) {
      this.pageSize = newPageSize;
      this.currentPage = 1;
      this.getList();
    },
    paginationChange(pageNumber) {
      this.currentPage = pageNumber;
      this.getList();
    },
    getItems(params) {
      const { queryString } = params;
      delete params.queryString;
      if (!queryString) {
        return getCertificationItems(params);
      }
      return searchCertificates(queryString, params);
    },
    viewApplicationDetails(rowData) {
      if (!rowData || !rowData.campaignId || !rowData.certifierId) {
        this.showErrorMessage('', this.$t('governance.certificationTask.errors.certificationDetailError'));
      } else {
        this.$router.push({
          name: 'CertificationTask',
          params: { campaignId: rowData?.campaignId },
          query: {
            actorId: rowData?.certifierId,
            taskStatus: this.statusSort.param,
          },
        });
      }
    },
    progressPercentage(progress = 0) {
      const actualProgress = progress * 100;
      return actualProgress >= 50
        ? Math.floor(actualProgress)
        : Math.ceil(actualProgress);
    },
    /**
     * @param {Object} data data of the certification to forward
     * @param {String} data.certId id of the certification to forward
     * @param {String} data.newActorId id of new actor
     * @param {String} data.comment comment for the forward
     */
    forward({ certId, newActorId, comment = '' }) {
      forwardCertification(this.currentUserId, certId, newActorId, comment)
        .then(() => {
          this.displayNotification('success', this.$t('governance.certificationTask.success.accessReviewForwarded'));
          this.$root.$emit('bv::hide::modal', 'forward-review-modal');
          this.getList();
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.forwardItemError'));
        });
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
  .w-140px {
    width: 140px;
  }
 .w-96px {
    width: 96px;
  }
}
</style>
