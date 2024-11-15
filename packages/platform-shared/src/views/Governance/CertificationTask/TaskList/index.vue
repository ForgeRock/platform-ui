<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex justify-content-between certification-task-list_controls">
      <div class="d-flex justify-content-start">
        <FrTaskMultiSelect
          v-if="campaignDetails.allowBulkCertify && !isStaged"
          @select-tasks="selectTasks($event)"
          @select-all-tasks="selectAllTasks"
          :campaign-details="campaignDetails"
          :cert-grant-type="certificationGrantType"
          :selected-tasks="selectedItems" />
      </div>
      <div>
        <BButton
          v-if="!entitlementUserId"
          @click="showFiltersSection = !showFiltersSection"
          :aria-label="$t('governance.showFilters')"
          class="mr-2"
          data-testid="cert-filter-button"
          variant="link-dark">
          <FrIcon name="filter_list" />
        </BButton>
        <BButton
          @click="openSortModal()"
          :aria-label="$t('common.customizeColumns')"
          class="mr-2"
          variant="link-dark">
          <FrIcon name="view_column" />
        </BButton>
      </div>
    </div>
    <div v-show="showFiltersSection">
      <FrTaskFilters
        v-if="!entitlementUserId"
        @filter-certification-items="filterItems"
        :actor-id="actorId"
        :cert-id="campaignId" />
    </div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTable
      v-else-if="items.length"
      @row-selected="onRowSelected"
      @sort-changed="sortChange"
      class="m-0 border-top border-bottom task-list-table"
      ref="selectableTable"
      responsive
      select-mode="single"
      show-empty
      :empty-text="$t('common.noRecordsToShow')"
      :fields="certificationListColumnsToShow"
      :items="items"
      :no-local-sorting="true"
      :per-page="pageSize"
      :selectable="isSelectable"
      :sort-by="sortBy"
      :sort-desc="sortDir === 'desc'">
      <template #cell(selector)="{ item }">
        <FrField
          v-if="item.decision.certification.status !== 'signed-off' && !item.isAcknowledge && !isStaged"
          @change="selectTask($event, item)"
          class="m-4"
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
            <BMedia>
              <template #aside>
                <BImg
                  class="mt-2"
                  height="24"
                  width="24"
                  :alt="item.text"
                  :aria-hidden="true"
                  :src="item.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              </template>
              <div class="media-body">
                <h3 class="h5 mb-0 text-dark text-truncate">
                  {{ $t('common.userFullName', { givenName: item.user.givenName, sn: item.user.sn }) }}
                </h3>
                <small class="text-truncate">
                  {{ item.user.userName }}
                </small>
              </div>
            </BMedia>
          </BButton>
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
              <img
                class="mr-4 size-28"
                :alt="$t('common.logo')"
                :aria-hidden="true"
                :onerror="onImageError"
                :src="getApplicationLogo(item.application)">
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
      <template #cell(flags)="{ item }">
        <div class="d-flex align-items-center">
          <div
            v-for="(flag, index) in item.flags"
            :key="`flags-${item.id}-${index}`"
            class="cursor-default">
            <FrIcon
              :id="`flags-${item.id}-${index}`"
              icon-class="md-24 mr-3"
              :name="flagIcons[flag]" />
            <BTooltip
              :target="`flags-${item.id}-${index}`"
              triggers="hover"
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
        {{ getColumnData(data) }}
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
    <BPagination
      v-if="totalRows > pageSize"
      :value="paginationPage"
      :class="`py-3 justify-content-center pagination-material-buttons ${selectedCount > 0 ? 'action-bar-visible' : ''}`"
      :per-page="pageSize"
      :total-rows="totalRows"
      @input="paginationChange" />
    <FrFloatingActionBar
      :buttons="actionBarButtons"
      :count="selectedCount"
      :menu-items="actionBarMenuItems"
      @deselect="selectTasks(false)"
      @certify="openActionConfirmModal(bulkCertifyModalProps)"
      @revoke="openActionConfirmModal(bulkRevokeModalProps)"
      @exception="openActionConfirmModal(bulkExceptionModalProps)"
      @reassign="$bvModal.show(getModalId('reassign'))"
      @forward="openForwardModal(null, true, true)"
      @clearDecisions="bulkReset()" />
    <!-- Modals -->
    <FrColumnOrganizer
      @update-columns="updateColumns"
      @hidden="closeSortModal"
      :active-columns="tasksFieldsToSort"
      :available-columns="availableColumns"
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
    <FrEntitlmentModal
      :application="currentApplicationSelectedModal"
      :entitlement="currentEntitlementSelected"
      :glossary-schema="glossarySchema.entitlement"
      :modal-id="getModalId('entitlement')" />
    <FrRoleModal
      :glossary-schema="glossarySchema.role"
      :role="currentRoleSelected"
      :modal-id="getModalId('role')" />
    <FrGovernanceUserDetailsModal
      :manager="manager"
      :user="currentUserSelectedModal"
      :user-details="currentUserDetails" />
  </div>
