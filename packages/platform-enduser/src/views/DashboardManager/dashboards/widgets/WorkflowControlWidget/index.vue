<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <Processes
      :processes="processes"
      ref="processes"
      @startProcess="startProcess"
      @loadProcess="loadProcessDefinition" />
    <MyTasks
      :tasks="assignedTasks"
      @updateAssignment="updateAssignment"
      @completeTask="completeTask"
      @loadProcess="loadProcessDefinition" />
    <GroupTasks
      :tasks="availableTasks"
      @updateAssignment="updateAssignment"
      @loadProcess="loadProcessDefinition" />
  </div>
</template>

<script>
import {
  each, first, reject, merge, isEmpty, isUndefined,
} from 'lodash';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import axios from 'axios';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import MyTasks from './workflow/MyTasks';
import Processes from './workflow/Processes';
import GroupTasks from './workflow/GroupTasks';

/**
 * @description Controlling file for loading the three different parts of workflow (available tasks, available processes, and tasks assigned to you).
 *
 * @fires POST /workflow/taskinstance/ID?_action=complete - Call used to save a task, the expected data is based on the configured workflow
 * @fires PUT  /workflow/taskinstance/ID - Assigns a user to an already created task, expected input is a assignee ID
 * @fires GET /endpoint/gettasksview - Get task view information (based on workflow configuration)
 * @fires POST  /workflow/processinstance/?_action=create - Create or start a new task (based on how workflow is configured)
 * @fires GET  /endpoint/getprocessesforuser- Returns all the current task instances assigned to the user currently logged in
 * @fires GET /workflow/processdefinition/ID - Gets the details for the process definition (based on workflow configuration)
 *
 * */
export default {
  name: 'WorkflowControlWidget',
  components: {
    MyTasks,
    GroupTasks,
    Processes,
  },
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  props: {
    widgetDetails: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      assignedTasks: {},
      availableTasks: {},
      processes: {},
    };
  },
  computed: {
    ...mapState(useUserStore, ['userId']),
  },
  created() {
    // Setting a variable after created allows for a component wide variable
    // But without reactivity
    this.workflowService = this.getRequestService();
    this.loadData();
  },
  methods: {
    completeTask({ id, formData }) {
      return this.workflowService.post(`/workflow/taskinstance/${id}?_action=complete`, formData, {
        headers: { Accept: 'application/json, text/javascript, */*; q=0.01' },
      })
        .then(() => {
          this.displayNotification('success', this.$t('pages.workflow.taskSuccessfullyCompleted'));
          this.$delete(this.assignedTasks, id);
        })
        .then(this.loadData)
        .catch((error) => {
          if (error.response.data.code === 403) {
            this.showErrorMessage('error', this.$t('pages.workflow.taskNoLongerAvailable', { taskName: this.assignedTasks[id].name }));
            this.$delete(this.assignedTasks, id);
            this.loadTasks();
          } else {
            this.showErrorMessage(error, this.$t('pages.workflow.taskLoadError'));
          }
        });
    },
    updateAssignment({ id, task, assignee }) {
      return this.workflowService.put(`/workflow/taskinstance/${task._id}`, { assignee }, { headers: { 'If-Match': '"*"' } })
        .then(() => {
          this.displayNotification('success', this.$t('pages.workflow.assignmentSuccess', { taskName: task.name, assignee }));
          // Use $delete to remove the task from the list to get the proper transition
          this.$delete(this.assignedTasks, id);
          this.$delete(this.availableTasks, id);
        })
        .then(this.loadData)
        .catch((error) => {
          if (error.response.data.code === 403) {
            this.showErrorMessage('error', this.$t('pages.workflow.taskNoLongerAvailable', { taskName: this.availableTasks[id].name }));
            this.$delete(this.availableTasks, id);
            this.loadTasks();
          } else {
            this.showErrorMessage(error, this.$t('pages.workflow.taskLoadError'));
          }
        });
    },
    startProcess(payload) {
      return this.workflowService.post('/workflow/processinstance/?_action=create', payload)
        .then(() => {
          this.displayNotification('success', this.$t('pages.workflow.processStartSuccessMessage'));
          this.$refs.processes.cancel(payload._processDefinitionId);
        })
        .then(this.loadData)
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.workflow.taskLoadError'));
        });
    },
    loadProcessDefinition(process) {
      process.fetchProcessDefinition()
        .then(({ data }) => {
          this.$set(process, 'processDefinition', data);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.workflow.fetchDefinitionError'));
        });
    },
    loadProcesses() {
      return this.workflowService.get('/endpoint/getprocessesforuser')
        // Grab the array of processes off the response object.
        .then((processes) => processes.data.processes)
        // Get the process definition for each process object
        .then((processes) => axios.all(processes.map((process) => {
          const fetchProcessDefinition = () => this.workflowService.get(`/workflow/processdefinition/${process._id}`);
          const processDefinition = null;
          return merge(process, { fetchProcessDefinition, processDefinition });
        })))
        // Use the built in `$set` function to reactively get the process definitions into component state
        // This is done since we are injecting Vue code provided via BPMN
        .then((processDefinitions) => {
          processDefinitions.forEach((definition) => {
            this.$set(this.processes, definition._id, definition);
          });
        });
    },
    getTaskParams(userId, groupName) {
      const params = {
        _queryId: 'gettasksview',
        userId,
      };

      if (groupName === 'assignedTasks') {
        params.viewType = 'assignee';
      }

      return params;
    },
    getTaskGroup(groupName) {
      return this[groupName];
    },
    toTasks(taskGroup, { data }) {
      // Filter out any empty results
      const [tasks] = reject(data.result, isEmpty);

      // Process each result
      each(tasks, (taskObj, id) => {
        const { name } = taskObj;
        const task = first(taskObj.tasks);
        let process = this.processes[task.processDefinitionId];
        const fetchProcessDefinition = () => this.workflowService.get(`/workflow/processdefinition/${task.processDefinitionId}`);

        if (isUndefined(process)) {
          process = { fetchProcessDefinition };
        }

        // Use $set to maintain reactivity
        this.$set(taskGroup, id, { name, task, process });
      });
    },
    loadTasks(options = { groupName: 'availableTasks' }) {
      return this.workflowService.get('/endpoint/gettasksview', {
        params: this.getTaskParams(this.userId, options.groupName),
      }).then((response) => {
        this.toTasks(this.getTaskGroup(options.groupName), response);
      });
    },
    loadData() {
      this.loadProcesses() // Need to load processes first so process definitions are available to tasks when loaded
        .then(() => axios.all([this.loadTasks({ groupName: 'assignedTasks' }), this.loadTasks({ groupName: 'availableTasks' })]))
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.workflow.taskLoadError'));
        });
    },
  },
};
</script>
