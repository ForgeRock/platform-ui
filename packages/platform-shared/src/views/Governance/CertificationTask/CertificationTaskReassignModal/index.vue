<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    v-slot="{ invalid }"
    ref="observer">
    <BModal
      :ok-disabled="invalid"
      :id="modalId"
      size="lg"
      ok-variant="primary"
      cancel-variant="link"
      @ok="saveReassignBulkAction"
      :ok-title="$t('governance.certificationTask.actions.reassign')"
      :title="$t('governance.certificationTask.actionsModal.reassignItems')">
      <div class="display-flex flex-column">
        <span>{{ $t('governance.certificationTask.actionsModal.reassignDescription') }}</span>
        <div class="d-flex justify-content-start flex-row mr-4 w-100">
          <div class="mb-4 w-100">
            <BFormRadioGroup
              class="mb-4"
              stacked
              v-model="reassignToType"
              :options="reassignToOptions"
            />
            <FrGovResourceSelect
              v-model="reassignToResource"
              :resource-path="isUserSelected ? 'user' : 'role'"
              :label="$t('governance.certificationTask.actionsModal.reassignTo')"
              validation="required"
            />
          </div>
        </div>
      </div>
      <div class="mt-2">
        <span>{{ $t('governance.certificationTask.permissions.title') }}</span>
        <div
          v-for="permission of permissions"
          class="d-flex flex-row mr-2"
          :key="permission.key">
          <FrField
            :v-model="permission.key"
            :value="permission.selected"
            class="mr-2"
            name="columnSelected"
            type="checkbox" />
          <span>
            {{ $t(permission.label) }}
          </span>
        </div>
      </div>
    </BModal>
  </ValidationObserver>
</template>

<script>
import {
  BFormRadioGroup,
  BModal,
} from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/filterBuilder/components/GovResourceSelect';
import { reassignCertificationTasks } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { ValidationObserver } from 'vee-validate';

/**
 * @constant {Object}
 * @default
 */
const REASSIGN_TO_TYPES = {
  role: 'role',
  user: 'user',
};

export default {
  name: 'CertificationTaskReassignModal',
  components: {
    BModal,
    BFormRadioGroup,
    ValidationObserver,
    FrField,
    FrGovResourceSelect,
  },
  mixins: [
    NotificationMixin,
  ],
  data() {
    return {
      reassignToRole: '',
      reassignToUser: '',
      certify: true,
      comment: true,
      view: true,
      forward: true,
      signoff: true,
      reassignToType: REASSIGN_TO_TYPES.user,
      reassignToOptions: [
        { text: this.$t('governance.certificationTask.actionsModal.toUser'), value: REASSIGN_TO_TYPES.user },
        { text: this.$t('governance.certificationTask.actionsModal.toRole'), value: REASSIGN_TO_TYPES.role },
      ],
      permissions: [
        {
          selected: true,
          label: 'governance.certificationTask.permissions.view',
          key: 'view',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.comment',
          key: 'comment',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.decide',
          key: 'decide',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.assignForward',
          key: 'assignForward',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.signOff',
          key: 'signOff',
        },
      ],
    };
  },
  props: {
    /**
     * this is the campaign details object
    */
    campaignId: {
      type: String,
      default: null,
    },
    selectedTasks: {
      type: Array,
      default: () => ([]),
    },
    modalId: {
      type: String,
      default: 'CertificationTaskReassignAccountModal',
    },
  },
  methods: {
    toggleSaving() {
      this.$emit('change-saving');
    },
    saveReassignBulkAction() {
      this.toggleSaving();
      const permissions = {
        certify: this.certify,
        comment: this.comment,
        view: this.view,
        forward: this.forward,
        signoff: this.signoff,
      };
      const payload = {
        permissions,
        ids: this.selectedTasks.map((task) => (task.id)),
        newActorId: this.reassignToType === REASSIGN_TO_TYPES.user
          ? this.reassignToUser
          : this.reassignToRole,
      };
      reassignCertificationTasks(this.campaignId, payload).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.reassignError'));
      }).finally(() => {
        this.toggleSaving();
        this.$emit('refresh-data');
      });
    },
  },
  computed: {
    isUserSelected() {
      return this.reassignToType === 'user';
    },
    reassignToResource: {
      get() {
        return this.isUserSelected ? this.reassignToUser : this.reassignToRole;
      },
      set(value) {
        if (this.isUserSelected) {
          this.reassignToUser = value;
        } else {
          this.reassignToRole = value;
        }
      },
    },
  },
};
</script>
