<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 bg-light border-top">
    <p class="section-header mb-3">
      {{ $t('governance.notifications.rawTaskJson') }}
    </p>
    <pre class="raw-json">{{ formattedJson }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { omit } from 'lodash';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

/**
 * Produces a pretty-printed JSON string of the raw task, stripping display-only
 * keys (template, recipient, createdOn, sendDate) and moving taskData to the end
 * so the most relevant raw fields appear first.
 * @type {import('vue').ComputedRef<string>}
 */
const formattedJson = computed(() => {
  const displayKeys = ['template', 'recipient', 'createdOn', 'sendDate', '_showDetails', 'assignment'];
  const { taskData, ...rest } = omit(props.task, displayKeys);
  const ordered = taskData !== undefined ? { ...rest, taskData } : rest;
  return JSON.stringify(ordered, null, 2);
});
</script>

<style lang="scss" scoped>
.section-header {
  font-size: 1rem;
  font-weight: 600;
  color: $gray-900;
}

.raw-json {
  cursor: text;
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: 4px;
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
