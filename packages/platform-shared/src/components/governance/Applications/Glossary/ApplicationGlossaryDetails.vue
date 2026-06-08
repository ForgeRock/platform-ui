<!-- Copyright 2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    v-if="showWheel">
    <FrSpinner class="py-5" />
    <div class="text-center pb-4">
      {{ $t('governance.glossary.loadingGlossary') }}
    </div>
  </div>

  <FrApplicationGlossaryDetailsForm
    v-else
    :glossary-schema="glossarySchema"
    :model-value="glossaryValues"
    :user-resource-name="userResourceName"
    :role-resource-name="roleResourceName"
    :org-resource-name="orgResourceName"
    @update:model-value="onGlossaryUpdate" />
</template>

<script setup>
/**
 * Glossary Details component for Applications. This component passes data to Generic Glossary Form component
 * to render Glossary Details for a particular appId.
 */
import { onMounted, ref } from 'vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { searchGlossaryAttributes, getGlossaryAttributesByAppId } from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import FrApplicationGlossaryDetailsForm from './GlossaryDetailsForm';
import i18n from '@/i18n';

const props = defineProps({
  appId: {
    required: true,
    type: String,
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
});

const emit = defineEmits(['update:model', 'update:glossaryCreateFlag']);

const glossarySchema = ref([]);
const showWheel = ref(true);
const glossaryValues = ref({});

function onGlossaryUpdate(updatedValues) {
  glossaryValues.value = updatedValues;
  emit('update:model', updatedValues);
}

onMounted(() => {
  const pageSize = 100;
  const data = {
    targetFilter: {
      operator: 'EQUALS',
      operand: {
        targetName: 'objectType',
        targetValue: '/openidm/managed/application',
      },
    },
  };
  const config = {
    params: {
      pageNumber: 0,
      pageSize,
      sortBy: 'name',
      sortDir: 'asc',
    },
  };

  searchGlossaryAttributes({ data, config }).then((response) => {
    let finalData = [];
    const { totalCount, result } = response.data;

    finalData = finalData.concat(result);

    const pagingPromises = [];
    for (let i = pageSize; i < totalCount; i += pageSize) {
      const newConfig = {
        params: {
          pageNumber: i / pageSize,
          pageSize,
          sortBy: 'name',
          sortDir: 'asc',
        },
      };
      pagingPromises.push(searchGlossaryAttributes({ data, config: newConfig }));
    }

    Promise.all(pagingPromises).then((moreResponse) => {
      moreResponse.forEach((pageResults) => {
        finalData = finalData.concat(pageResults.data.result);
      });
    }).catch((error) => {
      showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: 'application' }));
    }).finally(() => {
      const filteredData = props.isAuthoritative
        ? finalData.filter(({ name }) => name !== 'requestable')
        : finalData;
      glossarySchema.value = [...filteredData];
      getGlossaryAttributesByAppId(props.appId).then((glossaryRespone) => {
        glossaryValues.value = glossaryRespone.data;
      }).catch(() => {
        emit('update:glossaryCreateFlag', true);
      }).finally(() => {
        showWheel.value = false;
        emit('update:model', glossaryValues.value);
      });
    });
  }).catch((error) => {
    showWheel.value = false;
    showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: 'application' }));
  });
});
</script>
