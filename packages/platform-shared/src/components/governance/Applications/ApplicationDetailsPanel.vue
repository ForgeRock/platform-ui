<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard id="applicationDetails">
    <FrFormGenerator
      @update:model="emit('update:model', $event)"
      :schema="schemaWithTranslations"
      :model="model">
      <template #logo>
        <div class="fr-app-logo border-right d-flex align-items-center justify-content-center h-100 fr-app-logo-bg">
          <BImg
            :src="logoSource"
            :alt="$t('applications.edit.applicationDetails.appLogoAltText')"
            height="54"
            width="54" />
        </div>
      </template>
      <template #application-owners="{ property }">
        <FrRelationshipEdit
          v-if="relationshipProperty"
          class="mb-4"
          :parent-resource="parentResource"
          :relationship-property="relationshipProperty"
          :index="2"
          :value="relationshipProperty.value"
          @setValue="emit('update:model', { value: $event, path: property.model })" />
      </template>
    </FrFormGenerator>
    <FrApplicationGlossaryDetails
      :app-id="appId"
      :user-resource-name="userResourceName"
      :role-resource-name="roleResourceName"
      :org-resource-name="orgResourceName"
      :is-authoritative="isAuthoritative"
      @update:model="emit('update:glossaryModel', $event)"
      @update:glossaryCreateFlag="emit('update:glossaryCreateFlag', $event)" />

    <template #footer>
      <div class="d-flex justify-content-end">
        <!--
            Use @mousedown.prevent instead of @click as VeeValidate's form validation was making the
            blur prevent validation from properly running. This ensures validation runs
            before the button's action is triggered.
          -->
        <FrButtonWithSpinner
          id="app-submit"
          :disabled="!isFormValid || isFormValidating || isSaving"
          variant="primary"
          :show-spinner="isSaving || isFormValidating"
          :spinner-text="isFormValidating ? $t('common.validating') : $t('common.saving')"
          @mousedown.prevent="emit('save-app')"
          @keydown.enter.prevent="emit('save-app')"
          @keydown.space.prevent="emit('save-app')"
        />
      </div>
    </template>
  </BCard>
</template>

<script setup>
import { computed, nextTick, onMounted } from 'vue';
import {
  BCard,
  BImg,
} from 'bootstrap-vue';
import { useForm } from 'vee-validate';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import FrApplicationGlossaryDetails from './Glossary/ApplicationGlossaryDetails';
import i18n from '@/i18n';

const props = defineProps({
  logoSource: {
    required: true,
    type: String,
  },
  model: {
    type: Object,
    default: () => ({}),
  },
  parentResource: {
    type: String,
    default: '',
  },
  relationshipProperty: {
    type: Object,
    default: () => ({}),
  },
  schema: {
    type: Array,
    default: () => [],
  },
  appId: {
    type: String,
    default: '',
  },
  userResourceName: {
    type: String,
    default: '',
  },
  roleResourceName: {
    type: String,
    default: '',
  },
  orgResourceName: {
    type: String,
    default: '',
  },
  isAuthoritative: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:model', 'update:glossaryModel', 'update:glossaryCreateFlag', 'save-app']);

const { meta, validate } = useForm();

onMounted(async () => {
  await nextTick();
  validate();
});

function addTranslationsToSchema(schema) {
  return schema.map((row) => row.map((formField) => {
    const field = { ...formField };
    const labelTranslationPath = `applications.edit.labels.${field.model}`;
    if (i18n.global.t(labelTranslationPath) !== labelTranslationPath) {
      field.label = i18n.global.t(labelTranslationPath);
    }
    if (!field.label) {
      if (field.title) {
        field.label = field.title;
      } else {
        const splitModel = field.model.split('.');
        field.label = splitModel[splitModel.length - 1];
      }
    }
    const descriptionTranslationPath = `applications.edit.descriptions.${field.model}`;
    if (i18n.global.t(descriptionTranslationPath) !== descriptionTranslationPath) {
      field.description = i18n.global.t(descriptionTranslationPath);
    }
    return field;
  }));
}

const schemaWithTranslations = computed(() => addTranslationsToSchema(props.schema));
const isFormValidating = computed(() => meta.pending);
const isFormValid = computed(() => !meta.invalid);
</script>

<style lang="scss" scoped>
  #applicationDetails {
    .card-body .fr-app-logo {
      max-width: 7rem;
      min-height: 7rem;
    }

    .card-title {
      padding-top: 1.5rem;
      padding-left: 1.5rem;
    }
  }
</style>
