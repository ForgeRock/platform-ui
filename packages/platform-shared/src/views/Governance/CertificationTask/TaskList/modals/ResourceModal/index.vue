<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :aria-label="resource.displayName ? `${$t('common.resource')}: ${resource.displayName}` : $t('common.resource')"
    body-class="p-0"
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <div class="size-48 fr-app-logo-bg d-flex align-items-center justify-content-center mr-3">
          <FrIcon
            name="settings_applications"
            icon-class="md-32" />
        </div>
        <div class="media-body">
          <small class="mb-1">{{ $t('common.resource') }}</small>
          <h5 class="mb-0">
            {{ resource.displayName || blankValueIndicator }}
          </h5>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <BTabs
      class="card-tabs-vertical"
      pills
      vertical>
      <BTab
        active
        :title="$t('governance.certificationTask.lineItemDetailsModal.resourceDetailsTabText')">
        <div class="p-4">
          <dl class="row">
            <dt class="col-lg-4">
              {{ $t('common.displayName') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.displayName || blankValueIndicator }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.id') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.id || blankValueIndicator }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.objectType') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.objectType || blankValueIndicator }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.nhi') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.isNHI ? $t('common.yes') : $t('common.no') }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.sourceId') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.sourceId || blankValueIndicator }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.application') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.applicationId || blankValueIndicator }}
            </dd>
            <dt class="col-lg-4">
              {{ $t('common.lastImport') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              {{ resource.lastImportTime || blankValueIndicator }}
            </dd>
          </dl>
          <FrGlossaryDisplayForm
            :display-data="displayData"
            :glossary-schema="glossarySchema"
            :glossary-values="glossaryValues" />
        </div>
      </BTab>
    </BTabs>
  </BModal>
</template>

<script>
/**
 * Modal displaying resource details including NHI status and glossary attributes.
 * @component ResourceModal
 * @prop {Object} resource - Resource object from the campaign item (displayName, id, objectType, isNHI, sourceId, applicationId, lastImportTime, glossary)
 * @prop {Object} displayData - Optional _displayData from the certification item API
 * @prop {Array} glossarySchema - Glossary attribute schema for the display form
 * @prop {String} modalId - BModal id used to programmatically show/hide the modal
 */
import {
  BButtonClose,
  BModal,
  BMedia,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import FrGlossaryDisplayForm from '@forgerock/platform-shared/src/components/governance/GlossaryDisplayForm';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'ResourceModal',
  components: {
    BButtonClose,
    BModal,
    BMedia,
    BTab,
    BTabs,
    FrGlossaryDisplayForm,
    FrIcon,
  },
  props: {
    resource: {
      type: Object,
      default: () => ({}),
    },
    displayData: {
      type: Object,
      default: () => ({}),
    },
    glossarySchema: {
      type: Array,
      default: () => ([]),
    },
    modalId: {
      type: String,
      default: 'CertificationTaskResourceModal',
    },
  },
  data() {
    return {
      blankValueIndicator,
    };
  },
  computed: {
    glossaryValues() {
      return this.resource.glossary?.idx?.['/resource'] || {};
    },
  },
};
</script>
