<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

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
                class="m-md-2 text-decoration-none">
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
                    v-if="!statusObj.sortHide"
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
            <!-- <FrSearchInput
              v-model="searchQuery"
              :placeholder="$t('common.search')"
              @clear="clear"
              @search="search" /> -->
          </div>
        </BCardHeader>
        <BTable
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
            <FrInlinePieChart
              :id="item.id"
              height="50"
              :progress="progressPercentage(item.progress)"
            />
          </template>
          <template #cell(edit)="{ item }">
            <FrActionsCell
              :edit-option="false"
              :delete-option="false"
              :divider="false"
            >
              <template #custom-top-actions>
                <BDropdownItem @click="changeSelectedReview(item)">
                  <FrIcon
                    class="mr-2"
                    name="redo" />
                  {{ $t('common.forward') }}
                </BDropdownItem>
              </template>
            </FrActionsCell>
          </template>
        </BTable>
        <BPagination
          v-if="totalRows > 10"
          v-model="currentPage"
          class="pt-3 justify-content-center pagination-material-buttons border-top"
          per-page="10"
          :total-rows="totalRows"
          @input="()=> getList()" />
      </BCard>
      <FrForwardReviewModal
        :cert-id="selectedCertId"
        @forward="forward"
      />
    </div>
  </BContainer>
</template>

<script>
import { mapState } from 'vuex';
import {
  BBadge,
  BCard,
  BCardHeader,
  BContainer,
  BDropdown,
  BDropdownItem,
  BMedia,
  BPagination,
  BTable,
} from 'bootstrap-vue';
import {
  getCertificationItems,
  searchCertificates,
  forwardCertification,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrInlinePieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/InlinePieChart';
// import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import FrForwardReviewModal from '@forgerock/platform-shared/src/components/governance/ForwardReviewModal';

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
    BPagination,
    BTable,
    FrActionsCell,
    FrForwardReviewModal,
    FrHeader,
    FrIcon,
    FrInlinePieChart,
    // FrSearchInput,
    FrSpinner,
  },
  data() {
    return {
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
          class: 'w-140px',
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
        },
        {
          key: 'edit',
          class: 'w-96px',
          label: '',
        }],
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
    ...mapState({
      userId: (state) => state.UserStore.userId,
    }),
    currentUserId() {
      return `managed/user/${this.userId}`;
    },
  },
  methods: {
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
          query: { actorId: rowData?.certifierId },
        });
      }
    },
    progressPercentage(progress = 0) {
      const actualProgress = progress * 100;
      return actualProgress >= 50
        ? Math.floor(actualProgress)
        : Math.ceil(actualProgress);
    },
    changeSelectedReview(item) {
      this.$root.$emit('bv::show::modal', 'forward-review-modal');
      this.selectedCertId = item?.campaignId || item?._id;
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
#dropdown-status::v-deep {
  button {
    color: $black;
    padding-left: 0;
    padding-right: 0;
  }
}
::v-deep {
  .w-140px {
    width: 140px;
  }
 .w-96px {
    width: 96px;
  }
}
</style>
