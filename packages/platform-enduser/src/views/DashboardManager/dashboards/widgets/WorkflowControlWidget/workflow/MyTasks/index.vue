<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrListGroup :title="this.$t('pages.workflow.myTasks')">
      <template v-if="!isEmpty(tasks)">
        <TransitionGroup
          name="fade"
          mode="out-in">
          <FrListItem
            :collapsible="true"
            v-for="(task, id) in tasks"
            :key="`myTask_${id}`"
            :ref="`collapse-${id}`"
            @shown="setShown(id)"
            @hidden="setHidden(id)">
            <template #list-item-header>
              <div class="d-inline-flex w-100 media">
                <div class="media-body align-self-center">
                  <h6>{{ task.name }}</h6>
                </div>
                <div class="d-flex flex-row ml-2 align-self-center">
                  <BButton
                    v-if="!isEmpty(task.task.candidates.candidateGroups)"
                    variant="link"
                    size="sm"
                    @click.stop="requeue(id)">
                    {{ $t('pages.workflow.requeue') }}
                  </BButton>
                  <BButton
                    v-if="panelShown[id] === true"
                    variant="link"
                    size="sm"
                    :ref="`cancel-${id}`"
                    class="btn-edit pb-2">
                    {{ $t('common.cancel' ) }}
                  </BButton>
                  <BButton
                    v-else
                    variant="link"
                    size="sm"
                    class="btn-edit">
                    {{ $t('common.edit' ) }}
                  </BButton>
                </div>
              </div>
            </template>
            <template #list-item-collapse-body>
              <div class="d-inline-flex w-100">
                <FrTask
                  :task-instance="task"
                  :shown="panelShown[id]"
                  :ref="id"
                  @loadProcess="(process) => $emit('loadProcess', process)"
                  @cancel="cancel"
                  @completeTask="completeTask" />
              </div>
            </template>
          </FrListItem>
        </TransitionGroup>
      </template>
      <FrListItem v-else>
        <template #list-item-header>
          <div class="text-muted text-center w-100">
            {{ $t('pages.workflow.noAssignedTasks') }}
          </div>
        </template>
      </FrListItem>
    </FrListGroup>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import {
  isFunction, isEmpty, keys, difference, first, isUndefined, forEach,
} from 'lodash';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem/';
import Task from '../Task';

/**
* @description Dashboard widget that lists tasks currently assigned to the logged in user
*
* */
export default {
  name: 'MyTasks',
  props: {
    tasks: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    const panelShown = {};

    forEach(this.tasks, (value, id) => {
      panelShown[id] = false;
    });

    return {
      panelShown,
      onHidden: null,
    };
  },
  components: {
    BButton,
    FrListGroup,
    FrListItem,
    FrTask: Task,
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
    requeue(id) {
      const { task } = this.tasks[id];
      const action = 'updateAssignment';
      const payload = { id, task, assignee: null };

      this.update(id, action, payload);
    },
    completeTask(payload) {
      this.update(payload.id, 'completeTask', payload);
    },
    update(id, action, payload) {
      const update = () => {
        this.$emit(action, payload);
      };

      if (this.panelShown[id]) {
        this.onHidden = update;
        this.cancel(id);
      } else {
        update();
      }
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
