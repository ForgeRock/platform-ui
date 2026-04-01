/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import RunPublishedTemplateModal from './index';

let wrapper;
function mountComponent() {
  wrapper = mount(RunPublishedTemplateModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
  });
}
describe('RunPublishedTemplateModal', () => {
  describe('run-action', () => {
    it('should emit the run-action event if the user click on the button for that', async () => {
      mountComponent();
      await wrapper.setData({ isTesting: true });

      const button = wrapper.find('[data-testid="run-action"]');
      button.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('run-published-template');
    });
  });
});
