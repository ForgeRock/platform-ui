<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSimulatorDetail
      v-if="activeSimulation"
      :simulation-type="activeSimulation"
      :get-scope-list="getScopeList"
      :get-scope-by-id="getScopeById"
      @back="activeSimulation = null" />
    <template v-else>
      <p class="text-muted mb-4">
        {{ $t('governance.accessAnalysis.simulator.description') }}
      </p>
      <BRow>
        <BCol
          v-for="card in cards"
          :key="card.id"
          md="6"
          class="mb-4">
          <BCard
            no-body
            class="h-100 shadow-none cursor-pointer hover-blue-border"
            role="button"
            tabindex="0"
            :data-testid="`simulator-card-${card.id}`"
            @click="startSimulation(card)"
            @keydown.enter="startSimulation(card)"
            @keydown.space.prevent="startSimulation(card)">
            <BCardBody>
              <div class="d-flex align-items-center mb-3">
                <FrIcon
                  :name="card.icon"
                  icon-class="size-28 color-blue" />
              </div>
              <h2 class="h5">
                {{ $t(card.titleKey) }}
              </h2>
              <p class="mb-0">
                <small>{{ $t(card.descriptionKey) }}</small>
              </p>
            </BCardBody>
            <BCardFooter class="border-0 pt-0 d-flex align-items-center">
              <span class="color-blue hover-underline font-weight-bold">
                {{ $t('governance.accessAnalysis.simulator.simulate') }}
              </span>
              <FrIcon
                icon-class="ml-1 color-blue"
                name="arrow_forward" />
            </BCardFooter>
          </BCard>
        </BCol>
      </BRow>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import {
  BCard,
  BCardBody,
  BCardFooter,
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSimulatorDetail from './SimulatorDetail';

defineProps({
  getScopeList: { type: Function, default: null },
  getScopeById: { type: Function, default: null },
});

const store = useStore();
const activeSimulation = ref(null);

const cards = computed(() => {
  const roleCards = [
    {
      id: 'addRole',
      icon: 'person_add',
      titleKey: 'governance.accessAnalysis.simulator.addRole.title',
      descriptionKey: 'governance.accessAnalysis.simulator.addRole.description',
    },
    {
      id: 'removeRole',
      icon: 'person_remove',
      titleKey: 'governance.accessAnalysis.simulator.removeRole.title',
      descriptionKey: 'governance.accessAnalysis.simulator.removeRole.description',
    },
  ];
  const scopeCards = [
    {
      id: 'addScope',
      icon: 'policy',
      titleKey: 'governance.accessAnalysis.simulator.addScope.title',
      descriptionKey: 'governance.accessAnalysis.simulator.addScope.description',
    },
    {
      id: 'removeScope',
      icon: 'remove_circle',
      titleKey: 'governance.accessAnalysis.simulator.removeScope.title',
      descriptionKey: 'governance.accessAnalysis.simulator.removeScope.description',
    },
  ];
  return store.state.SharedStore.governanceDevEnabled ? [...roleCards, ...scopeCards] : roleCards;
});

/**
 * Open the simulator detail for the given card
 * @param {Object} card the card configuration
 */
function startSimulation(card) {
  activeSimulation.value = card.id;
}
</script>
