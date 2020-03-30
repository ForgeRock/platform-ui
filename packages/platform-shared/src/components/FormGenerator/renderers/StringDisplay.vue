<template>
  <div @input="valueChange">
    <FrField
      :field="field"
      :disabled="uiSchema.disabled"
      class="mb-4 px-1">
      <div
        v-if="uiSchema.append"
        slot="append"
        class="input-group-append">
        <button
          :id="`copyButton-${field.value}`"
          class="btn btn-outline-secondary"
          type="button"
          :name="uiSchema.append + 'Button'"
          @click="emitValue(field.value)">
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

export default {
  name: 'StringDisplay',
  components: {
    FrField,
    BTooltip,
  },
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
      return {
        type: 'string',
        value: this.uiSchema.value,
        title: this.uiSchema.label,
        description: this.uiSchema.helpText,
      };
    },
  },
  methods: {
    emitValue(value) {
      this.show = false;
      this.$parent.$emit('copy', value);
    },
    valueChange() {
      this.$emit('update:model', {
        model: this.saveModel,
        value: this.field.value,
      });
    },
  },
};
</script>
