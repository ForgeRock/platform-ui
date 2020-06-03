<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
            <div
              slot="list-item-header"
              class="d-inline-flex w-100 media">
              <div class="media-body align-self-center">
                <h6>{{ task.name }}</h6>
              </div>
              <div
                v-if="!isEmpty(task.task.candidates.candidateGroups)"
                class="btn btn-sm btn-link float-right"
                @click.stop="requeue(id)">
                {{ $t('pages.workflow.requeue') }}
              </div>
              <div class="d-flex ml-3 align-self-center">
                <div
                  class="btn btn-sm btn-link float-right btn-cancel"
                  :ref="`cancel-${id}`">
                  {{ $t('pages.workflow.cancel') }}
                </div>
                <div class="btn btn-sm btn-link float-right btn-edit">
                  {{ $t('pages.workflow.edit') }}
                </div>
              </div>
            </div>
            <div
              slot="list-item-collapse-body"
              class="d-inline-flex w-100">
              <FrTask
                :task-instance="task"
                :ref="id"
                @loadProcess="(process) => $emit('loadProcess', process)"
                @cancel="cancel"
                @completeTask="completeTask" />
            </div>
          </FrListItem>
        </TransitionGroup>
      </template>
      <FrListItem v-else>
        <div
          slot="list-item-header"
          class="text-muted text-center w-100">
          {{ $t('pages.workflow.noAssignedTasks') }}
        </div>
      </FrListItem>
    </FrListGroup>
  </div>
</template>

<script>
import {
  isFunction, isEmpty, keys, difference, first, isUndefined,
} from 'lodash';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem/';
import Task from './Task';

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
    return { panelShown: {}, onHidden: null };
  },
  components: {
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
