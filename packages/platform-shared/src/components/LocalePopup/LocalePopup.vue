<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    class="translate"
    v-slot="{ meta: { valid } }"
    as="span">
    <BButton
      ref="targetButton"
      variant="none">
      <FrIcon name="translate" />
      <p class="sr-only">
        {{ $t('translations.dropdownTitle') }}
      </p>
    </BButton>
    <BPopover
      custom-class="locale-popup py-1 px-2"
      placement="bottomleft"
      :boundary-padding="0"
      :offset="-170"
      :target="targetButton"
      :show.sync="popoverShow"
      @shown="onPopoverShown"
      @hidden="onPopoverHidden"
      @hide="hidePopover">
      <template #title>
        <h3 class="h5 py-2">
          {{ $t('translations.dropdownTitle') }}
        </h3>
      </template>
      <BForm ref="popoverForm">
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
                    :name="localeFieldName"
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
                :aria-label="$t('common.remove')"
                @click="removeTranslationEntry(index)">
                <FrIcon name="remove" />
              </BButton>
              <BButton
                class="px-3 text-dark border-none"
                variant="link"
                :aria-label="$t('common.add')"
                @click="addTranslationEntry(index)">
                <FrIcon name="add" />
              </BButton>
            </div>
          </div>
        </BFormGroup>
        <div class="w-100 d-flex justify-content-end mb-3">
          <BButton
            variant="link"
            class="mr-2"
            @click="popoverShow = false">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            :disabled="!valid"
            variant="primary"
            @click="closeAction = 'update', popoverShow = false">
            {{ $t('common.apply') }}
          </BButton>
        </div>
      </BForm>
    </BPopover>
  </VeeForm>
</template>

<script setup>
/**
 * Component which displays localizations related to a specific value
 */
import { reactive, ref } from 'vue';
import { cloneDeep } from 'lodash';
import {
  BButton,
  BCol,
  BForm,
  BFormGroup,
  BFormRow,
  BPopover,
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

const targetButton = ref();
const popoverForm = ref();
const localeFieldName = 'translationLocale';
const emit = defineEmits(['update:translations']);

const currentTranslations = reactive(cloneDeep(props.translations));

let closeAction = '';
const popoverShow = ref(false);

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
 * Called when the popover is being closed via BPopover's @hide event.
 * Emits translation updates if the user clicks "Apply", and reset closeAction.
 */
function hidePopover() {
  if (closeAction === 'update') {
    emit('update:translations', currentTranslations);
  }
  closeAction = '';
}

/**
 * Focuses the first locale input when the popover is shown
 */
function onPopoverShown() {
  const localeKeyInputElements = popoverForm.value[localeFieldName];

  if (!localeKeyInputElements) return;

  let firstInput = null;
  if (localeKeyInputElements.length) {
    // Multiple locale inputs
    [firstInput] = localeKeyInputElements;
  } else {
    // Single locale input
    firstInput = localeKeyInputElements;
  }

  // Focus the first input
  if (firstInput.focus && typeof firstInput.focus === 'function') {
    firstInput.focus();
  }
}

/**
 * Refocuses the target button when the popover gets closed for better focus management
 */
function onPopoverHidden() {
  if (targetButton.value && targetButton.value.focus && typeof targetButton.value.focus === 'function') {
    targetButton.value.focus();
  }
}

setupTranslations();
</script>

<style lang="scss" scoped>
.translate {
  :deep(.btn-none) {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    &:hover {
      background-color: $white !important;
    }
  }

}
</style>
<style lang="scss">
.locale-popup {
  min-width: 400px;
  top: unset; // Override bootstrap popover top setting, top: 0px restricts scrolling to the popover's bottom
  .arrow {
    display: none;
  }
  &.bs-popover-bottom {
    margin-top: 1px !important;
  }

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
</style>
