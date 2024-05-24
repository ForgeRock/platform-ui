/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ViolationEdit from '@forgerock/platform-shared/src/components/governance/Violations/ViolationEdit/ViolationEdit';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import i18n from '@/i18n';
import ViolationEditView from './ViolationEdit';
import router from '@/router';

describe('ViolationEdit', () => {
  setupTestPinia();
  function setup() {
    return mount(ViolationEditView, {
      global: {
        plugins: [i18n, router],
        stubs: { ViolationEdit: true },
      },
    });
  }

  it('should redirect to remediate violation view when the event is emmited', async () => {
    const wrapper = setup();

    const routerPushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});
    const violationEditComponent = wrapper.findComponent(ViolationEdit);
    violationEditComponent.vm.$emit('revoke-violation', { id: '12345' });
    await flushPromises();

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'ViolationEditRemediate',
      params: {
        itemType: 'violation',
        violationId: '12345',
      },
    });
  });
});
