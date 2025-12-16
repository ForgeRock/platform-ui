<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="card-wrapper"
    :style="{ transform: `translate(${animatedX}px, ${animatedY}px)` }">
    <VueDraggableResizable
      :parent="true"
      :prevent-deactivation="true"
      :x="0"
      :y="0"
      :draggable="false"
      :resizable="false">
      <div
        @click="handleClick">
        <BCard
          ref="accessCardRef"
          :class="['fr-access-card', 'm-1', 'p-0', 'd-flex', 'justify-content-start', 'border-0', 'text-truncate', { 'active-card': selected }]">
          <div
            v-if="access.connections && Object.keys(access.connections).length > 0"
            class="fr-node-holder">
            <div class="fr-node-column">
              <p class="fr-node-point fr-node-point-out mt-4">
                <i class="fr-node-point-outcome fr-center-outcome" />
              </p>
            </div>
          </div>
          <Component
            :is="accessCard"
            :access="access" />
        </BCard>
      </div>
    </VueDraggableResizable>
  </div>
</template>

<script setup>
/**
 * User access display component that takes the list of a user's access and formats it into a
 * format usable by node drawManager. Does not allow drag and drop of access, but does allow re-arranging access based
 * on pre-defined criteria.
 */
import {
  computed, nextTick, ref, watch,
} from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable';
import { BCard } from 'bootstrap-vue';
import FrEntitlementCard from './EntitlementCard';
import FrRoleCard from './RoleCard';
import FrAccountCard from './AccountCard';

const emit = defineEmits([
  'access-selected',
  'get-card-details',
]);

const props = defineProps({
  access: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Number,
    default: 1,
  },
});

const animatedX = ref(props.access.x);
const animatedY = ref(props.access.y);
const accessCardRef = ref(null);
const itemType = computed(() => props.access?.type || '');
const accessCard = computed(() => {
  const componentMap = {
    accountGrant: FrAccountCard,
    entitlementGrant: FrEntitlementCard,
    roleMembership: FrRoleCard,
  };
  return componentMap[itemType.value];
});

/**
 * Generates the card locations required for drawing paths
 */
async function getCardDetails() {
  await nextTick;
  if (!accessCardRef.value) { return; }
  emit('get-card-details', accessCardRef.value, props.access.id);
}

/**
 * Emits the selected access when the card is clicked
 */
function handleClick() {
  emit('access-selected', props.access);
}

watch(accessCardRef, (newVal) => {
  if (newVal) {
    getCardDetails();
  }
},
{ immediate: true });

// Watch for external x/y changes and animate toward them
watch(
  () => [props.access.x, props.access.y],
  async ([newX, newY]) => {
    await nextTick();
    animatedX.value = newX;
    animatedY.value = newY;
    getCardDetails();
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.card-wrapper {
  position: absolute;
  transition: transform 0.3s ease-in-out; /* <--- transition defined here */
}

.fr-access-card {
  width: 250px;
  height: 65px;
  background-color: rgba(255, 255, 255, 0.7);
  position: absolute;
  overflow: visible;
  top: 0;
  left: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.13);

  :deep(.card-body) {
    margin: 0;
    padding: 1rem!important;

    .fr-node-holder {
      display: flex;
      flex-direction: row;

      .fr-node-column {
        display: flex;
        flex-direction: column;
        justify-content: right;
        height: 100%;
        flex: 1;
        position: absolute;
        right: 0;
        top: 50%;
        margin: 0;
        transform: translate(50%, -50%);

        .fr-node-point {
          .fr-node-point-outcome {
            position: relative;
            top: -3px;
            border-radius: 50%;
            display: inline-flex;
            background-color: $white;
            border: 2px solid $fr-tree-accent;
            height: 12px;
            width: 12px;
            .fr-center-outcome {
              top: calc(50% - 3px);
            }
          }
        }
      }
    }
  }
}

.active-card {
  border: 1px solid $primary !important;
  transition: border-color 0.2s !important;

  .fr-node-point-outcome {
    border: 2px solid $primary !important;
  }
}

.fade-connection {
  animation: fade 2s forwards;
}

@keyframes fade {
  to {
    opacity: 0.2;
  }
}

.accented-connection {
  animation: glow 2s forwards;
}

@keyframes glow {
  to {
    opacity: 1;
  }
}
</style>
