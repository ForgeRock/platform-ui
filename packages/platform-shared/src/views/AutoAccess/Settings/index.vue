<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="container-fluid">
    <div class="my-5">
      <FrHeader
        :title="$t('access.settings.title')"
        :subtitle="$t('access.settings.subTitle')" />
      <BCard no-body>
        <BButton
          variant="none"
          @click="visibleBaseline = !visibleBaseline"
          class="d-flex align-items-center w-100">
          <div class="w-75 text-left">
            {{ $t("access.settings.loadbaseline") }}
          </div>
          <div class="w-25 text-right">
            <span class="material-icons-outlined">
              {{ visibleBaseline ? "expand_less" : "expand_more" }}
            </span>
          </div>
        </BButton>
        <BCollapse
          v-model="visibleBaseline"
          id="baseline-collapse">
          <div class="text-right m-3">
            <BButton
              variant="primary"
              @click="handleBaselineIngest">
              {{ $t("common.start") }}
            </BButton>
            <BButton
              variant="outline-secondary"
              @click="handleBaselineIngestCancel">
              {{ $t("common.reset") }}
            </BButton>
          </div>
          <div
            id="json-editor"
            class="p-4 json-editor border-top" />
        </BCollapse>
      </BCard>
      <BCard
        no-body
        class="mt-4">
        <BButton
          class="d-flex align-items-center w-100"
          variant="none"
          @click="visibleLinks = !visibleLinks">
          <div class="w-75 text-left">
            {{ $t("common.links") }}
          </div>
          <div class="w-25 text-right">
            <span class="material-icons-outlined">
              {{ visibleLinks ? "expand_less" : "expand_more" }}
            </span>
          </div>
        </BButton>
        <BCollapse
          v-model="visibleLinks"
          id="links-collapse">
          <div class="py-3">
            <ul>
              <li className="p-1">
                <a
                  :href="kibanaURL"
                  target="_blank">
                  Kibana
                </a>
              </li>
              <li className="p-1">
                <a
                  :href="cadenceURL"
                  target="_blank">
                  Cadence
                </a>
              </li>
            </ul>
          </div>
        </BCollapse>
      </BCard>
    </div>
  </div>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import { BButton, BCard, BCollapse } from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import saveRemoteIngest from './api/SettingsAPI';

const ace = require('brace');
require('brace/mode/json');

export default {
  name: 'Settings',
  components: {
    FrHeader,
    BCard,
    BButton,
    BCollapse,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      baselineObj: {
        domain: 'autonomous-iam',
        name: 'DemoWorkflow::ingest_baseline_data',
        arguments: {
          dir_path: 'gs://backstage-anonymized-archive/backstage-am-accesss-only-3',
        },
        taskList: 'AccessAnalyticsTaskList',
        timeOut: 600000,
      },
      editor: null,
      kibanaURL: process.env.VUE_APP_KIBANA_HOST ? process.env.VUE_APP_KIBANA_HOST : 'http://autoid-kibana.forgerock.com',
      cadenceURL: process.env.VUE_APP_CADENCE_HOST ? process.env.VUE_APP_CADENCE_HOST : 'http://autoid-cadence-web.forgerock.com',
      visibleBaseline: true,
      visibleLinks: true,
    };
  },
  mounted() {
    const editor = ace.edit('json-editor');
    editor.getSession().setMode('ace/mode/json');
    editor.setValue(JSON.stringify(this.baselineObj, null, '\t'));
    editor.$blockScrolling = Infinity;
    editor.getSession().on(
      'change',
      () => {
        this.baselineObj = editor.getSession().getValue();
      },
    );
    editor.clearSelection();
    this.editor = editor;
  },
  methods: {
    handleBaselineIngest() {
      saveRemoteIngest(JSON.parse(this.baselineObj))
        .then(() => {
          this.displayNotification('success', this.$t('access.settings.saveIngestSuccess'));
        })
        .catch((e) => {
          this.showErrorMessage(e, this.$t('access.settings.saveIngestError'));
        });
    },
    handleBaselineIngestCancel() {
      this.baselineObj = {
        domain: 'autonomous-iam',
        name: 'DemoWorkflow::ingest_baseline_data',
        arguments: {
          dir_path: 'gs://backstage-anonymized-archive/backstage-am-accesss-only-3',
        },
        taskList: 'AccessAnalyticsTaskList',
        timeOut: 600000,
      };
      this.editor.setValue(JSON.stringify(this.baselineObj, null, '\t'));
      this.editor.clearSelection();
    },
  },
};
</script>

<style lang="scss" scoped>
.json-editor {
  height: 300px;
}
</style>
