<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <p>
      {{ descriptionText }}
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
        name="forwardToResource"
        :resource-path="isUserSelected ? 'user' : 'role'"
        :label="$t('governance.certificationTask.actionsModal.forwardTo')"
        validation="required"
      />
    </div>

    <!-- comment -->
    <FrField
      @input="$emit('request-comment', $event);"
      class="mb-4"
      type="textarea"
      validation="required"
      :label="commentLabel" />
  </div>
</template>

<script>
import { BFormRadioGroup } from 'bootstrap-vue';
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
  name: 'ForwardModalContent',
  components: {
    BFormRadioGroup,
    FrField,
    FrGovResourceSelect,
  },
  props: {
    descriptionText: {
      type: String,
      default: '',
    },
    commentLabel: {
      type: String,
      default: '',
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
    };
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
  watch: {
    forwardToResource(forwardTo) {
      this.$emit('request-update-actors', forwardTo);
    },
  },
};
</script>

<style lang="scss" scoped>
.input-line-height {
  line-height: 1.2;
}
</style>
