<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    v-bind="$attrs"
    size="lg"
    :title="this.$t('pages.access.resetPassword')"
    @hidden="password.value=''; failures=[]">
    <p class="mb-4">
      {{ $t('common.helpText.resetPassword') }}
    </p>
    <FrField
      class="mb-2"
      :field="password"
      :failed-policies="failures" />
    <FrPolicyPanel
      v-if="policies.length"
      :dynamic="false"
      :num-columns="2"
      :policies="policies" />
    <template #modal-footer="{ ok, cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        @click="savePassword(ok)">
        {{ $t('pages.access.resetPassword') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';

/**
 * Modal used to reset a users password as an administrator. Used in EditResource component.
 */
export default {
  name: 'ResetPasswordModal',
  components: {
    BButton,
    BModal,
    FrField,
    FrPolicyPanel: PolicyPanel,
  },
  mixins: [
    NotificationMixin,
    PasswordPolicyMixin,
    RestMixin,
    ResourceMixin,
  ],
  props: {
    /**
     * Type of resource. Managed or internal.
     */
    resourceType: {
      type: String,
      required: true,
    },
    /**
     * Name of resource e.g. user
     */
    resourceName: {
      type: String,
      required: true,
    },
    /**
     * Id of resource e.g user Id
     */
    resourceId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      password: {
        value: '',
        type: 'password',
        title: this.$t('common.placeholders.password'),
        validation: 'required',
      },
      failures: [],
      policies: [],
    };
  },
  mounted() {
    this.getPolicies(this.resourceName).then((res) => {
      // maxLength of 0 means unlimited length allowed, no need to display
      this.policies = res.data.filter((policy) => (!(policy.name === 'MAX_LENGTH' && policy.params.maxLength === 0)));
    });
  },
  methods: {
    /**
     * Attempt to update password. Failures related to policy will be displayed under the input
     * @param {Function} ok function used to close modal
     */
    savePassword(ok) {
      const idmInstance = this.getRequestService();
      const saveData = [{ operation: 'add', field: '/password', value: this.password.value }];
      idmInstance.patch(`${this.resourceType}/${this.resourceName}/${this.resourceId}`, saveData).then(() => {
        this.displayNotification('AdminMessage', 'success', this.$t('pages.access.successSavePassword'));
        ok();
      },
      (error) => {
        const err = this.findPolicyError(error.response);
        if (err.length) this.failures = [err[0].msg];
        this.displayNotification('AdminMessage', 'error', this.$t('pages.access.failedSavePassword'));
      });
    },
  },
};
</script>
