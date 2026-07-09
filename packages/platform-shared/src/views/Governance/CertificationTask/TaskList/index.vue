<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex justify-content-between certification-task-list_controls">
      <div class="d-flex justify-content-start">
        <FrTaskMultiSelect
          v-if="campaignDetails.allowBulkCertify && !isStaged"
          ref="taskMultiSelect"
          @select-tasks="selectTasks($event)"
          @select-all-tasks="selectAllTasks"
          :campaign-details="campaignDetails"
          :cert-grant-type="certificationGrantType"
          :selected-tasks="selectedItems" />
      </div>
      <div>
        <BButton
          v-if="!isGroupByAccounts"
          class="mr-2 text-body"
          variant="link"
          :aria-label="$t('governance.certificationTask.export')"
          @click="openDownloadModal()">
          <FrIcon
            id="export-icon"
            icon-class="mr-1"
            name="file_download" />
        </BButton>
        <BTooltip
          target="export-icon"
          triggers="hover"
          placement="top">
          {{ $t('governance.certificationTask.export') }}
        </BTooltip>
        <BButton
          v-if="!entitlementUserId"
          @click="leftPanelExpanded = !leftPanelExpanded"
          aria-controls="filters-section"
          :aria-expanded="leftPanelExpanded"
          :aria-label="filterButtonLabel"
          class="mr-2 text-body"
          data-testid="cert-filter-button"
          variant="link">
          <FrIcon
            id="filter-icon"
            name="filter_list" />
        </BButton>
        <BTooltip
          target="filter-icon"
          triggers="hover"
          placement="top">
          {{ $t('common.filters') }}
        </BTooltip>
        <BButton
          @click="openColumnsModal()"
          :aria-label="$t('common.customizeColumns')"
          class="mr-2 text-body"
          variant="link">
          <FrIcon
            id="column-icon"
            name="view_column" />
        </BButton>
        <BTooltip
          target="column-icon"
          triggers="hover"
          placement="top">
          {{ $t('common.customizeColumns') }}
        </BTooltip>
      </div>
    </div>
    <div class="d-flex flex-column flex-lg-row h-100 w-100">
      <div
        v-show="leftPanelExpanded"
        ref="filtersSectionRef">
        <BCard
          class="fr-left-panel d-flex flex-column h-100 p-0 rounded-0"
          no-body>
          <div class="pb-0 w-100">
            <div class="d-flex px-4 align-items-center justify-content-between">
              <div class="d-flex py-3 align-items-center">
                <h2 class="h5 mb-0 py-3">
                  {{ $t('Item Filters') }}
                </h2>
              </div>
              <div class="d-flex border-0 px-0 py-3 align-items-center">
                <BButtonClose
                  id="btnClosePanel"
                  class="text-dark"
                  variant="none"
                  :aria-label="$t('governance.access.filter.hideFilters')"
                  @click="leftPanelExpanded = false">
                  <FrIcon
                    icon-class="md-24"
                    name="close" />
                </BButtonClose>
                <BTooltip
                  target="btnClosePanel"
                  triggers="hover"
                  placement="bottom">
                  {{ $t('governance.access.filter.hideFilters') }}
                </BTooltip>
              </div>
            </div>
          </div>
          <div
            class="border-top p-2 flex-grow-1 h-100 overflow-auto">
            <FrAccessFilter
              v-if="filterTypes"
              show-add
              :use-query-filter="false"
              :input-fields="filterTypes"
              :input-filter-data="filterData"
              :user-options="users"
              :filter-schema="filterProperties"
              @update-filter="updateAccessByFilter"
              @add-filter="addFilter"
              @clear-filters="clearAccessFilters" />
          </div>
        </BCard>
      </div>
      <div
        class="d-flex flex-column h-100 flex-grow-1 min-width-0">
        <FrSpinner
          v-if="isLoading"
          class="py-5" />
        <BTable
          v-else-if="items.length"
          v-resizable-table="{ persistKey: `certification-tasklist-${campaignId}-${certificationGrantType}` }"
          @row-selected="onRowSelected"
          @sort-changed="sortChange"
          class="m-0 border-top border-bottom task-list-table d-flex flex-column"
          ref="selectableTable"
          responsive
          select-mode="single"
          show-empty
          :empty-text="$t('common.noRecordsToShow')"
          :fields="certificationListColumnsToShow"
          :items="items"
          no-local-sorting
          no-sort-reset
          :per-page="pageSize"
          :selectable="isSelectable"
          :sort-by="sortBy"
          :sort-desc="sortDir === 'desc'"
          :tbody-tr-attr="rowAttrs">
          <template #cell(selector)="{ item }">
            <FrField
              v-if="item.decision.certification.status !== 'signed-off' && !item.isAcknowledge && !isStaged"
              @change="selectTask($event, item)"
              name="columnSelected"
              type="checkbox"
              :testid="`multiselect-${item.id}`"
              :value="item.selected" />
          </template>
          <template #cell(user)="{ item }">
            <div class="d-flex justify-content-start align-items-center">
              <BButton
                @click.stop="openUserModal(item.id, item.manager)"
                class="text-dark btn-unstyled"
                variant="link">
                <BMedia v-if="item && item.user">
                  <template #aside>
                    <BImg
                      class="mt-2"
                      height="24"
                      width="24"
                      :alt="`${item.user?.givenName} ${item.user?.sn}`"
                      :aria-hidden="true"
                      :src="item.user?.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                  </template>
                  <div class="media-body">
                    <h3 class="h5 mb-0 text-dark text-truncate">
                      {{ $t('common.userFullName', { givenName: item.user?.givenName, sn: item.user?.sn }) }}
                    </h3>
                    <small class="text-truncate">
                      {{ item.user?.userName }}
                    </small>
                  </div>
                </BMedia>
                <div v-else>
                  {{ blankValueIndicator }}
                </div>
              </BButton>
            </div>
          </template>
          <template
            #cell(manager)="{ item }">
            <div
              v-if="item.manager"
              class="d-flex justify-content-start align-items-center">
              <BMedia>
                <template #aside>
                  <BImg
                    class="mt-2"
                    height="24"
                    width="24"
                    :alt="`${item.manager?.givenName} ${item.manager?.sn}`"
                    :aria-hidden="true"
                    :src="item.manager?.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                </template>
                <BMediaBody>
                  <h3 class="h5 mb-0 text-dark text-truncate">
                    {{ $t('common.userFullName', { givenName: item.manager?.givenName, sn: item.manager?.sn }) }}
                  </h3>
                  <small class="text-truncate">
                    {{ item.manager?.userName }}
                  </small>
                </BMediaBody>
              </BMedia>
            </div>
            <div v-else>
              {{ blankValueIndicator }}
            </div>
          </template>
          <template #cell(application)="{ item }">
            <div class="d-flex justify-content-between align-items-center">
              <BButton
                @click.stop="openApplicationModal(item.application, item.applicationOwner, item.glossary)"
                class="text-dark"
                variant="link">
                <BMedia
                  class="align-items-center"
                  data-testid="application-cell"
                  no-body>
                  <div class="size-36 fr-app-logo-bg d-flex align-items-center justify-content-center mr-3">
                    <img
                      class="size-28"
                      alt=""
                      :onerror="onImageError"
                      :src="getApplicationLogo(item.application)">
                  </div>
                  <div class="media-body align-self-center overflow-hidden text-nowrap">
                    <span class="text-dark">
                      {{ item.application.name }}
                    </span>
                  </div>
                </BMedia>
              </BButton>
            </div>
          </template>
          <template #cell(entitlement)="{ item }">
            <div class="d-flex justify-content-between align-items-center">
              <BButton
                @click.stop="openEntitlementModal(item)"
                class="text-dark pl-0"
                data-testid="entitlement-cell"
                variant="link">
                {{ getResourceDisplayName(item, '/entitlement') }}
              </BButton>
            </div>
          </template>
          <template #cell(account)="{ item }">
            <div class="d-flex justify-content-between align-items-center">
              <BButton
                @click.stop="openAccountModal(item)"
                class="text-dark pl-0"
                data-testid="account-cell"
                variant="link">
                {{ getResourceDisplayName(item, '/account') }}
              </BButton>
            </div>
          </template>
          <template #cell(role)="{ item }">
            <div class="d-flex justify-content-between align-items-center">
              <BButton
                @click.stop="openRoleModal(item)"
                class="text-dark pl-0"
                data-testid="role-cell"
                variant="link">
                {{ item.role.name }}
              </BButton>
            </div>
          </template>
          <template #cell(prediction)="{ item }">
            <FrRecommendationIcon
              v-if="Boolean(item.prediction)"
              :prediction="item.prediction"
              :id="item.id"
              type="certification"
              :auto-id-settings="autoIdSettings" />
          </template>
          <template #cell(flags)="{ item }">
            <div class="d-flex align-items-center">
              <div
                v-for="(flag, index) in item.flags"
                :key="`flags-${item.id}-${index}`"
                class="cursor-default">
                <FrIcon
                  :aria-label="$t(`governance.flags.${flag}`)"
                  icon-class="md-24 mr-3"
                  :id="`flags-${item.id}-${index}`"
                  :name="flagIcons[flag]"
                  role="img"
                  tabindex="-1" />
                <BTooltip
                  :target="`flags-${item.id}-${index}`"
                  triggers="focus hover"
                  placement="top">
                  {{ $t(`governance.flags.${flag}`) }}
                </BTooltip>
              </div>
            </div>
          </template>
          <template #cell(comments)="{ item }">
            <div
              class="d-flex justify-content-start align-items-center"
              v-if="getNumberOfComments(item)">
              <BButton
                @click="openViewCommentsModal(item.decision.certification.comments, item)"
                class="text-dark position-relative py-0"
                data-testid="cert-comments-button"
                variant="link">
                <FrIcon
                  icon-class="md-24"
                  name="chat_bubble_outline" />
                <BBadge
                  class="mr-1 position-absolute comments-counter"
                  pill
                  variant="danger">
                  {{ getNumberOfComments(item) }}
                </BBadge>
              </BButton>
            </div>
          </template>
          <template #cell()="data">
            <div
              class="text-truncate w-450px"
              :id="`${data.item.id}-${data.field.key}`">
              {{ getCellData(data) }}
            </div>
            <BPopover
              v-if="isTruncated(`${data.item.id}-${data.field.key}`)"
              :target="`${data.item.id}-${data.field.key}`"
              triggers="focus hover"
              placement="top">
              <div class="p-1">
                {{ getCellData(data) }}
              </div>
            </BPopover>
          </template>
          <template #cell(actions)="{ item }">
            <template v-if="item.decision.certification.status === 'signed-off'">
              <BBadge
                :variant="getVariant(item.decision.certification.decision)"
                @click="openActivityModal(item)"
                :id="`itemDecision-${item.id}`"
                class="w-100 cursor-pointer">
                {{ item.decision.certification.decision === 'certify' && item.isAcknowledge
                  ? $t('governance.certificationTask.actions.acknowledge')
                  : startCase(item.decision.certification.decision) }}
              </BBadge>
              <BTooltip
                placement="top"
                :target="`itemDecision-${item.id}`"
                triggers="hover"
                :title="$t('governance.certificationTask.actions.viewActivity')" />
            </template>
            <div
              v-else
              class="d-flex justify-content-end align-items-center">
              <FrTaskActionsCell
                @action="handleAction"
                :campaign-details="campaignDetails"
                :cert-grant-type="certificationGrantType"
                :item="item"
                :is-staged="isStaged" />

              <!-- Select Row To Display Entitlements -->
              <BButton
                v-if="showAccountDrilldown"
                :data-testid="`btnSelectEntitlement-${item.id}`"
                :id="`btnSelectEntitlement-${item.id}`"
                class="p-1"
                @click="onRowSelected(item)">
                <FrIcon
                  data-testid="group-by-icon"
                  icon-class="md-24"
                  name="chevron_right" />
              </BButton>
            </div>
          </template>
        </BTable>
        <FrNoData
          v-else
          :card="false"
          class="mb-4"
          data-testid="cert-task-list-no-data"
          icon="inbox"
          :subtitle="$t('governance.certificationTask.noItems')" />
        <FrPagination
          v-if="totalRows > pageSize"
          :value="paginationPage"
          :per-page="pageSize"
          :total-rows="totalRows"
          @input="paginationChange"
          @on-page-size-change="pageSizeChange" />
        <FrFloatingActionBar
          ref="floatingActionBar"
          :buttons="actionBarButtons"
          :count="selectedCount"
          :menu-items="actionBarMenuItems"
          @deselect="selectTasks(false)"
          @certify="openActionConfirmModal(bulkCertifyModalProps)"
          @revoke="openActionConfirmModal(bulkRevokeModalProps)"
          @exception="openActionConfirmModal(bulkExceptionModalProps)"
          @reassign="(triggerEl) => $bvModal.show(getModalId('reassign'), triggerEl)"
          @forward="(triggerEl) => openForwardModal(null, true, true, triggerEl)"
          @clearDecisions="bulkReset()" />
      </div>
    </div>
    <!-- Modals -->
    <FrColumnPicker
      v-bind="pickerProps"
      :allow-view-mode-toggle="true"
      :available-columns="columnPickerAvailableColumns"
      :modal-id="getModalId('sort')" />
    <FrForwardModal
      :id="currentItemId"
      :bulk="isBulk"
      :show-confirm="showConfirm"
      :modal-id="getModalId('forward')"
      @forward-item="forward"
      @forward-bulk="bulkForward" />
    <FrConfirmActionModal
      :modal-options="confirmActionModalProps"
      :modal-id="getModalId('confirm-action')" />
    <FrReassignModal
      @change-saving="toggleSaving"
      :modal-id="getModalId('reassign')"
      @refresh-data="updateItemList('reassignSuccess')"
      :campaign-id="campaignId"
      :selected-tasks="selectedItems"
      :all-selected="allSelected"
      :actor-id="actorId" />
    <FrCommentsModal
      :enable-add-comments="enableAddComments"
      :comments="currentCommentsSelectedModal"
      :modal-id="getModalId('view-comments')"
      @open-add-comment-modal="openAddCommentModalFromCommentsModal"
      @close-modal="currentCommentsSelectedModal = []" />
    <FrAddCommentModal
      @add-comment="addComment"
      :modal-id="getModalId('add-comment')" />
    <FrActivityModal
      :activity="currentLineItemActivity"
      :modal-id="getModalId('activity')"
      @close-modal="currentLineItemActivity = []" />
    <FrReviewersModal
      :reviewers="currentReviewersSelectedModal"
      :hide-creation-button="!currentLineItemReassignPermission"
      :modal-id="getModalId('view-reviewers')"
      @open-edit-reviewer-modal="openEditReviewerModal"
      @delete-reviewer="deleteReviewer" />
    <FrEditReviewerModal
      :reviewer="currentReviewerSelectedModal"
      :is-saving="isSavingReviewer"
      :is-deleting="isDeletingReviewer"
      :is-allowed-deletion="currentReviewerSelectedModal && currentReviewersSelectedModal.length > 1 && !isLastSignOffReviewer()"
      :modal-id="getModalId('edit-reviewers')"
      :current-user-permissions="currentUserPermissions"
      @close-modal="closeEditReviewerModal"
      @edit-reviewer="editReviewer"
      @delete-reviewer="deleteReviewer" />
    <FrApplicationModal
      v-if="currentApplicationSelectedModal"
      :application="currentApplicationSelectedModal"
      :glossary-schema="glossarySchema.application" />
    <FrAccountModal
      v-if="currentAccountSelectedModal"
      :grant="currentAccountSelectedModal" />
    <FrEntitlementModal
      :entitlement="currentEntitlementSelected"
      :glossary-schema="glossarySchema.entitlement"
      :modal-id="getModalId('entitlement')" />
    <FrRoleModal
      :glossary-schema="glossarySchema.role"
      :role-details="currentRoleSelected"
      :modal-id="getModalId('role')" />
    <FrGovernanceUserDetailsModal
      :manager="manager"
      :user="currentUserSelectedModal"
      :user-details="currentUserDetails"
      :display-properties="userDisplayProperties" />
    <FrDownloadItemsModal
      modal-id="certification-task-download-items-modal"
      :grant-type="certificationGrantType"
      :is-loading="isDownloadModalLoading"
      :totals="{ all: totalRows, currentPage: items.length }"
      :ok-function="exportItemsToFile" />
  </div>
