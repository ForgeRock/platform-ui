<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrListGroup :title="this.$t('pages.workflow.startProcess')">
      <template v-if="!isEmpty(processes)">
        <FrListItem
          :collapsible="true"
          v-for="(process, id) in processes"
          :key="id"
          @hide="reset(id)"
          @show="$emit('loadProcess', process)">
          <template #list-item-header>
            <div class="d-inline-flex w-100 media">
              <div class="media-body align-self-center">
                <h6>{{ process.name }}</h6>
              </div>
              <div class="d-flex ml-3 align-self-center">
                <div
                  class="btn btn-sm btn-link float-right btn-cancel"
                  :ref="`cancel-${id}`">
                  {{ $t('pages.workflow.cancel') }}
                </div>
                <div class="btn btn-sm btn-link float-right btn-edit">
                  {{ $t('pages.workflow.start') }}
                </div>
              </div>
            </div>
          </template>

          <template #list-item-collapse-body>
            <div class="d-inline-flex w-100">
              <FrProcess
                :process-definition="process.processDefinition"
                :ref="id"
                @cancel="cancel"
                @startProcess="(payload) => $emit('startProcess', payload)" />
            </div>
          </template>
        </FrListItem>
      </template>
      <FrListItem v-else>
        <template #list-item-header>
          <div class="text-muted text-center w-100">
            {{ $t('pages.workflow.noProcess') }}
          </div>
        </template>
      </FrListItem>
    </FrListGroup>
  </div>
</template>

<script>
import {
  isEmpty, first, difference, keys, forEach,
} from 'lodash';
import styles from '@forgerock/platform-shared/src/scss/main.scss';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem/';
import Process from '../Process';

/**
* @description Dashboard widget that displays a list of available processes that can be started
*
* */
export default {
  name: 'Processes',
  props: {
    processes: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      panelShown: {},
      loadingColor: styles.baseColor,
    };
  },
  components: {
    FrListGroup,
    FrListItem,
    FrProcess: Process,
  },
  methods: {
    isEmpty,
    show(id) {
      this.$set(this.panelShown, id, true);
      this.$emit('loadProcess', this.processes[id]);
    },
    reset(id) {
      const process = first(this.$refs[id]);
      this.$set(this.panelShown, id, false);
      if (process) {
        process.reset();
      }
    },
    cancel(id) {
      const cancelBtn = first(this.$refs[`cancel-${id}`]);

      if (cancelBtn) {
        this.reset(id);
        cancelBtn.click();
      }
    },
  },
  watch: {
    processes(val, oldVal) {
      const newVals = difference(keys(val), keys(oldVal));

      forEach(newVals, (process, id) => {
        this.panelShown[id] = false;
      });
    },
  },
};
</script>
