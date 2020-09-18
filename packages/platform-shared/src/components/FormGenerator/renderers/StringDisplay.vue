<template>
  <div>
    <FrField
      :field="field"
      :disabled="uiSchema.disabled"
      @input="valueChange"
      class="mb-4">
      <div
        v-if="uiSchema.append"
        slot="append"
        class="input-group-append">
        <button
          :id="`copyButton-${field.value}`"
          class="btn btn-outline-secondary"
          type="button"
          :name="uiSchema.append + 'Button'"
          @click="copyValueToClipboard(field.value)">
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
          :target="`copyButton-${field.value}`"
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
  computed: {
    field() {
      const field = {
        type: 'string',
        value: this.uiSchema.value,
        title: this.uiSchema.label,
        description: this.uiSchema.helpText,
      };
      if (this.uiSchema.required) {
        field.validation = 'required';
      }
      return field;
    },
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
