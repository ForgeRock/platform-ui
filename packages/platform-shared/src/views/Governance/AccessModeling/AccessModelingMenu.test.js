/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import AccessModelingMenu from './AccessModelingMenu';
import i18n from '@/i18n';

describe('AccessModelingMenu', () => {
  let wrapper;
  let routerPush;

  const app = createAppContainer();
  function mountComponent() {
    ({ routerPush } = mockRouter());
    wrapper = mount(AccessModelingMenu, {
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

  it('renders the active hub cards, hiding only the coming soon cards', () => {
    wrapper = mountComponent();
    expect(wrapper.find('[data-testid="hub-card-accessModeling"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="hub-card-accessAnalyzer"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="hub-card-userPopulation"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="hub-card-cloneUser"]').exists()).toBe(false);
  });

  it('renders card titles and descriptions', () => {
    wrapper = mountComponent();
    const text = wrapper.text();
    expect(text).toContain(i18n.global.t('governance.accessModeling.hub.accessModelingCard.title'));
    expect(text).toContain(i18n.global.t('governance.accessModeling.hub.accessAnalyzerCard.title'));
    expect(text).toContain(i18n.global.t('governance.accessModeling.hub.userPopulationCard.title'));
    expect(text).toContain(i18n.global.t('governance.accessModeling.hub.accessModelingCard.description'));
    expect(text).toContain(i18n.global.t('governance.accessModeling.hub.accessAnalyzerCard.description'));
    expect(text).toContain(i18n.global.t('governance.accessModeling.hub.userPopulationCard.description'));
  });

  it('navigates to the roles list when the access modeling card is clicked', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="hub-card-accessModeling"]').trigger('click');
    expect(routerPush).toHaveBeenCalledWith({ name: 'AccessModeling' });
  });

  it('navigates to the access analyzer when the analyzer card is clicked', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="hub-card-accessAnalyzer"]').trigger('click');
    expect(routerPush).toHaveBeenCalledWith({ name: 'AccessModelingAnalysis' });
  });

  it('navigates to the population-based role mining sessions list when the user population card is clicked', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="hub-card-userPopulation"]').trigger('click');
    expect(routerPush).toHaveBeenCalledWith({ name: 'PopulationRoleMiningSessions' });
  });

  it('does not have a "coming soon" badge on the user population card now that it is active', () => {
    wrapper = mountComponent();
    const card = wrapper.find('[data-testid="hub-card-userPopulation"]');
    expect(card.text()).not.toContain(i18n.global.t('governance.accessModeling.hub.comingSoon'));
  });

  it('navigates on keyboard enter for enabled cards', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="hub-card-accessModeling"]').trigger('keydown.enter');
    expect(routerPush).toHaveBeenCalledWith({ name: 'AccessModeling' });
  });

  it('navigates on keyboard space for enabled cards', async () => {
    wrapper = mountComponent();
    await wrapper.find('[data-testid="hub-card-accessModeling"]').trigger('keydown.space');
    expect(routerPush).toHaveBeenCalledWith({ name: 'AccessModeling' });
  });

  it('renders a blue "Get started" link on each active card', () => {
    wrapper = mountComponent();
    const getStartedText = i18n.global.t('governance.accessModeling.hub.getStarted');

    ['hub-card-accessModeling', 'hub-card-accessAnalyzer', 'hub-card-userPopulation'].forEach((testId) => {
      const card = wrapper.find(`[data-testid="${testId}"]`);
      expect(card.text()).toContain(getStartedText);
      expect(card.find('.color-blue.hover-underline').exists()).toBe(true);
    });
  });

  it('passes accessibility checks', async () => {
    wrapper = mountComponent();
    await runA11yTest(wrapper);
  });
});
