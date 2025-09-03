/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import ViolationEdit from '@forgerock/platform-shared/src/components/governance/Violations/ViolationEdit/ViolationEdit';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import i18n from '@/i18n';
import ViolationEditView from './ViolationEdit';

const { routerPush } = mockRouter({ params: { itemType: 'violation' } });

describe('ViolationEdit', () => {
  setupTestPinia();
  function setup() {
    return mount(ViolationEditView, {
      global: {
        plugins: [i18n],
        stubs: { ViolationEdit: true },
      },
    });
  }

  it('should redirect to remediate violation view when the event is emmited', async () => {
    const wrapper = setup();

    const violationEditComponent = wrapper.findComponent(ViolationEdit);
    violationEditComponent.vm.$emit('revoke-violation', { id: '12345' });
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({
      name: 'ViolationEditRemediate',
      params: {
        itemType: 'violation',
        violationId: '12345',
      },
    });
  });
});
