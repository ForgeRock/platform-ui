<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

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
import compileTemplateToRender from '@forgerock/platform-shared/src/utils/compileDynamicTemplate';
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
      default: () => ({}),
    },
  },
  data() {
    return {
      loadingColor: styles.baseColor,
      startForm: undefined,
    };
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
    async loadstartForm() {
      if (!this.processDefinition || !this.processDefinition.formGenerationTemplate) {
        return null;
      }

      try { // executing dynamic code, so wrap in try/catch
        const initializeForm = Function(`return ${this.processDefinition.formGenerationTemplate}`); // eslint-disable-line
        const form = initializeForm();

        if (!form || !form.template) {
          return null;
        }

        const { template, ...formWithoutTemplate } = form;
        const render = await compileTemplateToRender(template);

        return {
          ...formWithoutTemplate,
          render,
        };
      } catch (e) {
        return null;
      }
    },
  },
  watch: {
    processDefinition: {
      handler() {
        if (!this.startForm) {
          this.loadstartForm().then((form) => {
            if (form) {
              this.startForm = form;
            }
          });
        }
      },
      immediate: true,
    },
  },
};
</script>
