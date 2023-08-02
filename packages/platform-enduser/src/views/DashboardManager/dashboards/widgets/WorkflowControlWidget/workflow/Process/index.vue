<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Transition
    name="fade"
    mode="out-in"
    duration="250">
    <Component
      v-if="processDefinition !== null && startForm !== null"
      :is="startForm"
      @submit="submit"
      @cancel="cancel"
      :process-definition="processDefinition"
      ref="startFormComponent"
      :is-task="task" />
    <GenericProcess
      v-else-if="processDefinition !== null"
      @submit="submit"
      @cancel="cancel"
      :id="processDefinition._id"
      :workflow-details="processDefinition.formProperties"
      ref="startFormComponent" />
    <ClipLoader
      v-else
      class="m-auto"
      :color="loadingColor" />
  </Transition>
</template>

<script>
import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min';
import styles from '@forgerock/platform-shared/src/scss/main.scss';
import GenericProcess from '../GenericProcess';

/**
* @description Dashboard widget that displays the details of a specific process
*
* */
export default {
  name: 'Process',
  components: {
    ClipLoader,
    GenericProcess,
  },
  props: {
    processDefinition: {
      type: [Object, null],
      default: () => null,
    },
    task: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loadingColor: styles.baseColor,
    };
  },
  computed: {
    startForm() {
      let initializeForm;
      // Fallback to generic component when no provided JS
      if (this.processDefinition.formGenerationTemplate) {
        initializeForm = Function(`return ${this.processDefinition.formGenerationTemplate}`); // eslint-disable-line
        return initializeForm();
      }

      return null;
    },
  },
  methods: {
    cancel() {
      this.reset();
      this.$emit('cancel', this.processDefinition._id);
    },
    reset() {
      this.$refs.startFormComponent.resetForm();
    },
    submit(payload) {
      this.$emit('startProcess', payload);
    },
  },
};
</script>
