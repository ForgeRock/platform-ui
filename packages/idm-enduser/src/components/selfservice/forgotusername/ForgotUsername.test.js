/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import ForgotUsername from './ForgotUsername';
import useSelfService from '@/composables/selfService';

jest.mock('@/composables/selfService');

describe('ForgotUsername', () => {
  let mockLoad;
  let mockAdvance;
  let wrapper;
  let selfServiceDetails;

  beforeEach(() => {
    mockLoad = jest.fn();
    mockAdvance = jest.fn();
    selfServiceDetails = { value: null };

    useSelfService.mockReturnValue({
      loadSelfServiceData: mockLoad,
      advanceSelfServiceStage: mockAdvance,
      selfServiceDetails,
    });

    wrapper = mount(ForgotUsername, {
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

  it('calls loadSelfServiceData on mount', () => {
    expect(mockLoad).toHaveBeenCalledWith('username');
  });

  it('Renders GenericSelfService if type is unknown', async () => {
    selfServiceDetails.value = { type: 'SomeUnknownType' };
    await wrapper.vm.loadStageEmitter();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('genericselfservice').exists()).toBe(true);
  });
});
