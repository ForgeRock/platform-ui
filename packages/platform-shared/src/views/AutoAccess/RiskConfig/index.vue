<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="container risk-config">
    <div class="my-5">
      <h1>
        {{ $t('autoAccess.access.riskConfig.title') }}
      </h1>
      <p class="text-muted mb-4">
        {{ $t('autoAccess.access.riskConfig.subtitle') }}
      </p>
      <BAlert
        variant="info"
        show>
        <div class="d-flex flex-row align-items-center">
          <i class="material-icons-outlined">
            info
          </i>
          <div class="ml-2">
            {{ $t('autoAccess.access.info.professionalUseOnly') }}
          </div>
        </div>
      </BAlert>
      <div class="card">
        <BOverlay :show="loading">
          <div
            id="risk-config-jslt-editor"
            class="p-4 json-editor border-top" />
        </BOverlay>
        <div class="card-footer p-3 d-flex justify-content-between align-items-center">
          <span />
          <div>
            <BButton
              size="md"
              class="mr-2"
              variant="link"
              @click="reset">
              {{ $t("common.reset") }}
            </BButton>
            <BButton
              size="md"
              class="mr-2"
              variant="primary"
              :disabled="error"
              @click="() => { this.showModal = true }">
              {{ $t("common.save") }}...
            </BButton>
          </div>
        </div>
      </div>
    </div>
    <AddDataSourceModal
      :show-modal="showModal"
      :type="'risk-config'"
      :process-j-s-o-n="yamlToJson(processYAML)"
      :process-i-d="processID"
      @hidden="() => {
        this.showModal = false;
        this.reset();
      }"
      @saved="saved"
    />
  </div>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import {
  BAlert, BButton, BOverlay,
} from 'bootstrap-vue';
import AddDataSourceModal from '../DataSources/AddDataSourceModal';
import { getDefaultProcess } from './api/RiskConfigAPI';

const YAML = require('yaml');
const ace = require('brace');
require('brace/mode/yaml');

export default {
  name: 'RiskConfig',
  components: {
    BAlert,
    BButton,
    BOverlay,
    AddDataSourceModal,
  },
  data() {
    return {
      initialProcessYAML: '',
      processYAML: '',
      processID: null,
      showModal: false,
      error: false,
      loading: true,
    };
  },
  mounted() {
    const editor = ace.edit('risk-config-jslt-editor');
    editor.getSession().setMode('ace/mode/yaml');
    editor.setOption('printMargin', 100);
    editor.setOption('tabSize', 2);
    editor.getSession().setWrapLimitRange(0, editor.getOption('printMargin'));
    editor.getSession().setUseWrapMode(true);
    editor.$blockScrolling = Infinity;

    editor.getSession().on(
      'change',
      () => {
        this.processYAML = editor.getSession().getValue();
      },
    );
    editor.getSession().on(
      'changeAnnotation',
      () => {
        const validation = editor.getSession().getAnnotations();
        this.error = validation.length > 0;
      },
    );
    editor.clearSelection();

    this.loading = true;
    getDefaultProcess().then((process) => {
      this.processYAML = this.jsonToYaml(process);
      this.initialProcessYAML = this.processYAML;

      editor.setValue(this.processYAML);
      editor.clearSelection();
    })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    jsonToYaml(obj) {
      const doc = new YAML.Document();
      doc.contents = obj;

      return doc.toString();
    },
    yamlToJson(str) {
      let out = str;
      try {
        out = YAML.parse(str);
        this.error = false;
        return out;
      } catch (e) {
        this.error = true;
        return '';
      }
    },
    saved() {
      this.initialProcessYAML = this.processYAML;
      this.showModal = false;
    },
    reset() {
      const editor = ace.edit('risk-config-jslt-editor');
      editor.getSession().setMode('ace/mode/yaml');
      editor.setValue(this.initialProcessYAML);
      editor.moveCursorTo(0, 0);
      editor.getSession().setUseWrapMode(true);
      editor.clearSelection();
    },
  },
};
</script>
<style scoped>
  .json-editor {
    min-height: 400px;
    height: calc(100vh - 425px);
  }
</style>
