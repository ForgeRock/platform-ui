<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BContainer class="mt-5">
    <BCard
      v-if="true"
      class="text-center py-2">
      <BCardTitle
        class="h4 mb-2"
        title-tag="h3">
        {{ $t('reports.template.noColumnsAdded') }}
      </BCardTitle>
      <BCardText>
        {{ $t('reports.template.selectColumnsFromDataSets') }}
      </BCardText>
    </BCard>
    <BCard
      v-else
      class="text-center py-2"
      no-body>
      <BTableSimple>
        <BThead>
          <BTr>
            <BTh
              v-for="(column, index) in selectedDataSourceColumns"
              :key="index">
              {{ column.label }}
            </BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr>
            <BTd
              v-for="(column, index) in selectedDataSourceColumns"
              :key="index">
              {{ column.label }}
            </BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
    </BCard>
  </BContainer>
</template>

<script setup>
/**
 * @description
 * Create report table that displays the selected data source columns
 * along with the ability for the user to edit the table headings.
 */
import { computed } from 'vue';
import {
  BCard,
  BCardTitle,
  BCardText,
  BContainer,
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';

const props = defineProps({
  dataSources: {
    type: Array,
    default: () => [],
  },
});

const selectedDataSourceColumns = computed(() => {
  const [entity] = props.dataSources;
  return entity?.selectedColumns;
});
</script>
