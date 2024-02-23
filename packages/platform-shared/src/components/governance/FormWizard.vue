<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100">
    <FrNavbar
      hide-dropdown
      hide-toggle
      :show-docs-link="false"
      :show-help-link="false"
      :show-profile-link="false">
      <template #center-content>
        <h1
          class="h5 font-weight-bold m-0"
          data-testid="wizard-title">
          {{ title }}
        </h1>
      </template>
    </FrNavbar>
    <BCard
      class="cert-tabs card-tabs-vertical"
      no-body>
      <BTabs
        v-model="currentStep"
        @activate-tab="activateTabHandler"
        active-nav-item-class="fr-active-nav-item"
        content-class="fr-wizard-content"
        nav-wrapper-class="fr-wizard"
        pills
        vertical>
        <VeeForm
          v-slot="{ meta: { valid }}"
          as="span">
          <BTab
            v-for="(tab, index) in tabs"
            :key="tab.title"
            :data-testid="tab.title"
            class="cert-tab">
            <template #title>
              <div class="position-relative">
                <div
                  :class="['circle', index === tabs.length - 1 ? 'fr-step-placeholder' : 'fr-step-bridge', {
                    completed: index < currentStep,
                    current: index === currentStep
                  }]" />
                {{ tab.title }}
              </div>
            </template>
            <slot :name="tab.title" />
          </BTab>
          <BCardFooter class="d-flex justify-content-between">
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
                @click="$router.push({ path: breadcrumbPath })"
                variant="link">
                {{ $t('common.cancel') }}
              </BButton>
              <BButton
                data-testid="nextButton"
                @click="changeStep(1)"
                :disabled="!valid || !validForm"
                variant="primary">
                {{ currentStep === tabs.length - 1 ? $t('common.save') : $t('common.next') }}
              </BButton>
            </div>
          </BCardFooter>
        </VeeForm>
      </BTabs>
    </BCard>
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
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
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';

// Composables
const { setBreadcrumb } = useBreadcrumb();

// Events
const emit = defineEmits([
  'save',
]);

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
  tabs: {
    type: Array,
    default: () => [],
  },
  edit: {
    type: Boolean,
    default: false,
  },
  validForm: {
    type: Boolean,
    default: true,
  },
});

// Data
const currentStep = ref(0);
const highestStep = ref(0);

onMounted(async () => {
  setBreadcrumb(props.breadcrumbPath, props.breadcrumbTitle);
  if (props.edit) highestStep.value = props.tabs.length - 1;
});

function changeStep(amount) {
  if (currentStep.value === props.tabs.length - 1 && amount > 0) {
    emit('save');
    return;
  }
  currentStep.value += amount;
  if (highestStep.value < currentStep.value) highestStep.value = currentStep.value;
}

function activateTabHandler(newIndex, oldIndex, event) {
  if (newIndex <= highestStep.value) return;
  event.preventDefault();
}
</script>

<style lang="scss" scoped>
:deep {
  .fr-wizard {
    min-width: 220px;
    .nav-item a {
      padding: 0.75rem 1.25rem 0.75rem 3rem !important;
    }
  }

  .fr-wizard-content {
    width: calc(100% - 220px);
  }

  .fr-step-bridge {
    position: absolute;
    left: -25px;
    top: 10px;
    height: 35px;
    width: 1px;
    border-left: 2px solid rgb(231, 238, 244);
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

  .cert-tab {
    height: calc(100% - 97.5px)
  }

  .tab-content {
    max-height: 100%;
  }

  .cert-tabs {
    height: calc(100% - 72px)
  }

  .tabs.row {
    height: 100%;
  }
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
</style>
