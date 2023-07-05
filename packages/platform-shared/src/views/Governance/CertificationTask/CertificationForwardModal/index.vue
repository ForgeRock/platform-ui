<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    v-slot="{ invalid }"
    ref="observer">
    <BModal
      :id="modalId"
      :ok-disabled="invalid"
      :ok-title="$t('governance.certificationTask.actionsModal.forwardItem')"
      :title="$t('governance.certificationTask.actionsModal.forwardItem')"
      :static="isTesting"
      @ok="forwardItem"
      @hidden="reset"
      cancel-variant="link"
      ok-variant="info"
      size="lg">
      <p>
        {{ $t('governance.certificationTask.actionsModal.forwardItemDescription') }}:
      </p>
      <div class="mb-4">
        <BFormRadioGroup
          class="mb-4"
          stacked
          v-model="forwardToType"
          :options="forwardToOptions"
        />
        <FrGovResourceSelect
          v-model="forwardToResource"
          :resource-path="isUserSelected ? 'user' : 'role'"
          :label="$t('governance.certificationTask.actionsModal.forwardTo')"
          validation="required"
        />
      </div>

      <!-- comment -->
      <FrField
        v-model="comment"
        class="mb-4"
        type="textarea"
        validation="required"
        :label="$t('governance.certificationTask.actionsModal.comment')" />
    </BModal>
  </ValidationObserver>
</template>

<script>
import {
  BFormRadioGroup,
  BModal,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';

/**
 * @constant {Object}
 * @default
 */
const FORWARD_TO_TYPES = {
  role: 'role',
  user: 'user',
};

export default {
  name: 'CertificationForwardModal',
  components: {
    BFormRadioGroup,
    BModal,
    FrField,
    FrGovResourceSelect,
    ValidationObserver,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    bulk: {
      type: Boolean,
      default: false,
    },
    modalId: {
      type: String,
      default: 'CertificationTaskForwardAccountModal',
    },
  },
  data() {
    return {
      comment: '',
      forwardToUser: '',
      forwardToRole: '',
      forwardToType: FORWARD_TO_TYPES.user,
      forwardToOptions: [
        { text: this.$t('governance.certificationTask.actionsModal.toUser'), value: FORWARD_TO_TYPES.user },
        { text: this.$t('governance.certificationTask.actionsModal.toRole'), value: FORWARD_TO_TYPES.role },
      ],
      isTesting: false,
    };
  },
  methods: {
    forwardItem() {
      const payload = {
        id: this.bulk ? undefined : this.id,
        comment: this.comment,
        newActorId: this.forwardToType === FORWARD_TO_TYPES.user
          ? this.forwardToUser
          : this.forwardToRole,
      };
      const emitter = this.bulk ? 'forward-bulk' : 'forward-item';
      this.$emit(emitter, payload);
    },
    reset() {
      this.comment = '';
      this.forwardToUser = '';
      this.forwardToRole = '';
    },
  },
  computed: {
    isUserSelected() {
      return this.forwardToType === 'user';
    },
    forwardToResource: {
      get() {
        return this.isUserSelected ? this.forwardToUser : this.forwardToRole;
      },
      set(value) {
        if (this.isUserSelected) {
          this.forwardToUser = value;
        } else {
          this.forwardToRole = value;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.input-line-height {
  line-height: 1.2;
}
</style>
