/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import PasswordReset from './PasswordReset';
import useSelfService from '@/composables/selfService';

jest.mock('@/composables/selfService');
jest.mock('./ResetStage', () => ({
  name: 'FrResetStage',
  template: '<div class="reset-stage-mock">Reset Stage Mock</div>',
}));

jest.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
}));

describe('Password Reset', () => {
  let mockLoad;
  let mockAdvance;
  let wrapper;

  beforeEach(() => {
    mockLoad = jest.fn();
    mockAdvance = jest.fn();
    useSelfService.mockReturnValue({
      loadSelfServiceData: mockLoad,
      advanceSelfServiceStage: mockAdvance,
      selfServiceDetails: { value: null },
    });

    wrapper = mount(PasswordReset, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
    });
  });

  it('Renders spinner initially', () => {
    expect(wrapper.findComponent(FrSpinner).exists()).toBe(true);
  });

  it('Renders FrResetStage component if type is ResetStage', async () => {
    wrapper.vm.selfServiceType = { name: 'FrResetStage' };
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'FrResetStage' }).exists()).toBe(true);
  });

  it('calls loadSelfServiceData on mount', () => {
    expect(mockLoad).toHaveBeenCalledWith('reset', expect.any(Function));
  });
});
