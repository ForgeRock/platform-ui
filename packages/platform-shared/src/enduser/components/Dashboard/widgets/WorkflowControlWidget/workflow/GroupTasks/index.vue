<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrListGroup :title="this.$t('pages.workflow.unassignedTasks')">
      <template v-if="!isEmpty(tasks)">
        <TransitionGroup
          name="fade"
          mode="out-in">
          <FrListItem
            :collapsible="true"
            v-for="(taskDefinition, id) in tasks"
            :key="`groupTask_${id}`"
            :ref="`collapse-${id}`"
            @shown="setShown(id)"
            @hidden="setHidden(id)">
            <template #list-item-header>
              <div class="d-inline-flex w-100 media">
                <div class="media-body align-self-center">
                  <h6 class="mb-1 mt-0">
                    {{ taskDefinition.name }}
                  </h6>
                  <small class="text-muted d-block mb-2">
                    {{ $t('pages.workflow.notAssigned') }}
                  </small>
                </div>
                <div class="d-flex mb-3 ml-3 align-self-center">
                  <BButton
                    v-if="panelShown[id] === true"
                    variant="link"
                    size="sm"
                    class="btn-cancel mb-2"
                    :ref="`cancel-${id}`">
                    {{ $t('common.cancel') }}
                  </BButton>
                  <BButton
                    v-else
                    variant="link"
                    size="sm"
                    class="btn-edit">
                    {{ $t('pages.workflow.assign') }}
                  </BButton>
                </div>
              </div>
            </template>
            <template #list-item-collapse-body>
              <div class="d-inline-flex w-100">
                <FrAssignTask
                  :shown="panelShown[id]"
                  :task-definition="taskDefinition"
                  @loadProcess="(process) => $emit('loadProcess', process)"
                  @assignTask="assignTask" />
              </div>
            </template>
          </FrListItem>
        </TransitionGroup>
      </template>
      <FrListItem v-else>
        <template #list-item-header>
          <div class="text-muted text-center w-100">
            {{ $t('pages.workflow.noGroupTasks') }}
          </div>
        </template>
      </FrListItem>
    </FrListGroup>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import {
  isFunction, isEmpty, keys, difference, first, isUndefined,
} from 'lodash';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem/';
import FrAssignTask from '../AssignTask';

/**
 * @description Dashboard widget that lists available group tasks that can be assigned
 *
 * */
export default {
  name: 'GroupTasks',
  props: {
    tasks: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return { panelShown: {}, onHidden: null };
  },
  components: {
    BButton,
    FrListGroup,
    FrListItem,
    FrAssignTask,
  },
  methods: {
    isEmpty,
    first,
    setShown(id) {
      this.$set(this.panelShown, id, true);
    },
    setHidden(id) {
      this.$set(this.panelShown, id, false);

      if (isFunction(this.onHidden)) {
        this.onHidden();
        this.onHidden = null;
      }
    },
    cancel(id) {
      first(this.$refs[`cancel-${id}`]).click();
    },
    assignTask({ id, assignee }) {
      const { task } = this.tasks[id];

      this.onHidden = () => {
        this.$emit('updateAssignment', { assignee, id, task });
      };

      this.cancel(id);
    },
  },
  watch: {
    tasks: {
      /**
        * This function sets the state of panelShown. Anytime new tasks are added to the tasks prop,
        * the prop key is added to the panelShown object with an initial state of `false`.
        */
      handler(val, oldVal) {
        const newVals = difference(keys(val), keys(oldVal));

        if (isUndefined(this.panelShown)) {
          this.panelShown = {};
        }

        newVals.forEach((panelValue) => {
          this.$set(this.panelShown, panelValue, false);
        });
      },
      deep: true,
    },
  },
};
</script>
