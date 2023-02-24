<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCardBody class="pt-3">
    <BRow>
      <BCol
        lg="8"
        offset-lg="1">
        <div class="form-group row">
          <label
            for="assignSelect"
            class="col-sm-2 col-form-label">
            {{ $t('pages.workflow.assignTo') }}
          </label>
          <div class="col-sm-10">
            <div class="d-flex">
              <BFormSelect
                v-model="selected"
                name="assignSelect"
                :options="assigneeOptions"
                class="mb-3 mr-2" />
              <BButton
                variant="primary"
                class="mb-3 d-flex align-self-end"
                @click="assignTask">
                {{ $t('pages.workflow.assign') }}
              </BButton>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-sm-2 col-form-label">
            {{ $t('pages.workflow.details') }}
          </div>
          <div class="col-sm-10">
            <BCard>
              <dl class="row m-0">
                <template v-for="(detail, index) in taskDetailsList">
                  <dt
                    :key="`taskname-${index}-${uniqueId}`"
                    class="col-6">
                    {{ detail.name }}
                  </dt>
                  <dd
                    :key="`taskvalue-${index}-${uniqueId}`"
                    class="col-6">
                    {{ detail.value || $t('pages.workflow.notAvailable') }}
                  </dd>
                </template>
              </dl>
            </BCard>
          </div>
        </div>
      </BCol>
    </BRow>
  </BCardBody>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { isEmpty } from 'lodash';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import axios from 'axios';

/**
* @description Dashboard widget that allows a user to assign a task
*
* */
export default {
  name: 'AssignTask',
  props: {
    taskDefinition: {
      type: Object,
      default: () => {},
    },
    shown: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      taskDetailsList: [],
      selected: this.$store.state.UserStore.userName,
      uniqueId: null,
    };
  },
  mounted() {
    this.uniqueId = this._uid;
  },
  computed: {
    assigneeOptions() {
      const loggedUserName = this.$store.state.UserStore.userName;

      if (!isEmpty(this.taskDefinition.task.usersToAssign)) {
        return this.taskDefinition.task.usersToAssign.map(({ username, displayableName }) => {
          const value = username;
          const text = username === loggedUserName ? this.$t('pages.workflow.me') : displayableName;
          return { value, text };
        });
      }
      return [{ value: loggedUserName, text: this.$t('pages.workflow.me') }];
    },
  },
  methods: {
    assignTask() {
      this.$emit('assignTask', { id: this.taskDefinition.task._id, assignee: this.$store.state.UserStore.userId });
    },
    generateDisplayDetails(formProperties, variables) {
      return formProperties.reduce((acc, property) => acc.concat({ _id: property._id, name: property.name, value: variables[property._id] }), []);
    },
  },
  watch: {
    shown(val) {
      if (val
                && (this.taskDefinition.process.processDefinition === null || this.taskDefinition.process.processDefinition === undefined)
                && this.taskDetailsList.length === 0) {
        const workflowInstance = axios.create({
          baseURL: getFQDN(process.env.VUE_APP_IDM_URL),
          timeout: 15000,
          headers: {},
        });
        workflowInstance.get(`/workflow/processdefinition/${this.taskDefinition.task.processDefinitionId}`).then((processDetails) => {
          this.taskDetailsList = this.generateDisplayDetails(processDetails.data.formProperties, this.taskDefinition.task.variables);
        });
      } else if (this.taskDetailsList.length === 0) {
        this.taskDetailsList = this.generateDisplayDetails(this.taskDefinition.process.processDefinition.formProperties, this.taskDefinition.task.variables);
      }
    },
  },
};
</script>
