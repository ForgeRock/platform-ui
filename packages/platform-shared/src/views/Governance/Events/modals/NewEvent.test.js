/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import NewEvent from './NewEvent';

let wrapper;

function setup(options) {
  wrapper = mount(NewEvent, {
    global: {
      mocks: {
        $t: (t) => t,
        ...options,
      },
    },
  });
}
describe('NewEventModal', () => {
  beforeEach(() => {
    setup();
  });

  it('should corretly set initial component data', () => {
    expect(wrapper.vm.currentStep).toBe(0);
    expect(wrapper.vm.selectedAction).toBeNull();
    expect(wrapper.vm.selectedEvent).toBeNull();
    expect(wrapper.vm.nextDisabled).toBe(true);
  });

  it('should update the state correctly when nextStep and previousStep are called', async () => {
    await wrapper.vm.nextStep();
    expect(wrapper.vm.currentStep).toBe(1);

    await wrapper.vm.previousStep();
    expect(wrapper.vm.currentStep).toBe(0);
  });

  it('should handle the user selecting an event or action', async () => {
    wrapper.vm.selectedEvent = 'userCreated';
    expect(wrapper.vm.nextDisabled).toBe(false);

    await wrapper.vm.nextStep();
    expect(wrapper.vm.currentStep).toBe(1);
    expect(wrapper.vm.nextDisabled).toBe(true);

    wrapper.vm.selectedAction = 'certification';
    expect(wrapper.vm.nextDisabled).toBe(false);
  });
});
