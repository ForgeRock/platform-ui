<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BContainer class="mt-5">
    <BCard class="text-center py-2">
      <BCardTitle
        class="h4 mb-2"
        title-tag="h3">
        {{ $t('reports.template.noColumnsAdded') }}
      </BCardTitle>
      <BCardText>
        {{ $t('reports.template.selectColumnsFromDataSets') }}
      </BCardText>
    </BCard>
  </BContainer>
</template>

<script setup>
/**
 * @description
 * Create report table that shows the relevant data source properties for creating an analytics report.
 */
import {
  BCard,
  BCardTitle,
  BCardText,
  BContainer,
} from 'bootstrap-vue';
</script>
