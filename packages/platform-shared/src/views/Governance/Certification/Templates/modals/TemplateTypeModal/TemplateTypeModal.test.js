/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import TemplateTypeModal from './index';

describe('TemplateTypeModal', () => {
  setupTestPinia();
  const wrapper = shallowMount(TemplateTypeModal, {
    global: {
      mocks: {
        $t: (t) => t,
        $router: { push: jest.fn() },
      },
    },
  });
  describe('nextStep', () => {
    it('should run the router push to redirect to the template wizard', () => {
      const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
      wrapper.vm.nextStep();
      expect(routerPushSpy).toHaveBeenCalled();
    });
  });
});
