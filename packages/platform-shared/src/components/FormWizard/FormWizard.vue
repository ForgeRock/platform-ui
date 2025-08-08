<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100">
    <VeeForm
      v-slot="{ meta: { valid }}"
      as="span">
      <FrNavbar
        @clicked="$emit('cancel-action')">
        <template #center-content>
          <slot name="center-content">
            <h1
              class="h4 font-weight-bold m-0 pl-3 max-lines max-lines-1"
              data-testid="wizard-title">
              {{ title }}
            </h1>
          </slot>
        </template>
        <template #right-content>
          <slot name="right-content" />
        </template>
      </FrNavbar>
      <BCard
        class="wizard-tabs card-tabs-vertical"
        no-body>
        <FrSpinner
          v-if="isLoading"
          testid="form-wizard-spinner"
          class="py-5" />
        <BTabs
          v-else
          v-model="currentStep"
          :lazy="lazy"
          content-class="fr-wizard-content"
          :active-nav-item-class="progressDots && 'fr-active-nav-item'"
          :nav-wrapper-class="[progressDots && 'progress-dots-padding', 'fr-wizard pt-3']"
          pills
          vertical
          @activate-tab="(...events) => handleTabClick(valid, events[2])">
          <BTab
            v-for="(tab, index) in tabs"
            :key="tab.title"
            :data-testid="tab.title"
            :class="[tabs[currentStep].hideFooter && 'wizard-footer-hidden', 'wizard-tab']"
            :title-item-class="(!edit && index > highestVisitedStep) ? 'disabled' : ''"
            no-fade>
            <template #title>
              <div class="position-relative">
                <div
                  v-if="progressDots"
                  data-testid="progress-dots"
                  :class="[
                    'circle',
                    index === tabs.length - 1 ? 'fr-step-placeholder' : 'fr-step-bridge',
                    {
                      completed: index < currentStep,
                      current: index === currentStep
                    }
                  ]" />
                {{ tab.title }}
              </div>
            </template>
            <slot :name="tab.title" />
          </BTab>
          <BCardFooter
            v-if="!tabs[currentStep].hideFooter"
            class="d-flex justify-content-between">
            <slot
              name="footer-content"
              :valid="valid">
              <div>
                <BButton
                  v-if="currentStep > 0"
                  @click="changeStep(-1)"
                  variant="link">
                  {{ $t('common.previous') }}
                </BButton>
              </div>
              <div>
                <BButton
                  @click="breadcrumbPath ? $router.push({ path: breadcrumbPath }) : $emit('cancel-action')"
                  variant="link">
                  {{ $t('common.cancel') }}
                </BButton>
                <FrButtonWithSpinner
                  v-if="isFinalStep || forceShowSaveButton"
                  data-testid="saveButton"
                  :show-spinner="isSaving"
                  :disabled="!valid || !validForm || isSaving"
                  @click="$emit('save')" />
                <BButton
                  v-else
                  data-testid="nextButton"
                  @click="changeStep(1)"
                  :disabled="!valid || !validForm"
                  variant="primary">
                  {{ $t('common.next') }}
                </BButton>
              </div>
            </slot>
          </BCardFooter>
        </BTabs>
      </BCard>
    </VeeForm>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
} from 'vue';
import {
  BButton,
  BCard,
  BCardFooter,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar/';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import i18n from '@/i18n';

// Composables
const {
  setBreadcrumb,
} = useBreadcrumb();
// Events
defineEmits(['cancel-action', 'save']);

// Props
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  breadcrumbTitle: {
    type: String,
    default: '',
  },
  breadcrumbPath: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  tabs: {
    type: Array,
    default: () => [],
  },
  edit: {
    type: Boolean,
    default: false,
  },
  lazy: {
    type: Boolean,
    default: false,
  },
  validForm: {
    type: Boolean,
    default: true,
  },
  progressDots: {
    type: Boolean,
    default: false,
  },
  /*
   * By default when editting an item, the formWizard will show the Next button.
   * Different places in the app have different preferences here so this allows
   * for overriding and forcing the save button to display.
   */
  showSaveButtonOnEdit: {
    type: Boolean,
    default: false,
  },
  /**
   * If true, the form will validate when switching tabs.
   * This is useful to prevent users from skipping steps with invalid data.
   */
  validateOnTabChange: {
    type: Boolean,
    default: false,
  },
});

const currentStep = ref(0);
const highestVisitedStep = ref(0);
const isFinalStep = computed(() => currentStep.value === (props.tabs.length - 1));
const forceShowSaveButton = computed(() => props.showSaveButtonOnEdit && props.edit);

/**
 * Changes the current step by the given amount. Uses highestVisitedStep to
 * prevent users skipping steps when not editing
 *
 * @param amount to change step by
 */
const changeStep = (amount) => {
  currentStep.value += amount;

  if (highestVisitedStep.value < currentStep.value) {
    highestVisitedStep.value = currentStep.value;
  }
};

/**
 * Handles tab activation in the wizard.
 * Prevents tab change and shows an error message if validation fails and validateOnTabChange is enabled.
 *
 * @param {boolean} valid - Indicates if the current form state is valid.
 * @param {Object} bvEvent - BvEvent object from BootstrapVue, used to prevent tab activation.
 */
function handleTabClick(valid, bvEvent) {
  if (props.validateOnTabChange && !valid) {
    bvEvent.preventDefault();
    showErrorMessage({}, i18n.global.t('errors.invalidFields'));
  }
}

setBreadcrumb(props.breadcrumbPath, props.breadcrumbTitle);

</script>

<style lang="scss" scoped>
:deep {
  .fr-wizard {
    min-width: 210px;

    .nav-item a {
      padding: .75rem 1.25rem;
    }

    &.progress-dots-padding .nav-item a {
      padding: 0.75rem 1.25rem 0.75rem 3rem !important;
    }
  }

  .fr-step-bridge {
    position: absolute;
    left: -25px;
    top: 10px;
    height: 35px;
    width: 1px;
    border-left: 2px solid $gray-200;
  }

  .fr-step-placeholder {
    position: absolute;
    left: -25px;
    top: 10px;
    height: 35px;
    width: 1px;
    border-left: 2px solid $white;
  }

  .circle::after {
    content: "";
    font-family: Material Icons;
    font-size: 1rem;
    color: $blue;
    width: 1rem;
    height: 1rem;
    background-color: $gray-300;
    border: 4px solid $white;
    position: absolute;
    border-radius: 1rem;
    top: -7px;
    left: -9px;
    line-height: 1;
  }

  .completed::after {
    content: "check_circle";
    background-color: $white;
    border: none;
  }

  .current::after {
    background-color: $white;
    border-color: $blue;
  }

  .fr-active-nav-item {
    background: none !important;
    border-left-color: $white !important;
  }

  .wizard-tab {
    height: calc(100% - 97.5px); // 100% minus footer height
  }

  .wizard-tab.wizard-footer-hidden {
    height: 100%;
  }

  .tab-content {
    max-height: 100%;
  }

  .wizard-tabs {
    height: calc(100% - 81px); // 100% minus nav height
  }

  .tabs.row {
    height: 100%;
  }

  nav {
    padding: 1rem 1.5rem;
    height: 81px !important;
    background-color: $white;
    border-bottom: none;
    box-shadow: 0 1px 3px rgba(0,0,0,.13);
  }

  .card {
    border: none;
  }

  a {
    text-decoration: none;
  }

  .nav-item.disabled {
    cursor: auto;
    pointer-events: none;
  }
}

:deep(.navbar-nav) .dropdown-menu {
  position: absolute;
}
</style>
