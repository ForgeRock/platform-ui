<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    ok-only
    ok-variant="outline-primary"
    id="linkedApplicationModal"
    ref="linkedApplicationModal"
    :ok-title="$t('common.done')">
    <template #modal-title>
      <BMedia no-body>
        <BImg
          class="mt-3 mb-1 mr-4"
          width="36"
          height="36"
          :src="require(`@forgerock/platform-shared/src/assets/images/connectors/${applicationData.image}`)"
          :alt="$t('common.logo')"
          fluid />
        <div class="media-body align-self-center">
          <small class="text-muted">
            {{ applicationData.connectorType }}
          </small>
          <h5 class="modal-title">
            {{ applicationData.name }}
          </h5>
        </div>
      </BMedia>
    </template>

    <template>
      <ul class="p-0">
        <li
          v-for="(item, index) in applicationData.data"
          :key="index"
          class="mb-4">
          <h6 class="text-muted mb-1">
            {{ item.name }}
          </h6>

          <p v-if="item.type === 'string' || item.type === 'number' || item.type === 'integer' || item.type === 'boolean'">
            {{ item.value }}
          </p>

          <ul
            v-else-if="item.type === 'array'
              && (item.itemsType === 'string' || item.itemsType === 'number' || item.itemsType === 'integer' || item.itemsType === 'boolean')"
            class="pl-0 py-2 array-item">
            <li
              v-for="(val, valIndex) in item.value"
              :key="valIndex"
              class="border-bottom py-2 my-0">
              <p class="mb-0">
                {{ val }}
              </p>
            </li>
          </ul>

          <div
            v-else-if="(item.type === 'array' && item.itemsType === 'object') || item.type === 'object'"
            class="py-2">
            <VuePrismEditor
              v-model="item.value"
              readonly
              line-numbers
              :aria-label="$t('editor.accessibilityHelp')"
              :highlight="(code) => highlighter(code, 'json')"
              @keydown="blurOnEscape"
            />
          </div>
        </li>
      </ul>
    </template>
  </BModal>
</template>

<script>
import {
  BModal,
  BImg,
  BMedia,
} from 'bootstrap-vue';

import { PrismEditor as VuePrismEditor } from 'vue-prism-editor';
import blurOnEscape, { highlighter } from '@forgerock/platform-shared/src/utils/codeEditor';

export default {
  name: 'LinkedApplicationModal',
  components: {
    BImg,
    BMedia,
    BModal,
    VuePrismEditor,
  },
  props: {
    applicationData: {
      type: Object,
      default: null,
    },
  },
  methods: {
    blurOnEscape,
    highlighter,
  },
};
</script>

<style lang="scss" scoped>
  .modal-title {
    line-height: initial;
  }

  li {
    list-style: none;
  }

  li p {
    color: $gray-900;
    word-break: break-all;
  }

  h6 {
    font-size: 0.8125rem;
    font-weight: 400;
    letter-spacing: normal;
  }

  .array-item li:first-child {
    border-top: 1px solid $gray-200;
  }
</style>
