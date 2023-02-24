/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import AssignTask from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

describe('AssignTask.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(AssignTask, {
      localVue,
      propsData: {
        taskDefinition: {
          task: {
            _id: 123,
            usersToAssign: [
              {
                username: 'John90210',
                displayableName: 'John',
              },
            ],
            variables: {
              123: 'myVariables',
            },
          },
        },
        shown: false,
      },
      mocks: {
        $t: (key) => (key),
      },
      store: new Vuex.Store({
        state: {
          UserStore: {
            userId: 'userId',
            userName: 'myUsername',
          },
        },
      }),
    });
  });

  it('AssignTask successfully loaded', () => {
    expect(wrapper.name()).toEqual('AssignTask');
  });

  it('Emits assignTask object', () => {
    wrapper.vm.assignTask();
    expect(wrapper.emitted().assignTask).toEqual([[{
      id: 123,
      assignee: 'userId',
    }]]);
  });

  it('Generates Display Details', () => {
    const taskVariables = {
      123: 'myVariables',
    };
    const formProperties = [{
      _id: 123,
      name: 'myPropertyName',
    }];

    expect(wrapper.vm.generateDisplayDetails(formProperties, taskVariables)).toEqual([{
      _id: formProperties[0]._id,
      name: formProperties[0].name,
      value: taskVariables['123'],
    }]);
  });

  describe('Generates assignee options', () => {
    it('returns options if taskDefinition.task.usersToAssign prop present', () => {
      expect(wrapper.vm.assigneeOptions).toEqual([{
        value: 'John90210',
        text: 'John',
      }]);
    });

    it('returns options if taskDefinition.task.usersToAssign IS NOT present', () => {
      wrapper.setProps({
        taskDefinition: {
          task: {
            usersToAssign: [],
          },
        },
      });
      expect(wrapper.vm.assigneeOptions).toEqual([{
        value: 'myUsername',
        text: 'pages.workflow.me',
      }]);
    });
  });
});
