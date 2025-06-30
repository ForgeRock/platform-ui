<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BDropdown
      class="translate"
      dropup
      no-caret
      right
      variant="none"
      @hide="hideDropdown">
      <template #button-content>
        <FrIcon name="translate" />
      </template>
      <template #default="{ hide }">
        <BDropdownHeader class="py-3">
          <h3 class="h5">
            {{ $t('translations.dropdownTitle') }}
          </h3>
        </BDropdownHeader>
        <BDropdownForm>
          <BFormGroup>
            <div
              v-for="(translation, index) in currentTranslations"
              class="d-flex align-items-start"
              :key="index">
              <div class="flex-grow-1 pr-3">
                <BFormRow>
                  <BCol
                    class="pb-2 pb-lg-0"
                    lg="12">
                    <FrField
                      v-model="translation.locale"
                      class="mb-2"
                      :label="$t('locale.localeTitle')"
                      name="translationLocale"
                      validation="required" />
                  </BCol>
                  <BCol
                    class="pb-2 pb-lg-0"
                    lg="12">
                    <FrField
                      v-model="translation.value"
                      class="mb-3"
                      :label="valueLabel"
                      name="translationKey"
                      validation="required" />
                  </BCol>
                </BFormRow>
              </div>
              <div class="d-flex">
                <BButton
                  v-if="currentTranslations.length > 1"
                  class="px-3 text-dark border-none"
                  variant="link"
                  @click="removeTranslationEntry(index)">
                  <FrIcon name="remove" />
                </BButton>
                <BButton
                  class="px-3 text-dark border-none"
                  variant="link"
                  @click="addTranslationEntry(index)">
                  <FrIcon name="add" />
                </BButton>
              </div>
            </div>
          </BFormGroup>
          <div class="w-100 d-flex justify-content-end mb-3">
            <BButton
              variant="link"
              @click="closeAction = 'close', hide()">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              :disabled="!valid"
              variant="primary"
              @click="closeAction = 'update', hide()">
              {{ $t('common.apply') }}
            </BButton>
          </div>
        </BDropdownForm>
      </template>
    </BDropdown>
  </VeeForm>
</template>

<script setup>
/**
 * Component which displays localizations related to a specific value
 */
import { reactive } from 'vue';
import { cloneDeep } from 'lodash';
import {
  BButton,
  BCol,
  BDropdown,
  BDropdownForm,
  BDropdownHeader,
  BFormGroup,
  BFormRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { Form as VeeForm } from 'vee-validate';
import i18n from '@/i18n';

const props = defineProps({
  translations: {
    type: Array,
    required: true,
  },
  valueLabel: {
    type: String,
    default: i18n.global.t('common.label'),
  },
});
const emit = defineEmits(['update:translations']);

const currentTranslations = reactive(cloneDeep(props.translations));
let closeAction = '';

/**
 * Adds translation to modal
 * @param index Location within array of translations
 */
function addTranslationEntry(index) {
  currentTranslations.splice(index + 1, 0, { locale: '', value: '' });
}

/**
 * Removes translation from modal
 * @param index location within array of translations
 */
function removeTranslationEntry(index) {
  currentTranslations.splice(index, 1);
}

/**
 * Adds an additional blank translation if none are provided
 */
function setupTranslations() {
  if (!currentTranslations.length) {
    addTranslationEntry(-1);
  }
}

/**
 * Bootstrap dropdown does not seem to have a prop to disable closing of dropdown from
 * clicking outside, so we need to only allow closing manually
 * @param event close dropdown event
 */
function hideDropdown(event) {
  if (closeAction) {
    if (closeAction === 'update') {
      emit('update:translations', currentTranslations);
    }
    closeAction = '';
  } else {
    event.preventDefault();
  }
}

setupTranslations();
</script>

<style lang="scss" scoped>
.translate {
  :deep(button.btn-none) {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    &:hover {
      background-color: $white !important;
    }
  }

  :deep(.dropdown-menu) {
    width: 400px;

    button {
      &.btn-link {
        border-color: transparent;
        color: $blue;
        background: none;
      }
      &.btn-primary {
        background-color: $blue;
        border-color: $blue;
        color: $white;
      }
    }
  }
}
</style>
