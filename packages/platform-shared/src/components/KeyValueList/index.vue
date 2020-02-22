<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="mt-3">
    <div
      v-if="!isEmpty(keyValue)"
      class="fr-key-value-list">
      <div
        v-for="(text, key) in keyValue"
        :key="`${id}_keyvalue-${key}`"
        class="fr-key-value-list-item">
        <div class="fr-key-value-list-header mt-3">
          <h5 class="text-truncate">
            {{ key }}
          </h5>
          <i
            @click="deleteItem(key)"
            class="material-icons material-icons-outlined fr-key-value-delete noselect">
            delete
          </i>
        </div>
        <p>
          {{ text }}
        </p>
      </div>
    </div>
    <div
      v-if="isEmpty(keyValue) && showAdd === false"
      class="fr-key-value-panel text-center py-3">
      <span class="text-secondary">
        ({{ $t('trees.editPanel.none') }})
      </span>
    </div>
    <div
      v-if="showAdd === false"
      class="mt-3">
      <a
        class="fr-key-value-add-link"
        @click.prevent="showAdd = true;"
        href="#">
        <i class="material-icons material-icons-outlined mr-1">
          add
        </i>
        {{ $t('common.add') }}
      </a>
    </div>
    <div
      v-else
      class="fr-key-value-add-panel fr-key-value-panel p-3">
      <label class="text-secondary mb-1">
        {{ $t('trees.editPanel.key') }}
      </label>

      <ValidationObserver
        ref="observer"
        v-slot="{ invalid }">
        <ValidationProvider
          mode="aggressive"
          rules="required"
          v-slot="{ errors }">
          <BFormInput
            v-model.trim="keyText"
            :state="errors.length > 0 ? false : null"
            name="keyInput" />
        </ValidationProvider>

        <label class="text-secondary mb-1 mt-3">
          {{ $t('trees.editPanel.value') }}
        </label>

        <ValidationProvider
          mode="aggressive"
          rules="required"
          v-slot="{ errors }">
          <BFormTextarea
            class="mb-3"
            v-model.trim="valueText"
            :state="errors.length > 0 ? false : null"
            name="valueInput" />
        </ValidationProvider>

        <div class="fr-key-value-add-panel-footer">
          <div class="pt-3 mr-3">
            <a
              class="fr-key-value-add-link"
              @click.prevent="clearAdd();"
              href="#">
              {{ $t('common.cancel') }}
            </a>
          </div>
          <BButton
            @click="saveKeyValue"
            :disabled="invalid"
            variant="outline-primary">
            Save
          </BButton>
        </div>
      </ValidationObserver>
    </div>
  </div>
</template>

<script>
import { isEmpty, cloneDeep } from 'lodash';
import {
  BButton, BFormInput, BFormTextarea,
} from 'bootstrap-vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

/**
 * Key value pair component
 */
export default {
  name: 'KeyValueList',
  components: {
    BButton,
    BFormInput,
    BFormTextarea,
    ValidationObserver,
    ValidationProvider,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    let tempKeyValue;

    if (this.value === null) {
      tempKeyValue = {};
    } else {
      tempKeyValue = cloneDeep(this.value);
    }

    return {
      id: null,
      showAdd: false,
      keyText: '',
      valueText: '',
      keyValue: tempKeyValue,
    };
  },
  mounted() {
    // eslint-disable-next-line no-underscore-dangle
    this.id = this._uid;
  },
  methods: {
    /**
      * Removes an item from the key value list
      *
      * @param {String} key key for the object property to be deleted
      */
    deleteItem(key) {
      this.$delete(this.keyValue, key);
      this.$emit('input', this.keyValue);
    },
    /**
      * Check if an object is empty
      *
      * @param {Object} objectToCheck
      */
    isEmpty(objectToCheck) {
      return isEmpty(objectToCheck);
    },
    /**
      * Emitts an input change to notify v-model that the component has updated
      */
    saveKeyValue() {
      this.keyValue[this.keyText] = this.valueText;
      this.$emit('input', this.keyValue);
      this.clearAdd();
    },
    /**
      * Clears and hides the add form
      */
    clearAdd() {
      this.valueText = '';
      this.keyText = '';
      this.showAdd = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-key-value-panel {
  background-color: $gray-100;
}

.fr-key-value-add-panel {
  .fr-key-value-add-panel-footer {
    display: flex;
    justify-content: flex-end;
  }
}

.fr-key-value-add-link {
  &:hover {
    text-decoration: none;
  }
}

.fr-key-value-list {
  .fr-key-value-list-item {
    border-bottom: 1px solid $gray-200;

    .fr-key-value-list-header {
      display: flex;
      justify-content: space-between;

      .fr-key-value-delete {
        cursor: pointer;
        color: $gray-500;

        &:hover {
          color: $gray-900;
        }
      }
    }
  }
}
</style>
