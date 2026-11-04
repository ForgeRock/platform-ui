<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrHeader
        :title="$t('governance.accessModeling.hub.title')"
        :subtitle="$t('governance.accessModeling.hub.subtitle')" />
      <BRow class="my-5">
        <BCol
          v-for="card in visibleCards"
          :key="card.id"
          cols="12"
          md="6"
          class="mb-4">
          <BCard
            no-body
            class="h-100 shadow-none"
            :class="card.enabled ? 'cursor-pointer hover-blue-border' : 'disabled-card'"
            :role="card.enabled ? 'button' : null"
            :tabindex="card.enabled ? 0 : null"
            :aria-disabled="card.enabled ? null : 'true'"
            :data-testid="`hub-card-${card.id}`"
            @click="card.enabled && openCard(card)"
            @keydown.enter="card.enabled && openCard(card)"
            @keydown.space.prevent="card.enabled && openCard(card)">
            <BCardBody>
              <div class="d-flex align-items-center mb-3">
                <FrIcon
                  :name="card.icon"
                  :icon-class="card.enabled ? 'size-28 color-blue' : 'size-28 text-muted'" />
              </div>
              <div class="d-flex align-items-center mb-2">
                <h2 class="h5 mb-0">
                  {{ $t(card.titleKey) }}
                </h2>
                <span
                  v-if="!card.enabled"
                  class="badge badge-light badge-pill ml-2">
                  {{ $t('governance.accessModeling.hub.comingSoon') }}
                </span>
              </div>
              <p class="mb-0">
                <small>{{ $t(card.descriptionKey) }}</small>
              </p>
            </BCardBody>
            <BCardFooter class="border-0 pt-0 d-flex align-items-center">
              <span
                :class="card.enabled ? 'color-blue hover-underline' : 'text-muted'"
                class="font-weight-bold">
                {{ $t('governance.accessModeling.hub.getStarted') }}
              </span>
              <FrIcon
                :icon-class="card.enabled ? 'ml-1 color-blue' : 'ml-1 text-muted'"
                name="arrow_forward" />
            </BCardFooter>
          </BCard>
        </BCol>
      </BRow>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BCard,
  BCardBody,
  BCardFooter,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const router = useRouter();

const cards = [
  {
    id: 'accessModeling',
    icon: 'lan',
    enabled: true,
    routeTo: { name: 'AccessModeling' },
    titleKey: 'governance.accessModeling.hub.accessModelingCard.title',
    descriptionKey: 'governance.accessModeling.hub.accessModelingCard.description',
  },
  {
    id: 'userPopulation',
    icon: 'groups',
    enabled: true,
    routeTo: { name: 'PopulationRoleMiningSessions' },
    titleKey: 'governance.accessModeling.hub.userPopulationCard.title',
    descriptionKey: 'governance.accessModeling.hub.userPopulationCard.description',
  },
  {
    id: 'cloneUser',
    icon: 'file_copy',
    enabled: false,
    // TODO: remove this hidden flag once Clone an Existing User ships
    hidden: true,
    titleKey: 'governance.accessModeling.hub.cloneUserCard.title',
    descriptionKey: 'governance.accessModeling.hub.cloneUserCard.description',
  },
  {
    id: 'accessAnalyzer',
    icon: 'manage_search',
    enabled: true,
    routeTo: { name: 'AccessModelingAnalysis' },
    titleKey: 'governance.accessModeling.hub.accessAnalyzerCard.title',
    descriptionKey: 'governance.accessModeling.hub.accessAnalyzerCard.description',
  },
];

const visibleCards = computed(() => cards.filter((card) => !card.hidden));

/**
 * Navigate to the card's target route
 * @param {Object} card the card configuration
 */
function openCard(card) {
  router.push(card.routeTo);
}
</script>

<style lang="scss" scoped>
.disabled-card {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled-card:hover {
  border-color: $gray !important;
}
</style>
