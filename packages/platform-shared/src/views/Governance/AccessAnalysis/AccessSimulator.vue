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
          md="6"
          class="mb-4">
          <BCard class="h-100">
            <h2 class="h5 mb-2">
              {{ $t('governance.accessAnalysis.simulator.addRole.title') }}
            </h2>
            <p class="text-muted mb-4">
              {{ $t('governance.accessAnalysis.simulator.addRole.description') }}
            </p>
            <BButton
              variant="outline-primary"
              block
              @click="activeSimulation = 'addRole'">
              {{ $t('governance.accessAnalysis.simulator.simulate') }}
            </BButton>
          </BCard>
        </BCol>
        <BCol
          md="6"
          class="mb-4">
          <BCard class="h-100">
            <h2 class="h5 mb-2">
              {{ $t('governance.accessAnalysis.simulator.removeRole.title') }}
            </h2>
            <p class="text-muted mb-4">
              {{ $t('governance.accessAnalysis.simulator.removeRole.description') }}
            </p>
            <BButton
              variant="outline-primary"
              block
              @click="activeSimulation = 'removeRole'">
              {{ $t('governance.accessAnalysis.simulator.simulate') }}
            </BButton>
          </BCard>
        </BCol>
        <template v-if="userStore.adminUser">
          <BCol
            md="6"
            class="mb-4">
            <BCard class="h-100">
              <h2 class="h5 mb-2">
                {{ $t('governance.accessAnalysis.simulator.addScope.title') }}
              </h2>
              <p class="text-muted mb-4">
                {{ $t('governance.accessAnalysis.simulator.addScope.description') }}
              </p>
              <BButton
                variant="outline-primary"
                block
                @click="activeSimulation = 'addScope'">
                {{ $t('governance.accessAnalysis.simulator.simulate') }}
              </BButton>
            </BCard>
          </BCol>
          <BCol
            md="6"
            class="mb-4">
            <BCard class="h-100">
              <h2 class="h5 mb-2">
                {{ $t('governance.accessAnalysis.simulator.removeScope.title') }}
              </h2>
              <p class="text-muted mb-4">
                {{ $t('governance.accessAnalysis.simulator.removeScope.description') }}
              </p>
              <BButton
                variant="outline-primary"
                block
                @click="activeSimulation = 'removeScope'">
                {{ $t('governance.accessAnalysis.simulator.simulate') }}
              </BButton>
            </BCard>
          </BCol>
        </template>
      </BRow>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  BButton,
  BCard,
  BCol,
  BRow,
} from 'bootstrap-vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrSimulatorDetail from './SimulatorDetail';

defineProps({
  getScopeList: { type: Function, default: null },
  getScopeById: { type: Function, default: null },
});

const userStore = useUserStore();
const activeSimulation = ref(null);
</script>
