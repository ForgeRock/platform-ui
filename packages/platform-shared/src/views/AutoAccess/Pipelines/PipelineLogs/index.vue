<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div v-if="error">
      <BAlert
        show
        variant="danger"
        class="my-0">
        <i class="material-icons-outlined">
          error_outline
        </i>
        <span>{{ error }}</span>
      </BAlert>
    </div>
    <BOverlay
      v-else
      :show="!logs">
      <div
        id="pipeline-logs"
        class="p-4 json-editor border-top" />
    </BOverlay>
  </div>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import { BAlert, BOverlay } from 'bootstrap-vue';
import { getPipelineExecutionLogs } from '../api/PipelineApi';

const YAML = require('yaml');
const ace = require('brace');
require('brace/mode/yaml');

export default {
  name: 'PipelineLogs',
  components: {
    BAlert,
    BOverlay,
  },
  props: {
    pipelineId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      error: false,
      logs: null,
    };
  },
  mounted() {
    this.setLogs();
  },
  methods: {
    setLogs() {
      const editor = ace.edit('pipeline-logs');
      editor.getSession().setMode('ace/mode/yaml');
      editor.setOption('printMargin', 100);
      editor.setOption('tabSize', 2);
      editor.setOption('readOnly', true);
      editor.getSession().setWrapLimitRange(0, editor.getOption('printMargin'));
      editor.getSession().setUseWrapMode(true);
      editor.$blockScrolling = Infinity;

      getPipelineExecutionLogs(this.pipelineId).then((data) => {
        this.logs = this.jsonToYaml(data);

        editor.setValue(this.logs);
        editor.clearSelection();
      }).catch(() => {
        this.error = 'An error occured fetching logs.';
      });
    },
    jsonToYaml(obj) {
      const doc = new YAML.Document();
      doc.contents = obj;

      return doc.toString();
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
