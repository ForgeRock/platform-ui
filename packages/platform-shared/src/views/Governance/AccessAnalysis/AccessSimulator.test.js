/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import AccessSimulator from './AccessSimulator';
import i18n from '@/i18n';

jest.mock('./SimulatorDetail', () => ({
  name: 'FrSimulatorDetail',
  props: ['simulationType', 'getScopeList', 'getScopeById'],
  emits: ['back'],
  template: '<div><button @click="$emit(\'back\')">back</button></div>',
}));

describe('AccessSimulator', () => {
  let wrapper;

  const app = createAppContainer();
  function mountComponent({ adminUser = false } = {}) {
    const idmRoles = adminUser ? ['internal/role/openidm-admin'] : [];
    const idmUIAdminRoles = adminUser ? ['internal/role/openidm-admin'] : [];
    setupTestPinia({ user: { idmRoles, idmUIAdminRoles } });
    wrapper = mount(AccessSimulator, {
      attachTo: app,
      global: {
        plugins: [i18n],
      },
    });
    return wrapper;
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders only the role cards for a non-admin user', () => {
    wrapper = mountComponent();
    expect(wrapper.find('[data-testid="simulator-card-addRole"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="simulator-card-removeRole"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="simulator-card-addScope"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="simulator-card-removeScope"]').exists()).toBe(false);
  });

  it('renders the role and scope cards for an admin user', () => {
    wrapper = mountComponent({ adminUser: true });
    expect(wrapper.find('[data-testid="simulator-card-addRole"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="simulator-card-removeRole"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="simulator-card-addScope"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="simulator-card-removeScope"]').exists()).toBe(true);
  });

  it('renders a blue "Simulate" link with an arrow icon on every card', () => {
    wrapper = mountComponent();
    const simulateText = i18n.global.t('governance.accessAnalysis.simulator.simulate');
    ['simulator-card-addRole', 'simulator-card-removeRole'].forEach((testId) => {
      const card = wrapper.find(`[data-testid="${testId}"]`);
      expect(card.text()).toContain(simulateText);
      expect(card.find('.color-blue.hover-underline').exists()).toBe(true);
      expect(card.attributes('role')).toBe('button');
      expect(card.attributes('tabindex')).toBe('0');
    });
  });

  it('opens the simulator detail when a card is clicked', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="simulator-card-addRole"]').trigger('click');
    const detail = wrapper.findComponent({ name: 'FrSimulatorDetail' });
    expect(detail.exists()).toBe(true);
    expect(detail.props('simulationType')).toBe('addRole');
  });

  it('opens the simulator detail on keyboard enter', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="simulator-card-removeRole"]').trigger('keydown.enter');
    const detail = wrapper.findComponent({ name: 'FrSimulatorDetail' });
    expect(detail.exists()).toBe(true);
    expect(detail.props('simulationType')).toBe('removeRole');
  });

  it('opens the simulator detail on keyboard space', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="simulator-card-removeRole"]').trigger('keydown.space');
    const detail = wrapper.findComponent({ name: 'FrSimulatorDetail' });
    expect(detail.exists()).toBe(true);
    expect(detail.props('simulationType')).toBe('removeRole');
  });

  it('returns to the card grid when the simulator detail emits back', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="simulator-card-addRole"]').trigger('click');
    expect(wrapper.findComponent({ name: 'FrSimulatorDetail' }).exists()).toBe(true);

    await wrapper.findComponent({ name: 'FrSimulatorDetail' }).vm.$emit('back');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'FrSimulatorDetail' }).exists()).toBe(false);
    expect(wrapper.find('[data-testid="simulator-card-addRole"]').exists()).toBe(true);
  });

  it('passes accessibility checks', async () => {
    wrapper = mountComponent();
    await runA11yTest(wrapper);
  });
});
