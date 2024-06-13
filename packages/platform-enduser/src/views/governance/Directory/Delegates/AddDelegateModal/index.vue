<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      @hidden="resetModal"
      cancel-variant="link"
      id="add-delegate-modal"
      size="lg"
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('governance.delegates.addDelegates')"
      :ok-function="okHandler">
      <p>{{ $t('governance.delegates.addModalTitle') }}</p>
      <FrResourceSelect
        v-model="delegates"
        class="mb-3"
        validation="required"
        type="multiselect"
        :fields="['givenName', 'sn', 'userName', 'profileImage']"
        :label="$t('common.users')"
        :resource-path="'alpha_user'">
        <template #option="{ option }">
          <BMedia
            no-body
            class="py-1">
            <BImg
              :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
              :alt="$t('governance.accessRequest.newRequest.userImageAltText', { userName: option.value.userName })"
              class="mr-2 align-self-center rounded rounded-circle"
              width="24" />
            <BMediaBody>
              <div class="mb-1 text-dark">
                {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
              </div>
              <small class="text-muted">
                {{ option.value.userName }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #tag="{ option, remove }">
          <span class="multiselect__tag">
            <BMedia
              no-body
              class="py-1">
              <BImg
                :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                :alt="$t('governance.accessRequest.newRequest.userImageAltText', { userName: option.value.userName })"
                class="mr-2 align-self-center rounded rounded-circle"
                width="24" />
              <BMediaBody>
                <div class="mb-1 text-dark">
                  {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
                </div>
                <div>
                  <small class="text-muted">
                    {{ option.value.userName }}
                  </small>
                </div>
              </BMediaBody>
            </BMedia>
            <span
              class="multiselect__tag-icon"
              tabindex="0"
              :aria-label="$t('common.remove')"
              @click.prevent="remove(option)"
              @keydown.enter="remove(option)" />
          </span>
        </template>
      </FrResourceSelect>
      <FrField
        name="enableTimeConstraint"
        testid="enable-time-constraint"
        class="mb-4"
        :label="$t('governance.delegates.timeConstraintLabel')"
        type="checkbox"
        :value="enableTimeConstraint"
        @input="enableTimeConstraint = $event" />
      <BCollapse
        v-if="enableTimeConstraint"
        :visible="enableTimeConstraint">
        <BRow>
          <BCol>
            <FrDatepicker
              name="startDate"
              data-testid="start-date"
              v-model="startDate"
              :placeholder="$t('governance.delegates.startDate')" />
          </BCol>
          <BCol>
            <FrDatepicker
              name="endDate"
              data-testid="end-date"
              :validation="{ is_before_date: { date: startDate, message: $t('governance.delegates.errorEndDate') }}"
              v-model="endDate"
              :placeholder="$t('governance.delegates.endDate')" />
          </BCol>
        </BRow>
      </BCollapse>
      <template #modal-footer="{ cancel, ok }">
        <div class="d-flex flex-row-reverse">
          <BButton
            :disabled="!valid"
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
  </VeeForm>
</template>

<script>
import {
  BButton,
  BCol,
  BCollapse,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import dayjs from 'dayjs';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { Form as VeeForm } from 'vee-validate';
import FrResourceSelect from '@forgerock/platform-shared/src/components/Field/ResourceSelect';
import { addTaskProxy } from '@/api/governance/DirectoryApi';

export default {
  name: 'AddDelegateModal',
  components: {
    BButton,
    BCol,
    BCollapse,
    BImg,
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    FrDatepicker,
    FrField,
    FrResourceSelect,
    VeeForm,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      delegates: [],
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
  computed: {
    ...mapState(useUserStore, ['userId']),
  },
  methods: {
    resetModal() {
      this.delegates = [];
      this.enableTimeConstraint = false;
      this.startDate = '';
      this.endDate = '';
    },
    okHandler(ok) {
      let startDate = null;
      let endDate = null;

      if (this.enableTimeConstraint) {
        startDate = this.startDate
          ? dayjs(this.startDate).local().format('YYYY-MM-DD')
          : null;
        endDate = this.endDate
          ? dayjs(this.endDate).local().format('YYYY-MM-DD')
          : null;
      }

      addTaskProxy(this.userId, this.delegates.map((delegate) => `managed/user/${delegate._id}`), startDate, endDate).then(() => {
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
