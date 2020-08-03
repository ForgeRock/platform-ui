<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="fr-key-value-panel p-3">
    <ValidationObserver v-slot="{ invalid }">
      <FrField
        :autofocus="autofocus"
        :field="keyModel"
        :prepend-title="true"
        class="mb-3" />
      <FrField
        :field="valueModel"
        :prepend-title="true" />
      <div class="fr-key-value-add-panel-footer mt-3">
        <div class="pt-3 mr-3">
          <span
            class="fr-key-link"
            @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </span>
        </div>
        <BButton
          @click="saveKeyValue"
          :disabled="invalid"
          variant="outline-primary">
          {{ $t('common.save') }}
        </BButton>
      </div>
    </ValidationObserver>
  </div>
</template>

<script>
import {
  BButton,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';

/**
 * New/Edit Key value pair component
 */
export default {
  name: 'KeyValuePanel',
  components: {
    BButton,
    FrField: () => import ('@forgerock/platform-shared/src/components/Field'),
    ValidationObserver,
  },
  props: {
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    validationRules: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      keyModel: {
        title: this.$t('trees.editPanel.key'),
        value: '',
        validation: this.validationRules,
      },
      valueModel: {
        title: this.$t('trees.editPanel.value'),
        type: 'textarea',
        value: '',
        validation: 'required',
      },
    };
  },
  mounted() {
    this.keyModel.value = this.value.key;
    this.valueModel.value = this.value.value;
  },
  methods: {
    /**
      * Emits an input change to notify v-model that the component has updated
      */
    saveKeyValue() {
      this.$emit('saveKeyValue', { key: this.keyModel.value, value: this.valueModel.value });
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-key-value-panel {
  background-color: $gray-100;
}

.fr-key-value-add-panel-footer {
  display: flex;
  justify-content: flex-end;
}

.fr-key-link {
  color: $blue;

  &:hover {
    cursor: pointer;
    color: $hover-blue;
  }
}
</style>
