<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTableSimple
      v-else-if="allScopes.length"
      hover
      responsive
      class="mb-0">
      <BThead>
        <BTr>
          <BTh class="fr-scopes-tab__col-name">
            {{ $t('common.name') }}
          </BTh>
          <BTh class="fr-scopes-tab__col-user">
            {{ userAName }}
          </BTh>
          <BTh class="fr-scopes-tab__col-user">
            {{ userBName }}
          </BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr
          v-for="scope in allScopes"
          :key="scope.id">
          <BTd class="fr-scopes-tab__col-name">
            {{ scope.name }}
          </BTd>
          <BTd>
            <div class="d-flex align-items-center">
              <template v-if="userAIds.has(scope.id)">
                <FrIcon
                  name="check"
                  class="text-success mr-1" />
                <span class="text-success">{{ $t('governance.accessAnalysis.grants.granted') }}</span>
              </template>
              <template v-else>
                <FrIcon
                  name="block"
                  class="text-danger mr-1" />
                <span class="text-danger">{{ $t('governance.accessAnalysis.grants.notGranted') }}</span>
              </template>
            </div>
          </BTd>
          <BTd>
            <div class="d-flex align-items-center">
              <template v-if="userBIds.has(scope.id)">
                <FrIcon
                  name="check"
                  class="text-success mr-1" />
                <span class="text-success">{{ $t('governance.accessAnalysis.grants.granted') }}</span>
              </template>
              <template v-else>
                <FrIcon
                  name="block"
                  class="text-danger mr-1" />
                <span class="text-danger">{{ $t('governance.accessAnalysis.grants.notGranted') }}</span>
              </template>
            </div>
          </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
    <FrNoData
      v-else
      :card="false"
      icon="inbox"
      :subtitle="$t('governance.accessAnalysis.scopes.noScopes')" />
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
  watch,
  watchEffect,
} from 'vue';
import {
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getUserById } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  userAId: { type: String, required: true },
  userBId: { type: String, required: true },
  userAName: { type: String, default: '' },
  userBName: { type: String, default: '' },
  getScopeById: { type: Function, default: null },
});

const emit = defineEmits(['update:count']);

const isLoading = ref(false);
const userAIds = ref(new Set());
const userBIds = ref(new Set());
const allScopes = ref([]);

function extractScopeIds(user) {
  const scopes = user?.scopes;
  if (!scopes || typeof scopes !== 'object') return [];
  const items = Array.isArray(scopes) ? scopes : Object.values(scopes).flat();
  return [...new Set(items.map((s) => s?.id).filter(Boolean))];
}

let loadScopesSeq = 0;

async function loadScopes() {
  isLoading.value = true;
  allScopes.value = [];
  userAIds.value = new Set();
  userBIds.value = new Set();
  loadScopesSeq += 1;
  const seq = loadScopesSeq;

  const [aResult, bResult] = await Promise.allSettled([
    getUserById(props.userAId),
    getUserById(props.userBId),
  ]);
  if (seq !== loadScopesSeq) return;

  if (aResult.status === 'rejected') {
    showErrorMessage(aResult.reason, i18n.global.t('governance.accessAnalysis.scopes.errorLoading'));
  }
  if (bResult.status === 'rejected') {
    showErrorMessage(bResult.reason, i18n.global.t('governance.accessAnalysis.scopes.errorLoading'));
  }

  const aUser = aResult.status === 'fulfilled' ? aResult.value?.data?.result?.[0] : null;
  const bUser = bResult.status === 'fulfilled' ? bResult.value?.data?.result?.[0] : null;

  const aIds = extractScopeIds(aUser);
  const bIds = extractScopeIds(bUser);
  userAIds.value = new Set(aIds);
  userBIds.value = new Set(bIds);

  const uniqueIds = [...new Set([...aIds, ...bIds])];
  if (uniqueIds.length && props.getScopeById) {
    const scopeResults = await Promise.allSettled(uniqueIds.map((id) => props.getScopeById(id)));
    if (seq !== loadScopesSeq) return;
    allScopes.value = scopeResults
      .map((r, i) => {
        const id = uniqueIds[i];
        const data = r.status === 'fulfilled' ? r.value?.data : null;
        return { ...(data || {}), id, name: data?.name || id };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  isLoading.value = false;
}

onMounted(loadScopes);
watch(() => [props.userAId, props.userBId], loadScopes);
watchEffect(() => emit('update:count', allScopes.value.length));
</script>

<style lang="scss" scoped>
.fr-scopes-tab {
  &__col-name {
    width: 30%;
    font-weight: 600;
  }

  &__col-user {
    width: 35%;
  }
}
</style>