</template>
<script>
import {
  BBadge,
  BButton,
  BButtonClose,
  BCard,
  BImg,
  BMedia,
  BMediaBody,
  BPopover,
  BTable,
  BTooltip,
} from 'bootstrap-vue';
import { ref, computed } from 'vue';
import {
  cloneDeep,
  countBy,
  filter,
  get,
  pick,
  debounce,
  sortBy as lodashSortBy,
  startCase,
} from 'lodash';
import {
  certifyItem,
  certifyItems,
  certifyAllItems,
  exceptionItem,
  exceptionItems,
  exceptionAllItems,
  forwardItem,
  forwardItems,
  forwardAllItems,
  getCertificationCounts,
  getCertificationTasksListByCampaign,
  getEntitlementDetails,
  getUserDetails,
  getUserDetailsByType,
  reassignItem,
  resetItem,
  resetAllItems,
  revokeItems,
  revokeAllItems,
  revokeItem,
  saveComment,
  updateActors,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import {
  getGlossarySchema,
  getFilterSchema,
  getIgaAutoIdConfig,
  getIgaUiConfig,
} from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { ADMIN_REVIEWER_PERMISSIONS, blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  convertColumnsToQueryFields,
  getCellData,
  getAllColumnCategories,
  getInitialColumns,
  processItemsForExport,
  setSelectedCategories,
} from '@forgerock/platform-shared/src/utils/governance/certificationColumns';
import { CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import { getGrantFlags, isAcknowledgeType, icons } from '@forgerock/platform-shared/src/utils/governance/flags';
import { getPredictionDisplayInfo } from '@forgerock/platform-shared/src/utils/governance/prediction';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrForwardModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/ForwardModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrGovernanceUserDetailsModal from '@forgerock/platform-shared/src/components/governance/UserDetailsModal';
import FrFloatingActionBar from '@forgerock/platform-shared/src/components/FloatingActionBar/FloatingActionBar';
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';
import FrRecommendationIcon from '@forgerock/platform-shared/src/components/governance/Recommendations/RecommendationIcon';
import FrAccountModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/AccountModal';
import FrEntitlementModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/EntitlementModal';
import FrRoleModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/RoleModal/RoleModal';
import FrAccessFilter from '@forgerock/platform-shared/src/components/governance/AccessFilter/AccessFilter';
import accessConstants from '../../Access/utils/accessConstants';
import {
  getInitialFilterData,
  generateFilter,
  getUserInfoFilter,
  USER_FILTERS,
  ROLE_FILTERS,
  ENTITLEMENT_FILTERS,
  GENERAL_FILTERS,
  APPLICATION_FILTERS,
  CERTIFICATION_FILTERS,
  ACCOUNT_FILTERS,
  addFilterTypes,
  resetFilterTypes,
} from './utils/taskFilterUtils';
import FrActivityModal from './modals/ActivityModal';
import FrAddCommentModal from './modals/AddCommentModal';
import FrApplicationModal from './modals/ApplicationModal';
import FrConfirmActionModal, { STEPS } from './modals/ConfirmActionModal';
import FrCommentsModal from './modals/CommentsModal';
import FrEditReviewerModal from './modals/EditReviewerModal';
import FrReviewersModal from './modals/ReviewersModal';
import FrReassignModal from './modals/ReassignModal';
import FrTaskActionsCell from './TaskActionsCell';
import FrTaskMultiSelect from './TaskMultiSelect';
import FrDownloadItemsModal from './modals/DownloadItemsModal/DownloadItemsModal';

const userRequiredParams = [
  'userName',
  'givenName',
  'sn',
  'mail',
  'accountStatus',
  'adminOfOrg',
  'aliasList',
  'city',
  'country',
  'description',
  'manager',
  'postalAddress',
  'postalCode',
  'stateProvince',
  'telephoneNumber',
];

const ACTIONS = new Map([
  ['certify', 'certifiedItem'],
  ['revoke', 'revokedItem'],
  ['exception', 'exceptionRequested'],
]);

export default {
  name: 'TaskList',
  components: {
    BBadge,
    BButton,
    BButtonClose,
    BCard,
    BImg,
    BMedia,
    BMediaBody,
    BPopover,
    BTable,
    BTooltip,
    FrPagination,
    FrActivityModal,
    FrForwardModal,
    FrAccountModal,
    FrColumnPicker,
    FrConfirmActionModal,
    FrAddCommentModal,
    FrApplicationModal,
    FrCommentsModal,
    FrDownloadItemsModal,
    FrEditReviewerModal,
    FrEntitlementModal,
    FrReassignModal,
    FrReviewersModal,
    FrRoleModal,
    FrField,
    FrFloatingActionBar,
    FrGovernanceUserDetailsModal,
    FrIcon,
    FrNoData,
    FrSpinner,
    FrTaskActionsCell,
    FrTaskMultiSelect,
    FrRecommendationIcon,
    FrAccessFilter,
  },
  setup(props) {
    const tasksFields = ref([]);
    const columnCategories = ref([]);
    const allAvailableColumns = computed(() => columnCategories.value.flatMap((cat) => cat.items || []));
    const {
      activeColumns,
      open: openColumnsModal,
      pickerProps,
    } = useColumnPicker(
      tasksFields,
      {
        storageKey: () => `certification-tasklist-column-picker-${props.campaignId}-${props.certificationGrantType}`,
        columnRegistry: allAvailableColumns,
      },
    );

    return {
      activeColumns,
      columnCategories,
      openColumnsModal,
      pickerProps,
      tasksFields,
    };
  },
  mixins: [NotificationMixin],
  props: {
    actorId: {
      type: String,
      default: '',
    },
    campaignDetails: {
      type: Object,
      default: () => ({}),
    },
    campaignId: {
      type: String,
      default: null,
    },
    certificationGrantType: {
      type: String,
      default: null,
    },
    entitlementUserId: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    refreshTasks: {
      type: Boolean,
      default: false,
    },
    showGroupBy: {
      type: Boolean,
      default: false,
    },
    taskStatus: {
      type: String,
      default: 'active',
    },
    modalPrefix: {
      type: String,
      default: 'account',
    },
  },
  data() {
    const defaultUserValue = {
      value: '',
      text: this.$t('governance.certificationTask.allUsers'),
    };
    const bulkCertifyModalProps = {
      confirmTitle: 'certifyConfirmTitle',
      confirmDescription: 'certifyConfirmDescription',
      okLabel: 'certifyTitle',
      okFunction: this.bulkCertify,
      initialStep: STEPS.CONFIRM,
    };
    const bulkRevokeModalProps = {
      title: 'revokeTitle',
      description: 'revokeDescription',
      placeHolder: 'revokePlaceHolder',
      confirmTitle: 'revokeConfirmTitle',
      confirmDescription: 'revokeConfirmDescription',
      okLabel: 'revokeTitle',
      okFunction: this.bulkRevoke,
      initialStep: STEPS.DETAILS,
      requireJustification: this.campaignDetails.requireJustification?.revoke,
    };
    const bulkExceptionModalProps = {
      title: 'exceptionTitle',
      description: 'exceptionDescription',
      placeHolder: 'exceptionPlaceHolder',
      confirmTitle: 'exceptionConfirmTitle',
      confirmDescription: 'exceptionConfirmDescription',
      okLabel: 'exceptionTitle',
      okFunction: this.bulkException,
      initialStep: STEPS.DETAILS,
      requireJustification: this.campaignDetails.requireJustification?.exceptionAllowed,
      textArgs: {
        days: this.campaignDetails.exceptionDuration,
      },
    };

    return {
      actionBarButtons: [{
        event: 'certify',
        icon: 'check',
        iconClass: 'text-success',
        label: this.$t('governance.certificationTask.actions.certify'),
      },
      {
        event: 'revoke',
        icon: 'close',
        iconClass: 'text-danger',
        label: this.$t('common.revoke'),
      }],
      actionBarMenuItems: [{
        event: 'exception',
        icon: 'schedule',
        label: this.$t('governance.certificationTask.actions.allowException'),
      },
      {
        event: 'reassign',
        icon: 'people',
        label: this.$t('governance.certificationTask.actions.reassign'),
      },
      {
        event: 'forward',
        icon: 'redo',
        label: this.$t('governance.certificationTask.actions.forward'),
      },
      {
        divider: true,
      },
      {
        event: 'clearDecisions',
        icon: 'close',
        label: this.$t('governance.certificationTask.actions.reset'),
      }],
      defaultUserValue,
      allSelected: false,
      blankValueIndicator,
      bulkCertifyModalProps,
      autoIdSettings: {},
      bulkExceptionModalProps,
      bulkRevokeModalProps,
      confirmActionModalProps: {},
      currentAccountSelectedModal: null,
      currentApplicationSelectedModal: null,
      currentCommentsSelectedModal: [],
      currentEntitlementSelected: null,
      currentFilters: {},
      currentItemId: '',
      currentLineItemActivity: [],
      currentLineItemIdSelectedModal: null,
      currentLineItemReassignPermission: false,
      currentPage: 1,
      currentReviewerSelectedModal: null,
      currentReviewersSelectedModal: [],
      currentRoleSelected: {},
      currentUserEntitlementsDetails: { result: [] },
      currentUserAccountsDetails: { result: [] },
      currentUserRolesDetails: { result: [] },
      currentUserPermissions: {},
      currentUserSelectedModal: {},
      enableAddComments: true,
      flagIcons: icons,
      isBulk: false,
      isDownloadModalLoading: false,
      isLoading: true,
      isDeletingReviewer: false,
      isSavingReviewer: false,
      items: [],
      refocusItemId: null,
      selectTriggerEl: null,
      listFilters: null,
      manager: {},
      pageSize: 10,
      paginationPage: 1,
      selectedItems: [],
      leftPanelExpanded: false,
      showConfirm: false,
      sortDir: 'asc',
      sortBy: 'user',
      tasksFieldsToSort: [],
      totalRows: 0,
      userDisplayProperties: [],
      glossarySchema: {
        application: [],
        entitlement: [],
        role: [],
      },
      filterSchema: {
        user: [],
      },
      filterProperties: {},
      revokeModalProps: {
        ...bulkRevokeModalProps,
        okFunction: this.revoke,
        noConfirmation: true,
      },
      exceptionModalProps: {
        ...bulkExceptionModalProps,
        okFunction: this.exception,
        noConfirmation: true,
      },
      targetFilter: null,
      filterData: getInitialFilterData(),
      users: [],
      debouncedTextSearch: debounce((field, value) => {
        this.filterData[field] = value;
      }),
      debounceUserSearch: debounce(this.getUserInfo, 500),
      roleFilters: ROLE_FILTERS,
      applicationFilter: APPLICATION_FILTERS,
      userFilter: USER_FILTERS,
      entitlementFilters: ENTITLEMENT_FILTERS,
      generalFilters: GENERAL_FILTERS,
      accountFilters: ACCOUNT_FILTERS,
      certificationFilter: CERTIFICATION_FILTERS,
      filterTypes: null,
    };
  },
  computed: {
    isStaged() {
      return this.campaignDetails?.status === 'staging';
    },
    certificationListColumnsToShow() {
      const columns = cloneDeep(this.activeColumns);

      if (this.campaignDetails.allowBulkCertify && !this.isStaged) {
        columns.unshift({
          key: 'selector',
          label: '',
          sortable: false,
          class: 'selector-column fr-no-resize sticky-left',
          show: true,
        });
      }

      return columns.map((col) => {
        if (col.key === 'manager._ref') {
          return { ...col, key: 'manager' };
        }
        return col;
      });
    },
    columnPickerAvailableColumns() {
      return this.columnCategories.map((category) => ({
        key: category.name,
        label: category.header,
        children: category.items,
      }));
    },
    isGroupByAccounts() {
      return this.showGroupBy && this.certificationGrantType === 'accounts';
    },
    isSelectable() {
      return this.showGroupBy && this.certificationGrantType === 'accounts';
    },
    currentUserDetails() {
      return {
        userAccounts: this.currentUserAccountsDetails,
        userEntitlements: this.currentUserEntitlementsDetails,
        userRoles: this.currentUserRolesDetails,
      };
    },
    showAccountDrilldown() {
      return this.isGroupByAccounts && !this.isStaged;
    },
    selectedCount() {
      return this.allSelected ? this.totalRows : this.selectedItems.length;
    },
    filterButtonLabel() {
      return this.leftPanelExpanded
        ? this.$t('governance.toolbar.hideFilters')
        : this.$t('governance.toolbar.showFilters');
    },
  },
  async mounted() {
    try {
      const { data } = await getGlossarySchema();
      this.glossarySchema = {
        application: data['/openidm/managed/application'],
        entitlement: data['/openidm/managed/assignment'],
        role: data['/openidm/managed/role'],
      };
    } catch (error) {
      this.showErrorMessage(error, this.$t('governance.certificationTask.errors.glossaryError'));
    }

    try {
      // User recommendations and predictions
      const { data: autoIdData } = await getIgaAutoIdConfig();
      this.autoIdSettings = autoIdData;
    } catch (error) {
      this.showErrorMessage(error, this.$t('governance.certificationTask.errors.autoIdError'));
    }

    try {
      const { data: uiConfigData } = await getIgaUiConfig();
      this.userDisplayProperties = uiConfigData?.user?.displayProperties || [];
    } catch (error) {
      // We don't need to show an error here
    }

    let filterProperties = {};
    try {
      const { data } = await getFilterSchema();
      filterProperties = data || {};
      this.filterProperties = filterProperties;
      this.filterSchema.user = filterProperties.user || [];
    } catch (error) {
      this.showErrorMessage(error, this.$t('governance.certificationTask.errors.glossaryError'));
    }

    const allColumnCategories = getAllColumnCategories(this.certificationGrantType || 'accounts', filterProperties, this.autoIdSettings);
    this.tasksFields = getInitialColumns(this.certificationGrantType, this.entitlementUserId, this.showAccountDrilldown, this.campaignDetails?.uiConfig?.columnConfig, allColumnCategories, this.autoIdSettings, this.campaignDetails?.uiConfig?.columnSortConfig);
    this.columnCategories = allColumnCategories;

    resetFilterTypes();
    this.filterData = getInitialFilterData();
    this.filterTypes = await generateFilter(this.certificationGrantType, this.campaignId, this.actorId, null, this.debounceUserSearch);

    try {
      await this.getItems(this.paginationPage);
      if (this.showGroupBy && this.certificationGrantType === 'accounts') {
        this.onRowSelected(this.items);
      }
    } catch (error) {
      this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certificationListError'));
    }
  },
  beforeDestroy() {
    resetFilterTypes();
  },
  methods: {
    getCellData,
    getAllColumnCategories,
    getInitialColumns,
    startCase,
    setSelectedCategories,
    toggleSaving() {
      this.$emit('change-saving');
    },
    /**
     * Returns the element that should receive focus after a modal opened from
     * a row-level action closes. When the active element is inside a floating
     * ARIA menu (role="menu" with aria-labelledby pointing to its toggle
     * button), the menu item is removed when the menu closes — so we walk up
     * to the toggle button instead of the (soon-removed) menu item.
     * @returns {HTMLElement|null}
     */
    getActionMenuTrigger() {
      const active = document.activeElement;
      const menuList = active?.closest('[role="menu"]');
      const menuButtonId = menuList?.getAttribute('aria-labelledby');
      return (menuButtonId && document.getElementById(menuButtonId)) || active || null;
    },
    /**
     * Returns the BTable row attributes for a given item, stamping each row
     * with a stable data-item-id attribute so focus can be restored to the
     * correct row after the item list reloads.
     * @param {Object} item the row item object
     * @param {String} type the row type ('row', 'row-details', 'row-selected', etc.)
     * @returns {Object} attributes to apply to the <tr> element
     */
    rowAttrs(item, type) {
      return type === 'row' ? { 'data-item-id': item.id } : {};
    },
    /**
     * Restores keyboard focus to the "more actions" toggle button for the item
     * that triggered a list-reloading action. Falls back to the first such
     * button in the table when the item has been removed from the list (e.g.
     * after a forward or reassign). No-op when itemId is falsy (bulk actions,
     * pagination, sort/filter changes).
     * @param {String|null} itemId the id of the item that triggered the action
     */
    restoreFocus(itemId, tableEl = this.$refs.selectableTable?.$el) {
      if (!itemId) return;
      if (!tableEl) return;
      const btn = tableEl.querySelector(`tr[data-item-id="${itemId}"] button[aria-haspopup="true"]`);
      const fallback = tableEl.querySelector('button[aria-haspopup="true"]');
      if (btn || fallback) (btn || fallback).focus();
    },
    /**
     * Moves focus to the first focusable element inside the filter section
     * after the collapse animation completes (WCAG 2.4.3).
     */
    focusFirstFilterElement() {
      const firstFocusable = this.$refs.filtersSectionRef?.querySelector(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) firstFocusable.focus();
    },
    filterItems(filters) {
      this.listFilters = { ...filters };
      this.getItems(1).then(() => {
        if (this.showGroupBy && this.certificationGrantType === 'accounts') {
          this.clearRowSelected();
        }
      });
    },
    getNumberOfComments(task) {
      const activity = task?.decision?.certification?.comments;
      const activityByAction = countBy(activity, (item) => item.action);
      return activityByAction?.comment || 0;
    },
    getVariant(status) {
      if (status === 'revoke') return 'danger';
      if (status === 'certify') return 'success';
      return '';
    },

    paginationChange(page) {
      this.paginationPage = page;
      this.getItems(page).then(() => {
        if (this.showGroupBy && this.certificationGrantType === 'accounts') {
          this.clearRowSelected();
        }
        if (this.allSelected) {
          this.selectAllTasks();
        }
      });
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.paginationChange(1); // When page size changes, resets the current page number to 1
    },
    sortChange({ sortBy, sortDesc }) {
      this.sortDir = sortDesc ? 'desc' : 'asc';
      this.sortBy = sortBy;
      this.paginationPage = 1;
      this.getItems(this.paginationPage);
    },
    async addFilter(newFilter, type) {
      this.filterData[newFilter.type] = {
        value: '',
        grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
      };
      addFilterTypes(newFilter, type);
      this.filterTypes = await generateFilter(this.certificationGrantType, this.campaignId, this.actorId, null, this.debounceUserSearch);
    },
    isItemSelected(itemId) {
      return this.allSelected || this.selectedItems.some((item) => item.id === itemId);
    },
    loadItemsList(resourceData, page) {
      this.totalRows = resourceData.data.totalCount;
      this.currentPage = page;
      const resultData = resourceData.data.result;

      this.items = resultData.map((item) => ({
        ...item,
        selected: this.isItemSelected(item.id),
        isAcknowledge: isAcknowledgeType(item) || false,
        flags: getGrantFlags(item),
        prediction: getPredictionDisplayInfo(item, this.autoIdSettings, this.filterSchema.user),
      }));
      this.$emit('check-progress');
      if (this.totalRows === 0) {
        this.$emit('hide-group-by');
      }
    },
    /**
     * Updates the current filter for retrieving grants
     */
    async updateAccessByFilter(updatedTargetFilter) {
      if (!this.leftPanelExpanded) return;
      const uniqueFilters = [...new Map(Object.values(updatedTargetFilter).map((f) => [JSON.stringify(f), f])).values()];
      this.targetFilter = {
        operator: 'AND',
        operand: [...uniqueFilters, ...this.getBaseFilters()],
      };
      this.paginationPage = 1;
      this.getItems(1);
    },

    /**
    * Clears out the current filters for retrieving grants
    */
    clearAccessFilters() {
      this.targetFilter = null;
      this.paginationPage = 1;
      this.getItems(1);
    },
    async getUserInfo(queryString) {
      const users = await getUserInfoFilter(this.campaignId, this.actorId, queryString);
      this.userFilter.components[0].props.options = users;
    },
    getItems(currentPage) {
      this.isLoading = true;
      if (this.certificationGrantType === 'entitlementComposition' && this.sortBy === 'user') {
        this.sortBy = 'entitlement';
      }
      const urlParams = this.buildUrlParams(currentPage, this.sortBy, this.sortDir);
      const payload = this.buildBodyParams();

      // if all users line items are complete, emit an event
      getCertificationCounts(this.campaignId, this.actorId, this.isAdmin, this.taskStatus)
        .then(({ data }) => {
          this.$emit('set-totals', data.totals);
        });

      return getCertificationTasksListByCampaign(urlParams, this.campaignId, payload)
        .then((resourceData) => {
          // Keep track of the current search parameters to be referenced in other operations like export
          this.currentFilters = { urlParams, payload };
          this.loadItemsList(resourceData, currentPage);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certificationListError'));
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    /**
     * Manages the update of the certification when performing any action on it
     * @param {String} message message to be displayed in the success notification
     * @param {Number} page number of page to reload
     */
    updateItemList(message, page = 1) {
      const itemId = this.refocusItemId;
      this.refocusItemId = null;
      this.selectTriggerEl = null;
      this.displayNotification('success', this.$t(`governance.certificationTask.success.${message}`));
      this.selectTasks(false);
      this.clearRowSelected();
      this.getItems(page).then(() => {
        this.$nextTick(() => this.restoreFocus(itemId));
      });
      this.$emit('update-details');
    },
    getFilterGrantType(certificationGrantType = '') {
      let grantType;
      if (certificationGrantType === 'accounts') grantType = 'accountGrant';
      if (certificationGrantType === 'entitlements') grantType = 'entitlementGrant';
      if (certificationGrantType === 'entitlementComposition') grantType = 'entitlement';
      if (certificationGrantType === 'roles') grantType = 'roleMembership';

      return getBasicFilter('EQUALS', 'item.type', grantType);
    },
    getBaseFilters() {
      const filterPath = this.isAdmin
        ? 'decision.certification.primaryReviewer.id'
        : 'decision.certification.actors.id';

      const formattedFilters = getBasicFilter('EQUALS', filterPath, this.actorId);
      let baseFilters = [formattedFilters];

      if (this.certificationGrantType) {
        const filterGrantType = this.getFilterGrantType(this.certificationGrantType);
        baseFilters = [...baseFilters, filterGrantType];
      }
      return baseFilters;
    },
    buildBodyParams() {
      if (this.targetFilter) {
        return { targetFilter: this.targetFilter };
      }
      if (!this.listFilters) {
        let defaultBaseFilter = this.getBaseFilters();
        if (this.entitlementUserId) {
          defaultBaseFilter = [...defaultBaseFilter, getBasicFilter('EQUALS', 'user.id', this.entitlementUserId)];
        }
        return {
          targetFilter: {
            operator: 'AND',
            operand: defaultBaseFilter,
          },
        };
      }
      const decisionsFilter = this.listFilters.decision;
      const includeNoDecision = decisionsFilter?.includes('noDecision');
      const user = this.entitlementUserId || this.listFilters.user;
      const userFilter = getBasicFilter('EQUALS', 'user.id', user);
      const applicationFilter = getBasicFilter('EQUALS', 'application.id', this.listFilters.application);
      const decisionsToFilter = decisionsFilter.filter((decision) => (decision !== 'noDecision'));
      const decisionFilter = getBasicFilter('IN', 'decision.certification.decision', decisionsToFilter);
      const noDecisionFilter = {
        operator: 'NOT',
        operand: [getBasicFilter('EXISTS', 'decision.certification.decision')],
      };
      const userApplicationFilter = [applicationFilter, userFilter].filter((filterInput) => (filterInput.operand.targetValue));
      const operandTargetFilter = {
        operator: includeNoDecision ? 'OR' : 'AND',
        operand: includeNoDecision ? [decisionFilter, noDecisionFilter] : [decisionFilter, ...userApplicationFilter],
      };

      const targetFilter = {
        targetFilter: {
          operator: 'AND',
          operand: includeNoDecision ? [operandTargetFilter, ...userApplicationFilter, ...this.getBaseFilters()]
            : [operandTargetFilter, ...this.getBaseFilters()],
        },
      };
      return targetFilter;
    },
    buildUrlParams(pageNumber, sortBy, sortDir) {
      const sortByColumn = this.getSortParam(sortBy);
      const params = {
        appendUserPermissions: true,
        pageSize: this.pageSize,
        pageNumber: pageNumber - 1,
        sortBy: sortByColumn,
        sortDir,
      };

      const sortType = this.getSortType(sortBy);
      if (sortType) {
        params.sortType = sortType;
      }

      // staged campaigns grab all tasks, status is not important
      if (this.taskStatus !== CampaignStates.STAGING) params.taskStatus = this.taskStatus;

      if (this.isAdmin) {
        params.isAdmin = this.isAdmin;
        params.actorId = this.actorId;
      }
      return params;
    },
    getSortParam(sortBy) {
      switch (sortBy) {
        case 'application':
          return 'application.templateName';
        case 'user':
          return 'user.givenName';
        case 'role':
          return 'role.name';
        case 'prediction':
          return 'prediction.confidence';
        case 'entitlement':
          return 'descriptor.idx./entitlement.displayName';
        default:
          return sortBy;
      }
    },
    getSortType(sortBy) {
      switch (sortBy) {
        case 'prediction':
          return 'int';
        default:
          return null;
      }
    },
    /**
     * Select a single task for bulk actions
     * @param {Boolean} selectValue select or deselect items
     * @param {Object} item single certification item
     */
    selectTask(selectValue, item) {
      this.allSelected = false;
      if (selectValue) {
        const isAlreadySelected = this.selectedItems.some((task) => task.id === item.id);
        if (!isAlreadySelected) {
          this.selectedItems.push(item);
        }
      } else {
        this.selectedItems = this.selectedItems.filter((task) => task.id !== item.id);
      }
      const tasksListClone = cloneDeep(this.items);
      this.items = tasksListClone.map((task) => {
        if (task.id === item.id) {
          return {
            ...task,
            selected: selectValue,
          };
        }
        return task;
      });
    },
    /**
     * Select all tasks for bulk actions
     * @param {Boolean} selectValue select or deselect items
     */
    selectTasks(selectValue) {
      this.allSelected = false;
      this.selectedItems = [];
      const tasksListClone = cloneDeep(this.items);
      this.items = tasksListClone.map((task) => {
        if (selectValue && !task.isAcknowledge) this.selectedItems.push(task);
        return {
          ...task,
          selected: selectValue,
        };
      });
      if (selectValue) {
        this.saveSelectTrigger();
        this.$nextTick(this.focusActionBarDeselect);
      } else if (this.selectTriggerEl) {
        this.$nextTick(() => {
          if (this.selectTriggerEl) this.selectTriggerEl.focus();
          this.selectTriggerEl = null;
        });
      }
    },
    /**
     * Moves focus to the Deselect button in the floating action bar after
     * a bulk-select action, so keyboard users land in the updated region (WCAG 2.4.3).
     */
    focusActionBarDeselect() {
      const bar = this.$refs.floatingActionBar;
      if (bar && typeof bar.focusDeselectButton === 'function') bar.focusDeselectButton();
    },
    /**
     * Saves a reference to the TaskMultiSelect toggle button so focus can be
     * returned to it when the floating action bar is dismissed (WCAG 2.4.3).
     */
    saveSelectTrigger() {
      const multiSelectEl = this.$refs.taskMultiSelect?.$el;
      this.selectTriggerEl = multiSelectEl?.querySelector('button') || null;
    },
    /**
     * Select all tasks for bulk actions
     * @param {Boolean} selectValue select or deselect items
     */
    selectAllTasks() {
      this.selectTasks(true);
      this.allSelected = true;
    },
    /**
     * Determines whether the button is to be displayed pressed depending on
     * the decision applied in the item
     * @param {Object} item object with item decision information
     * @param {String} status string to be compared to determine if the button is pressed
     */
    pressedButton(item, status) {
      const decision = get(item, 'decision.certification.decision', '');
      return decision === status;
    },
    onRowSelected(items) {
      const item = Array.isArray(items) ? items[0] : items;
      if (!item) {
        this.clearRowSelected();
        return;
      }
      const itemIndex = this.items.findIndex((taskItem) => taskItem.id === item.id);
      if (this.$refs.selectableTable?.selectRow) {
        this.$refs.selectableTable.selectRow(itemIndex);
      }

      this.$emit('select-item', item);
    },
    clearRowSelected() {
      if (this.$refs.selectableTable?.clearSelected) {
        this.$refs.selectableTable.clearSelected();
      }
      this.$emit('clear-item');
    },
    getResourceDisplayName(item, resource) {
      return item.descriptor?.idx?.[resource]?.displayName;
    },
    getApplicationLogo,
    onImageError,
    /**
     * Handles actions events from single items
     * @param {String} type action type
     * @param {Object} item single certification item
     */
    handleAction(type, item) {
      this.refocusItemId = item.id;
      const triggerEl = this.getActionMenuTrigger();
      if (this.pressedButton(item, type)) {
        this.resetLineItem(item.id);
        return;
      }

      switch (type) {
        case 'certify':
          this.toggleSaving();

          certifyItem(this.campaignId, item.id).then(() => {
            this.updateItemList('saveSuccessful', this.paginationPage);
          }).catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certifyError'));
          }).finally(() => {
            this.toggleSaving();
          });
          break;
        case 'revoke':
          this.openActionConfirmModal(this.revokeModalProps, item.id, triggerEl);
          break;
        case 'exception':
          this.openActionConfirmModal(this.exceptionModalProps, item.id, triggerEl);
          break;
        case 'viewReviewers':
          this.openReviewersModal(item, triggerEl);
          break;
        case 'forward':
          this.openForwardModal(item.id, false, false, triggerEl);
          break;
        case 'comment':
          this.openAddCommentModal(item.id, triggerEl);
          break;
        case 'activity':
          this.openActivityModal(item, triggerEl);
          break;
        default:
          break;
      }
    },
    /**
     * Reset a line item to no decision state
     * @param {String} id item id to reset
     */
    resetLineItem(id) {
      this.toggleSaving();
      resetItem(this.campaignId, id).then(() => {
        this.updateItemList('saveSuccessful', this.paginationPage);
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certifyError'));
      }).finally(() => {
        this.toggleSaving();
      });
    },
    /**
     * Performs the revoke to the selected item
     * @param {String} comment comment for the revoke
     */
    revoke(comment) {
      this.toggleSaving();
      revokeItem(this.campaignId, this.currentItemId, comment)
        .then(() => {
          this.updateItemList('saveSuccessful', this.paginationPage);
          this.currentItemId = '';
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.revokeError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    /**
     * Performs the exception to the selected item
     * @param {String} comment comment for the exception
     */
    exception(comment) {
      this.toggleSaving();
      exceptionItem(this.campaignId, this.currentItemId, comment)
        .then(() => {
          this.updateItemList('saveSuccessful', this.paginationPage);
          this.currentItemId = '';
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.allowExceptionError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    /**
     * @param {Object} data data of the certification to forward
     * @param {String} data.id id of the certification to forward
     * @param {String} data.comment comment for the forward
     * @param {String} data.newActorId id of new actor
     */
    forward({ id, comment, newActorId }) {
      this.toggleSaving();
      forwardItem(this.campaignId, id, comment, newActorId)
        .then(() => {
          this.updateItemList('reviewItemForwarded', this.paginationPage);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.forwardItemError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    addComment(comment) {
      const itemId = this.refocusItemId;
      this.refocusItemId = null;
      saveComment(this.campaignId, this.currentLineItemIdSelectedModal, comment).then(() => {
        this.getItems(this.paginationPage)
          .then(() => {
            const currentTask = this.items.find((task) => task.id === this.currentLineItemIdSelectedModal);
            const taskActivity = currentTask?.decision?.certification?.comments;
            const comments = filter(taskActivity, { action: 'comment' });
            this.currentCommentsSelectedModal = comments;
            this.$nextTick(() => this.restoreFocus(itemId));
          });
        this.displayNotification('success', this.$t('governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage'));
        this.$bvModal.hide(this.getModalId('add-comment'));
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.addCommentErrorDefaultMessage'));
      });
    },
    deleteReviewer(reviewerId, closeModal) {
      this.isDeletingReviewer = true;
      let deletedReviewerIndex;
      const newReviewers = this.currentReviewersSelectedModal.filter((reviewer, index) => {
        if (reviewer.id === reviewerId) deletedReviewerIndex = index;

        return reviewer.id !== reviewerId;
      });
      updateActors(this.currentLineItemIdSelectedModal, newReviewers).then(() => {
        this.displayNotification('success', this.$t('governance.certificationTask.lineItemReviewersModal.removeReviewerSuccessfullyMessage'));
        this.currentReviewersSelectedModal.splice(deletedReviewerIndex, 1);

        if (closeModal) this.closeEditReviewerModal();
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.lineItemReviewersModal.removeReviewerErrorMessage'));
      }).finally(() => {
        this.isDeletingReviewer = false;
      });
    },
    editReviewer(reviewerId, permissions, newReviewer) {
      this.isSavingReviewer = true;

      // Verify if the user already exists on current reviewers
      if (newReviewer && this.currentReviewersSelectedModal.some((reviewer) => reviewer.id === reviewerId)) {
        this.showErrorMessage('error', this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerUserExistsErrorMessage'));
        this.isSavingReviewer = false;
        return;
      }

      // assign the permissions to the user
      reassignItem(this.campaignId, this.currentLineItemIdSelectedModal, reviewerId, permissions).then(() => {
        let messageKey = 'governance.certificationTask.lineItemReviewersModal.editReviewerSuccessfullyMessage';
        const currentReviewer = this.currentReviewersSelectedModal.find((reviewer) => reviewer.id === reviewerId);
        if (!currentReviewer) {
          newReviewer.id = reviewerId;
          newReviewer.permissions = permissions;
          this.currentReviewersSelectedModal.push(newReviewer);
          messageKey = 'governance.certificationTask.lineItemReviewersModal.addReviewerSuccessfullyMessage';
        } else {
          currentReviewer.permissions = permissions;
        }
        this.displayNotification('success', this.$t(messageKey));
        this.closeEditReviewerModal();
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerErrorMessage'));
      }).finally(() => {
        this.isSavingReviewer = false;
      });
    },
    isLastSignOffReviewer() {
      const signOffReviewers = this.currentReviewersSelectedModal.filter((reviewer) => reviewer.permissions.signoff);
      if (signOffReviewers.length > 1) return false;
      return signOffReviewers[0].id === this.currentReviewerSelectedModal.id;
    },
    bulkCertify() {
      this.toggleSaving();
      if (this.allSelected) {
        certifyAllItems(this.campaignId, this.actorId).then(() => {
          this.toggleSaving();
          setTimeout(() => {
            this.updateItemList('certifySuccess');
          }, 500);
        });
      } else {
        const payload = { ids: this.selectedItems.map((task) => (task.id)) };
        certifyItems(this.campaignId, payload)
          .then(() => {
            this.toggleSaving();
            this.updateItemList('certifySuccess');
          });
      }
    },
    bulkRevoke(comment) {
      this.toggleSaving();
      const payload = { comment, ids: this.selectedItems.map((task) => (task.id)) };
      if (this.allSelected) {
        delete payload.ids;
        revokeAllItems(this.campaignId, this.actorId, payload)
          .then(() => {
            this.toggleSaving();
            setTimeout(() => {
              this.updateItemList('revokeSuccess');
            }, 500);
          })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.revokeError'));
          });
      } else {
        revokeItems(this.campaignId, payload)
          .then(() => {
            this.toggleSaving();
            this.updateItemList('revokeSuccess');
          })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.revokeError'));
          });
      }
    },
    bulkException(comment) {
      this.toggleSaving();
      const payload = { comment, ids: this.selectedItems.map((task) => (task.id)) };
      if (this.allSelected) {
        delete payload.ids;
        exceptionAllItems(this.campaignId, this.actorId, payload)
          .then(() => {
            this.toggleSaving();
            setTimeout(() => {
              this.updateItemList('allowExceptionSuccess');
            }, 500);
          })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.allowExceptionError'));
          });
      } else {
        exceptionItems(this.campaignId, payload)
          .then(() => {
            this.toggleSaving();
            this.updateItemList('allowExceptionSuccess');
          })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.allowExceptionError'));
          });
      }
    },
    bulkForward({ comment, newActorId }) {
      this.toggleSaving();
      const payload = { comment, newActorId, ids: this.selectedItems.map((task) => (task.id)) };
      if (this.allSelected) {
        delete payload.ids;
        forwardAllItems(this.campaignId, this.actorId, payload)
          .then(() => {
            this.toggleSaving();
            setTimeout(() => {
              this.updateItemList('onForwardSuccess');
            }, 500);
          })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.onForwardError'));
          });
      } else {
        forwardItems(this.campaignId, payload)
          .then(() => {
            this.toggleSaving();
            this.updateItemList('onForwardSuccess');
          })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('governance.certificationTask.errors.onForwardError'));
          });
      }
    },
    bulkReset() {
      this.toggleSaving();
      resetAllItems(this.campaignId, this.actorId)
        .then(() => {
          this.toggleSaving();
          setTimeout(() => {
            this.updateItemList('resetSuccess');
          }, 500);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.resetError'));
        });
    },
    getModalId(suffix) {
      return `certification-${this.modalPrefix}-${suffix}`;
    },
    openActionConfirmModal({
      title,
      description,
      placeHolder,
      okLabel,
      okFunction,
      initialStep,
      confirmDescription,
      confirmTitle,
      requireJustification,
      noConfirmation,
      textArgs,
    }, currentItemId = null, triggerEl) {
      this.currentItemId = currentItemId;
      this.confirmActionModalProps = {
        title,
        description,
        confirmDescription,
        confirmTitle,
        placeHolder,
        okLabel,
        okFunction,
        initialStep: initialStep || STEPS.DETAILS,
        requireJustification,
        noConfirmation,
        textArgs,
      };
      this.$bvModal.show(this.getModalId('confirm-action'), triggerEl);
    },
    /**
     * Parse the activity information in the item and open the corresponding modal
     * @param {Object} item all item information
     */
    openActivityModal(item, triggerEl) {
      const lineItemActivity = item?.decision?.certification;
      const activityList = get(lineItemActivity, 'comments', []);

      if (lineItemActivity?.decision) {
        // if the item has been certified it is added to the activity array
        const { decision, decisionDate, decisionBy } = lineItemActivity;
        const decisionItem = {
          action: decision,
          comment: this.$t(`governance.certificationTask.lineItemActivityModal.${ACTIONS.get(decision)}`),
          timeStamp: decisionDate,
          user: decisionBy,
        };
        activityList.push(decisionItem);
      }
      const sortedActivity = lodashSortBy(activityList, 'timeStamp');
      this.currentLineItemActivity = sortedActivity;
      this.$bvModal.show(this.getModalId('activity'), triggerEl);
    },
    openViewCommentsModal(activity, lineItem) {
      this.enableAddComments = lineItem.permissions?.comment;
      const comments = filter(activity, { action: 'comment' });
      this.currentCommentsSelectedModal = comments;
      this.currentLineItemIdSelectedModal = lineItem.id;
      this.$nextTick(() => {
        this.$bvModal.show(this.getModalId('view-comments'));
      });
    },
    openAddCommentModal(lineItemId, triggerEl) {
      this.currentLineItemIdSelectedModal = lineItemId;
      this.$bvModal.show(this.getModalId('add-comment'), triggerEl);
    },
    openAddCommentModalFromCommentsModal() {
      this.$bvModal.hide(this.getModalId('view-comments'));
      this.$bvModal.show(this.getModalId('add-comment'));
    },
    openReviewersModal({ id, decision: { certification: { actors } }, permissions: { reassign } }, triggerEl) {
      this.currentLineItemIdSelectedModal = id;
      this.currentReviewersSelectedModal = actors;
      this.currentLineItemReassignPermission = reassign;
      this._reviewersTriggerEl = triggerEl;
      this.$bvModal.show(this.getModalId('view-reviewers'), triggerEl);
    },
    openEditReviewerModal(reviewer) {
      this.currentReviewerSelectedModal = reviewer;
      this.currentUserPermissions = this.isAdmin
        ? ADMIN_REVIEWER_PERMISSIONS
        : this.currentReviewersSelectedModal.find((currentReviewer) => currentReviewer.id === this.actorId)?.permissions;
      this.$bvModal.hide(this.getModalId('view-reviewers'));
      this.$bvModal.show(this.getModalId('edit-reviewers'), this._reviewersTriggerEl);
    },
    closeEditReviewerModal() {
      this.$bvModal.hide(this.getModalId('edit-reviewers'));
      this.$bvModal.show(this.getModalId('view-reviewers'), this._reviewersTriggerEl);
      this.currentReviewerSelectedModal = null;
      this.currentUserPermissions = {};
    },
    openForwardModal(id, isBulk, showConfirm, triggerEl) {
      this.currentItemId = id;
      this.isBulk = isBulk;
      this.showConfirm = showConfirm;
      this.$bvModal.show(this.getModalId('forward'), triggerEl);
    },
    openUserModal(lineItemId, manager) {
      getUserDetails(this.campaignId, lineItemId)
        .then(({ data }) => {
          this.manager = manager;
          this.currentUserSelectedModal = pick(data, userRequiredParams);
          this.$bvModal.show('GovernanceUserDetailsModal');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.getUserError'));
        });

      // Get entitlements details
      getUserDetailsByType(this.campaignId, lineItemId, 'entitlements').then(({ data }) => {
        this.currentUserEntitlementsDetails = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.getUserEntitlementsError'));
      });
      // Get accounts details
      getUserDetailsByType(this.campaignId, lineItemId, 'accounts').then(({ data }) => {
        this.currentUserAccountsDetails = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.getUserEntitlementsError'));
      });
      // Get roles details
      getUserDetailsByType(this.campaignId, lineItemId, 'roles').then(({ data }) => {
        this.currentUserRolesDetails = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.getUserEntitlementsError'));
      });
    },
    openAccountModal(item) {
      this.currentAccountSelectedModal = { ...item };
      delete this.currentAccountSelectedModal.account?.metadata;
      delete this.currentAccountSelectedModal.account?.proxyAddresses;

      this.$nextTick(() => {
        this.$bvModal.show('CertificationTaskAccountModal');
      });
    },
    async openApplicationModal(application, applicationOwners, glossary) {
      this.currentApplicationSelectedModal = {
        ...application,
        applicationOwners,
        glossary,
      };
      this.$nextTick(() => {
        this.$bvModal.show('CertificationTaskApplicationModal');
      });
    },
    async openEntitlementModal(item) {
      try {
        const { data } = await getEntitlementDetails(this.campaignId, item.id);
        this.currentApplicationSelectedModal = item.application;
        this.currentEntitlementSelected = {
          entitlement: data,
          ...item,
        };
        this.$bvModal.show(this.getModalId('entitlement'));
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.entitlementModal.loadErrorMessage'));
      }
    },
    openRoleModal(item) {
      this.currentRoleSelected = {
        role: item.role,
        glossary: item.glossary,
        roleOwner: item.roleOwner,
      };
      this.$bvModal.show(this.getModalId('role'));
    },
    isTruncated(id) {
      const el = document.getElementById(id);
      if (el) {
        return el.offsetWidth < el.scrollWidth;
      }
      return false;
    },
    openDownloadModal() {
      this.$bvModal.show('certification-task-download-items-modal');
    },
    async exportItemsToFile(downloadOptions) {
      this.isDownloadModalLoading = true;
      try {
        // Get the download options chosen
        const { format, rows } = downloadOptions;
        // Build the file name and title for export file
        const { name } = this.campaignDetails;
        const exportTitle = this.$t('governance.certificationTask.exportModal.exportTitle', { certificationName: name });
        // Convert the current columns into query fields
        const currentColumnFields = this.activeColumns.map((column) => `${column.category}.${column.key}`);
        const exportFields = convertColumnsToQueryFields(currentColumnFields);
        let exportItems = this.items.map((item) => {
          const { // Remove virtual fields
            flags, selected, isAcknowledge, ...rest
          } = item;
          return rest;
        });
        if (rows === 'all') {
          // If selecting all rows to export, execute a query for all items with only the specific fields required
          const { urlParams, payload } = this.currentFilters;
          const queryFields = this.isAdmin ? exportFields : ['decision.certification.actors', ...exportFields]; // actors field required for end users
          urlParams.pageSize = format === 'pdf' ? 1000 : 10000; // limit to 10k for non-pdf exports, 1k for pdf
          urlParams.pageNumber = 0;
          urlParams.fields = queryFields.join(',');
          const { data } = await getCertificationTasksListByCampaign(urlParams, this.campaignId, payload);
          exportItems = data.result;
        }
        // Format data for export and trigger download
        const finalExportItems = processItemsForExport(exportItems, exportFields, this.activeColumns);
        downloadAsType(finalExportItems, format, `${exportTitle}.${format}`, exportTitle);
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.exportError'));
      } finally {
        this.isDownloadModalLoading = false;
      }
    },
  },
  watch: {
    refreshTasks(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.getItems(this.paginationPage);
        this.$emit('refresh-complete');
      }
    },
    entitlementUserId() {
      this.getItems(1);
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.certification-task-filter) {
  border: 1px solid $gray-200;

  .certification-task-filter-selected {
    width: 95%;
  }

}
:deep(.certification-task-filter-dropdown) {
  .multiselect__tags {
    min-height: 85px;
  }

  .multiselect__single > .certification-task-filter-default {
    margin-top: 32px;
  }
}
.certification-task-list {
  &_controls {
    padding: 10px;
  }
}
.clickable:hover {
  cursor: pointer;
  text-decoration: underline;
}
.comments-counter {
  right: 0.25rem;
  top: -0.25rem;
}

.action-bar-visible {
  padding-bottom: 120px !important;
}

.min-width-0 {
  min-width: 0;
}

.fr-left-panel {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  min-height: 0;
  overflow: hidden;
}

.fr-left-panel .scroll-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

@media (min-width: 992px) {
  .fr-left-panel {
    position: sticky;
    top: 0;
    max-height: 100vh;
  }
}

:deep {
  .task-list-table .selector-column {
    overflow: visible !important;
    .custom-checkbox {
      padding-left: 2.25rem;
    }
  }
  .fr-access-cell {
    padding: 0.5rem 1.5rem !important;
  }
  .cert-actions {
    box-shadow: -4px 0px 5px 0px rgb(0 0 0 / 5%);
  }
  .w-230px {
    width: 230px;
  }
  .w-450px {
    max-width: 450px;
  }
}
</style>
