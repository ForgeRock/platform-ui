<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    @hidden="resetModal"
    cancel-variant="link"
    id="add-delegate-modal"
    size="lg"
    :static="isTesting"
    :title="$t('governance.delegates.addDelegates')"
    :ok-function="okHandler">
    <p>{{ $t('governance.delegates.addModalTitle') }}</p>
    <FrGovResourceSelect
      v-model="delegates"
      class="mb-3"
      resource-path="user" />
    <FrField
      testid="enable-time-constraint"
      v-model="enableTimeConstraint"
      class="mb-4"
      :label="$t('governance.delegates.timeConstraintLabel')"
      type="checkbox" />
    <BCollapse :visible="enableTimeConstraint">
      <BRow>
        <BCol>
          <FrDatepicker
            data-testid="start-date"
            v-model="startDate"
            :placeholder="$t('governance.delegates.startDate')" />
        </BCol>
        <BCol>
          <FrDatepicker
            data-testid="end-date"
            v-model="endDate"
            :placeholder="$t('governance.delegates.endDate')" />
        </BCol>
      </BRow>
    </BCollapse>
    <template #modal-footer="{ cancel, ok }">
      <div class="d-flex flex-row-reverse">
        <BButton
          data-testid="save-button"
          variant="primary"
          @click="okHandler(ok)">
          {{ $t('common.save') }}
        </BButton>
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BCol,
  BCollapse,
  BModal,
  BRow,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/filterBuilder/components/GovResourceSelect';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { addTaskProxy } from '@/api/GovernanceEnduserApi';

export default {
  name: 'AddDelegateModal',
  components: {
    BButton,
    BCol,
    BCollapse,
    BModal,
    BRow,
    FrDatepicker,
    FrField,
    FrGovResourceSelect,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      delegates: '',
      enableTimeConstraint: false,
      endDate: '',
      startDate: '',
    };
  },
  props: {
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    resetModal() {
      this.delegates = '';
      this.enableTimeConstraint = false;
      this.startDate = '';
      this.endDate = '';
    },
    okHandler(ok) {
      let startDate = null;
      let endDate = null;

      if (this.enableTimeConstraint) {
        startDate = this.startDate
          ? dayjs(this.startDate).local().format()
          : null;
        endDate = this.endDate
          ? dayjs(this.endDate).local().format()
          : null;
      }

      addTaskProxy(this.$store.state.UserStore.userId, [this.delegates], startDate, endDate).then(() => {
        this.$emit('delegate-added');
        this.displayNotification('success', this.$t('governance.delegates.delegateAdded'));
        ok();
      }).catch((err) => {
        this.showErrorMessage(err, this.$t('governance.delegates.errorAddingDelegate'));
      });
    },
  },
};
</script>
