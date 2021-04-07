<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="uiSchema.value"
      class="mb-4"
      :disabled="uiSchema.disabled"
      :description="uiSchema.description"
      :label="uiSchema.label"
      :validation="uiSchema.required ? 'required' : ''"
      @input="valueChange">
      <div
        v-if="uiSchema.append"
        slot="append"
        class="input-group-append">
        <button
          :id="`copyButton-${uiSchema.label}`"
          class="btn btn-outline-secondary"
          type="button"
          :name="uiSchema.append + 'Button'"
          @click="copyValueToClipboard(uiSchema.value)">
          <template
            v-if="uiSchema.append.split(':')[0] === 'text'">
            {{ uiSchema.append.split(':')[1] }}
          </template>
          <template v-else>
            <i class="material-icons material-icons-outlined">
              {{ uiSchema.append }}
            </i>
          </template>
        </button>
        <BTooltip
          :show.sync="show"
          :target="`copyButton-${uiSchema.label}`"
          placement="top"
          triggers="hover"
          title="Copy" />
      </div>
    </FrField>
  </div>
</template>

<script>
import { BTooltip } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
/* eslint-disable import/no-extraneous-dependencies */
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';

export default {
  name: 'StringDisplay',
  components: {
    FrField,
    BTooltip,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    uiSchema: {
      type: Object,
      default() {
        return {};
      },
    },
    saveModel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    copyValueToClipboard(value) {
      clipboard.writeText(value).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('common.copySuccess'));
      }, (error) => {
        this.showErrorMessage(error, this.$t('common.copyFail'));
      });
    },
    valueChange(value) {
      if (!this.uiSchema.disabled) {
        this.$emit('update:model', {
          model: this.saveModel,
          value,
        });
      }
    },
  },
};
</script>
