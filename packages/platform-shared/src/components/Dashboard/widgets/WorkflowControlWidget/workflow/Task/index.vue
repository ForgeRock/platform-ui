<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Transition
    name="fade"
    mode="out-in"
    duration="250">
    <Component
      v-if="processDefinition !== null && taskForm !== null"
      :is="taskForm"
      @submit="submit"
      @cancel="cancel"
      :process-definition="processDefinition"
      :task-definition="taskInstance.task"
      :variables="taskInstance.task.variables" />
    <GenericTask
      v-else-if="processDefinition !== null"
      :variables="taskInstance.task.variables"
      :task-fields="taskInstance.task.taskDefinition.formProperties"
      :process-fields="taskInstance.task.formProperties"
      @submit="submit"
      @cancel="cancel" />
    <ClipLoader
      v-else
      class="m-auto"
      :color="loadingColor" />
  </Transition>
</template>

<script>
import styles from '@forgerock/platform-shared/src/scss/main.scss';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import axios from 'axios';
import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min';
import GenericTask from '../GenericTask';

/**
* @description Dashboard widget that displays the specific details of a task
*
* */
export default {
  name: 'Task',
  props: {
    taskInstance: {
      type: Object,
      default: () => {},
    },
    shown: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let temporaryProcessInstance = null;

    if (this.taskInstance.process && this.taskInstance.process.processDefinition) {
      temporaryProcessInstance = this.taskInstance.process.processDefinition;
    }

    return {
      loadingColor: styles.baseColor,
      processDefinition: temporaryProcessInstance,
      task: null,
      variables: null,
    };
  },
  components: {
    GenericTask,
    ClipLoader,
  },
  computed: {
    taskForm() {
      const { formGenerationTemplate } = this.taskInstance.task.taskDefinition;
      const initializeForm = formGenerationTemplate ? Function(`return ${formGenerationTemplate}`) : null // eslint-disable-line

      if (initializeForm !== null) {
        return initializeForm();
      }
      return null;
    },
  },
  methods: {
    submit(formData) {
      this.$emit('completeTask', { id: this.taskInstance.task._id, formData });
    },
    cancel() {
      this.$emit('cancel', this.taskInstance.task._id);
    },
  },
  watch: {
    shown(val) {
      if (val && this.processDefinition === null) {
        const workflowInstance = axios.create({
          baseURL: getFQDN(process.env.VUE_APP_IDM_URL),
          headers: {},
        });
        workflowInstance.get(`/workflow/processdefinition/${this.taskInstance.task.processDefinitionId}`).then((processDetails) => {
          this.processDefinition = processDetails.data;
        });
      }
    },
  },
};
</script>
