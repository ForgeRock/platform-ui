<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
            Details
          </div>
          <div class="col-sm-10">
            <BCard>
              <dl class="row m-0">
                <template v-for="(detail, index) in taskDetails">
                  <dt
                    :key="`taskname-${index}`"
                    class="col-6">
                    {{ detail.name }}
                  </dt>
                  <dd
                    :key="`taskvalue-${index}`"
                    class="col-6">
                    {{ detail.value }}
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
  },
  data() {
    return {
      workflowService: null,
      selected: this.$store.UserStore.state.userName,
    };
  },
  computed: {
    process() {
      return this.taskDefinition.process;
    },
    processDefinition() {
      if (this.process.processDefinition === null) {
        this.$emit('loadProcess', this.process);
      }
      return this.process.processDefinition;
    },
    formProperties() {
      if (this.processDefinition && this.processDefinition.formProperties) {
        return this.processDefinition.formProperties;
      }
      return [];
    },
    task() {
      return this.taskDefinition.task;
    },
    id() {
      return this.task._id;
    },
    taskDetails() {
      if (this.formProperties) {
        // TODO Destructure or just imrpove the readability of this line
        return this.formProperties.reduce((acc, property) => acc.concat({ _id: property._id, name: property.name, value: this.task.variables[property._id] }), []);
      }
      return [];
    },
    assigneeOptions() {
      const loggedUserName = this.$root.userStore.state.userName;

      if (!isEmpty(this.task.usersToAssign)) {
        return this.task.usersToAssign.map(({ username, displayableName }) => {
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
      this.$emit('assignTask', { id: this.id, assignee: this.selected });
    },
  },
};
</script>