</template>
<script>
import {
  BBadge,
  BButton,
  BImg,
  BMedia,
  BPagination,
  BTable,
  BTooltip,
} from 'bootstrap-vue';
import {
  capitalize,
  cloneDeep,
  countBy,
  filter,
  get,
  isEmpty,
  isNil,
  pick,
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
import { getGlossarySchema, getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { ADMIN_REVIEWER_PERMISSIONS, blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import { getGrantFlags, isAcknowledgeType, icons } from '@forgerock/platform-shared/src/utils/governance/flags';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrForwardModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/ForwardModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrGovernanceUserDetailsModal from '@forgerock/platform-shared/src/components/governance/UserDetailsModal';
import FrFloatingActionBar from '@forgerock/platform-shared/src/components/FloatingActionBar/FloatingActionBar';
import FrColumnOrganizer from '@forgerock/platform-shared/src/components/ColumnOrganizer/ColumnOrganizer';
import FrAccountModal from './modals/AccountModal';
import FrActivityModal from './modals/ActivityModal';
import FrAddCommentModal from './modals/AddCommentModal';
import FrApplicationModal from './modals/ApplicationModal';
import FrConfirmActionModal, { STEPS } from './modals/ConfirmActionModal';
import FrCommentsModal from './modals/CommentsModal';
import FrEditReviewerModal from './modals/EditReviewerModal';
import FrEntitlmentModal from './modals/EntitlementModal';
import FrReviewersModal from './modals/ReviewersModal';
import FrReassignModal from './modals/ReassignModal';
import FrRoleModal from './modals/RoleModal/RoleModal';
import FrTaskActionsCell from './TaskActionsCell';
import FrTaskFilters from './TaskFilters';
import FrTaskMultiSelect from './TaskMultiSelect';

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
    BImg,
    BMedia,
    BPagination,
    BTable,
    BTooltip,
    FrActivityModal,
    FrForwardModal,
    FrAccountModal,
    FrColumnOrganizer,
    FrConfirmActionModal,
    FrAddCommentModal,
    FrApplicationModal,
    FrCommentsModal,
    FrEditReviewerModal,
    FrEntitlmentModal,
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
    FrTaskFilters,
    FrTaskMultiSelect,
  },
  mixins: [NotificationMixin],
  props: {
    actorId: {
      type: String,
      default: '',
    },
    campaignDetails: {
      type: Object,
      default: () => {},
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
      allSelected: false,
      bulkCertifyModalProps,
      availableColumns: [],
      updatedColumCategories: [],
      bulkExceptionModalProps,
      bulkRevokeModalProps,
      certificationListColumns: [],
      confirmActionModalProps: {},
      contentAccountSelectedModal: {},
      currentAccountSelectedModal: null,
      currentApplicationSelectedModal: null,
      currentCommentsSelectedModal: [],
      currentEntitlementSelected: null,
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
      isLoading: false,
      isDeletingReviewer: false,
      isSavingReviewer: false,
      isStaged: false,
      items: [],
      listFilters: null,
      manager: {},
      pageSize: 10,
      paginationPage: 1,
      selectedItems: [],
      showFiltersSection: false,
      showConfirm: false,
      sortDir: 'asc',
      sortBy: 'user',
      tasksFieldsToSort: [],
      totalRows: 0,
      glossarySchema: {
        application: [],
        entitlement: [],
        role: [],
      },
      filterProperties: {},
      revokeModalProps: {
        ...bulkRevokeModalProps,
        description: 'revokeInlineItemDescription',
        okFunction: this.revoke,
      },
      exceptionModalProps: {
        ...bulkExceptionModalProps,
        description: 'exceptionInlineItemDescription',
        okFunction: this.exception,
      },
    };
  },
  computed: {
    certificationListColumnsToShow() {
      return this.certificationListColumns.filter((col) => col.show);
    },
    isGroupByAccounts() {
      return this.showGroupBy && this.certificationGrantType === 'accounts';
    },
    tasksFields() {
      const fields = [
        {
          key: 'user',
          label: this.$t('governance.certificationTask.user'),
          sortable: true,
          category: 'user',
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'application',
          label: this.$t('governance.certificationTask.application'),
          sortable: true,
          category: 'application',
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'entitlement',
          label: this.$t('governance.certificationTask.entitlement'),
          sortable: false,
          category: 'entitlement',
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'account',
          label: this.$t('governance.certificationTask.account'),
          sortable: false,
          category: 'account',
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'flags',
          label: this.$t('governance.certificationTask.flags'),
          sortable: false,
          category: 'review',
          class: 'w-175px text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'comments',
          label: this.$t('governance.certificationTask.comments'),
          sortable: false,
          category: 'review',
          class: 'w-140px fr-access-cell',
          show: true,
        },
        {
          key: 'actions',
          class: this.showAccountDrilldown
            ? 'w-230px cert-actions border-left fr-access-cell'
            : 'w-200px cert-actions border-left fr-access-cell',
          label: '',
          sortable: false,
          show: true,
        },
      ];

      if (this.certificationGrantType !== 'entitlements') {
        const entitlementColumnIndex = fields.findIndex((column) => (column.key === 'entitlement'));
        fields.splice(entitlementColumnIndex, 1);
      }

      if (this.entitlementUserId) {
        const userColumnIndex = fields.findIndex((column) => (column.key === 'user'));
        fields.splice(userColumnIndex, 1);
        const applicationColumnIndex = fields.findIndex((column) => (column.key === 'application'));
        fields.splice(applicationColumnIndex, 1);
        const accountColumnIndex = fields.findIndex((column) => (column.key === 'account'));
        fields.splice(accountColumnIndex, 1);
      }

      // Role Membership Access review
      if (this.certificationGrantType === 'roles') {
        fields.unshift({
          key: 'role',
          label: this.$t('common.role'),
          sortable: true,
          class: 'text-truncate fr-access-cell',
          show: true,
        });

        // remove application, account columns
        const applicationColumnIndex = fields.findIndex((column) => (column.key === 'application'));
        fields.splice(applicationColumnIndex, 1);
        const accountColumnIndex = fields.findIndex((column) => (column.key === 'account'));
        fields.splice(accountColumnIndex, 1);
      }

      return fields;
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
    columnCategories() {
      const costumizedColumns = this.formatColumns(this.filterProperties);
      const columns = [
        {
          name: 'review',
          header: this.$t('governance.certificationTask.columns.review'),
          items: [
            {
              key: 'flags',
              label: this.$t('governance.certificationTask.flags'),
              sortable: false,
              category: 'review',
              class: 'w-175px text-truncate fr-access-cell',
              show: true,
            },
            {
              key: 'comments',
              label: this.$t('governance.certificationTask.comments'),
              sortable: false,
              category: 'review',
              class: 'w-140px fr-access-cell',
              show: true,
            },
          ],
        },
        {
          name: 'user',
          header: this.$t('governance.certificationTask.columns.user'),
          items: [
            {
              key: 'user',
              label: this.$t('governance.certificationTask.user'),
              sortable: true,
              category: 'user',
              class: 'text-truncate fr-access-cell',
              show: true,
            },
            ...costumizedColumns.user,
          ],
        },
        {
          name: 'application',
          header: this.$t('governance.certificationTask.columns.application'),
          items: [
            {
              key: 'application',
              label: this.$t('governance.certificationTask.application'),
              sortable: true,
              category: 'application',
              class: 'text-truncate fr-access-cell',
              show: true,
            },
            ...costumizedColumns.application,
          ],
        },
        {
          name: 'entitlement',
          header: this.$t('governance.certificationTask.columns.entitlement'),
          items: [
            {
              key: 'entitlement',
              label: this.$t('governance.certificationTask.entitlement'),
              sortable: false,
              category: 'entitlement',
              class: 'text-truncate fr-access-cell',
              show: true,
            },
            ...costumizedColumns.entitlement,
          ],
        },
        {
          name: 'account',
          header: this.$t('governance.certificationTask.columns.account'),
          items: [
            {
              key: 'account',
              label: this.$t('governance.certificationTask.account'),
              sortable: false,
              category: 'account',
              class: 'text-truncate fr-access-cell',
              show: true,
            },
            ...costumizedColumns.account,
          ],
        },
      ];
      if (this.certificationGrantType !== 'entitlements') {
        const entitlementColumnIndex = columns.findIndex((category) => (category.name === 'entitlement'));
        columns.splice(entitlementColumnIndex, 1);
      }
      if (this.certificationGrantType === 'roles') {
        columns.push({
          name: 'role',
          header: this.$t('common.role'),
          items: [
            {
              key: 'role',
              label: this.$t('common.role'),
              sortable: true,
              class: 'text-truncate fr-access-cell',
              show: true,
              category: 'role',
            },
            ...costumizedColumns.role,
          ],
        });

        // remove application and account columns
        const applicationColumnIndex = columns.findIndex((category) => (category.name === 'application'));
        columns.splice(applicationColumnIndex, 1);
        const accountColumnIndex = columns.findIndex((category) => (category.name === 'account'));
        columns.splice(accountColumnIndex, 1);
      }
      return columns;
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

    this.isStaged = this.campaignDetails.status === 'staging';
    this.updateColumns({});

    try {
      await this.getItems(this.paginationPage);
      if (this.showGroupBy && this.certificationGrantType === 'accounts') {
        this.onRowSelected(this.items);
      }
    } catch (error) {
      this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certificationListError'));
    }

    try {
      const { data } = await getFilterSchema();
      this.filterProperties = data;
    } catch {
      this.filterProperties = {};
    }
  },
  methods: {
    startCase,
    toggleSaving() {
      this.$emit('change-saving');
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
    sortChange({ sortBy, sortDesc }) {
      this.sortDir = sortDesc ? 'desc' : 'asc';
      this.sortBy = sortBy;
      this.paginationPage = 1;
      this.getItems(this.paginationPage);
    },
    updateColumns({ activeColumns, availableColumns }) {
      this.certificationListColumns = activeColumns || this.tasksFields;
      this.updatedColumCategories = availableColumns;
      if (this.campaignDetails.allowBulkCertify) {
        this.certificationListColumns.unshift({
          key: 'selector',
          label: '',
          sortable: false,
          class: 'selector-cell',
          show: true,
        });
      }
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
      }));

      this.$emit('check-progress');

      if (this.totalRows === 0) {
        this.$emit('hide-group-by');
      }
    },
    getItems(currentPage) {
      this.isLoading = true;
      const urlParams = this.buildUrlParams(currentPage, this.sortBy, this.sortDir);
      const payload = this.buildBodyParams();

      // if all users line items are complete, emit an event
      getCertificationCounts(this.campaignId, this.actorId, this.isAdmin, this.taskStatus)
        .then(({ data }) => {
          this.$emit('set-totals', data.totals);
        });

      return getCertificationTasksListByCampaign(urlParams, this.campaignId, payload)
        .then((resourceData) => this.loadItemsList(resourceData, currentPage))
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
      this.displayNotification('success', this.$t(`governance.certificationTask.success.${message}`));
      this.selectTasks(false);
      this.clearRowSelected();
      this.getItems(page);
      this.$emit('update-details');
    },
    getFilterGrantType(certificationGrantType = '') {
      let grantType;
      if (certificationGrantType === 'accounts') grantType = 'accountGrant';
      if (certificationGrantType === 'entitlements') grantType = 'entitlementGrant';
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
        default:
          return sortBy;
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
          this.openActionConfirmModal(this.revokeModalProps, item.id);
          break;
        case 'exception':
          this.openActionConfirmModal(this.exceptionModalProps, item.id);
          break;
        case 'viewReviewers':
          this.openReviewersModal(item);
          break;
        case 'forward':
          this.openForwardModal(item.id, false, false);
          break;
        case 'comment':
          this.openAddCommentModal(item.id);
          break;
        case 'activity':
          this.openActivityModal(item);
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
      saveComment(this.campaignId, this.currentLineItemIdSelectedModal, comment).then(() => {
        this.getItems(this.paginationPage)
          .then(() => {
            const currentTask = this.items.find((task) => task.id === this.currentLineItemIdSelectedModal);
            const taskActivity = currentTask?.decision?.certification?.comments;
            const comments = filter(taskActivity, { action: 'comment' });
            this.currentCommentsSelectedModal = comments;
          });
        this.displayNotification('success', this.$t('governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage'));
        this.$bvModal.hide(this.getModalId('add-comment'));
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.error.addCommentErrorDefaultMessage'));
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
    }, currentItemId = null) {
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
      };
      this.$bvModal.show(this.getModalId('confirm-action'));
    },
    /**
     * Parse the activity information in the item and open the corresponding modal
     * @param {Object} item all item information
     */
    openActivityModal(item) {
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
      this.$bvModal.show(this.getModalId('activity'));
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
    openAddCommentModal(lineItemId) {
      this.currentLineItemIdSelectedModal = lineItemId;
      this.$bvModal.show(this.getModalId('add-comment'));
    },
    openAddCommentModalFromCommentsModal() {
      this.$bvModal.hide(this.getModalId('view-comments'));
      this.$bvModal.show(this.getModalId('add-comment'));
    },
    openReviewersModal({ id, decision: { certification: { actors } }, permissions: { reassign } }) {
      this.currentLineItemIdSelectedModal = id;
      this.currentReviewersSelectedModal = actors;
      this.currentLineItemReassignPermission = reassign;
      this.$bvModal.show(this.getModalId('view-reviewers'));
    },
    openEditReviewerModal(reviewer) {
      this.currentReviewerSelectedModal = reviewer;
      this.currentUserPermissions = this.isAdmin
        ? ADMIN_REVIEWER_PERMISSIONS
        : this.currentReviewersSelectedModal.find((currentReviewer) => currentReviewer.id === this.actorId)?.permissions;
      this.$bvModal.hide(this.getModalId('view-reviewers'));
      this.$bvModal.show(this.getModalId('edit-reviewers'));
    },
    closeEditReviewerModal() {
      this.$bvModal.hide(this.getModalId('edit-reviewers'));
      this.$bvModal.show(this.getModalId('view-reviewers'));
      this.currentReviewerSelectedModal = null;
      this.currentUserPermissions = {};
    },
    openForwardModal(id, isBulk, showConfirm) {
      this.currentItemId = id;
      this.isBulk = isBulk;
      this.showConfirm = showConfirm;
      this.$bvModal.show(this.getModalId('forward'));
    },
    openSortModal() {
      this.tasksFieldsToSort = cloneDeep(this.certificationListColumns);
      this.availableColumns = isEmpty(this.updatedColumCategories)
        ? cloneDeep(this.columnCategories)
        : cloneDeep(this.updatedColumCategories);
      this.$bvModal.show(this.getModalId('sort'));
    },
    closeSortModal() {
      this.tasksFieldsToSort = [];
      this.availableColumns = [];
    },
    openUserModal(lineItemId, manager) {
      getUserDetails(this.campaignId, lineItemId)
        .then(({ data }) => {
          this.manager = manager;
          this.currentUserSelectedModal = pick(data, userRequiredParams);
          this.$bvModal.show('GovernanceUserDetailsModal');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.error.getUserError'));
        });

      // Get entitlements details
      getUserDetailsByType(this.campaignId, lineItemId, 'entitlements').then(({ data }) => {
        this.currentUserEntitlementsDetails = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.error.getUserEntitlementsError'));
      });
      // Get accounts details
      getUserDetailsByType(this.campaignId, lineItemId, 'accounts').then(({ data }) => {
        this.currentUserAccountsDetails = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.error.getUserEntitlementsError'));
      });
      // Get roles details
      getUserDetailsByType(this.campaignId, lineItemId, 'roles').then(({ data }) => {
        this.currentUserRolesDetails = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.error.getUserEntitlementsError'));
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
    async openEntitlementModal({
      application,
      id,
      glossary,
      entitlementOwner,
    }) {
      try {
        const { data } = await getEntitlementDetails(this.campaignId, id);
        this.currentApplicationSelectedModal = application;
        this.currentEntitlementSelected = {
          ...data,
          entitlementOwner,
          glossary,
        };
        this.$bvModal.show(this.getModalId('entitlement'));
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.entitlementModal.loadErrorMessage'));
      }
    },
    openRoleModal(item) {
      this.currentRoleSelected = {
        ...item.role,
        glossary: item.glossary,
        roleOwner: item.roleOwner,
      };
      this.$bvModal.show(this.getModalId('role'));
    },
    /**
     * Parse the column information to a format to be rendered by the component.
     * @param {Object} columnItem all column information
     * @param {String} category category name
     * @returns {Object} parsed column object
     */
    parseColumn(columnItem, category) {
      return {
        ...columnItem,
        category,
        class: 'text-truncate fr-access-cell',
        label: `${capitalize(category)} ${columnItem.displayName}`,
        noCategoryLabel: columnItem.displayName,
        show: false,
        sortable: false,
      };
    },
    /**
     * Returns all columns by category in the format to be rendered in the component
     * @param {Object} rawColumns All column information in the format returned by the backend
     * @returns {Object} object with all comuns by category
     */
    formatColumns(rawColumns) {
      if (isEmpty(rawColumns)) {
        return {
          user: [],
          application: [],
          entitlement: [],
          account: [],
          role: [],
        };
      }
      const {
        user,
        application,
        entitlement,
        account,
        role,
      } = rawColumns;

      return {
        user: user.map((column) => this.parseColumn(column, 'user'))
          .filter((column) => !column.label.includes('Generic')),
        application: application.map((column) => this.parseColumn(column, 'application')),
        entitlement: entitlement.map((column) => this.parseColumn(column, 'entitlement')),
        account: account.map((column) => this.parseColumn(column, 'account')),
        role: role.map((column) => this.parseColumn(column, 'role')),
      };
    },
    /**
     * Obtains and parses the information from the column
     * @param {Object} data object with all the information in the column
     * @returns {String} parsed column data
     */
    getColumnData(data) {
      if (isEmpty(data)) {
        return blankValueIndicator;
      }
      const {
        field: {
          category,
          key,
        },
        item,
      } = data;
      const isGlossaryAttribute = key.includes('glossary');
      const sanitizedKey = isGlossaryAttribute
        ? key.split('.')[1]
        : key;
      // if it is a glossary attribute the correct path is used
      const attributePath = isGlossaryAttribute
        ? `glossary.idx./${category}.${sanitizedKey}`
        : `${category}.${sanitizedKey}`;
      const columnData = get(item, attributePath);
      // only returns blank value indicator if the column data is null or undefined
      return isNil(columnData) ? blankValueIndicator : columnData;
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
.certification-task-list {
  &_controls {
    padding: 10px;
  }
}
.small-column {
  width: 5%;
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

:deep {
  .fr-access-cell {
    padding: 0.5rem 1.5rem !important;
  }
  .selector-cell {
    width: 40px;
    padding: 0 .5rem 0 0 !important;
  }
  .cert-actions {
    box-shadow: -4px 0px 5px 0px rgb(0 0 0 / 5%);
    padding: 1rem 1rem !important;
  }
  .w-200px {
    width: 200px;
  }
  .w-230px {
    width: 230px;
  }
  .w-140px {
    width: 140px;
  }
}
</style>
