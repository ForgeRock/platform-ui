/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createRouter, createWebHistory, RouterLink } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import App from '@/App';
import { routes } from '@/router';

// Added due the incompatibility of vue router with vue 3 in compat mode 2
RouterLink.compatConfig = { MODE: 2 };

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    media: query,
    addListener: jest.fn(),
    addEventListener: jest.fn(),
  })),
});

describe('App.vue', () => {
  async function setup() {
    const router = createRouter({
      history: createWebHistory(),
      routes,
    });
    router.push('/');
    await router.isReady();

    const store = createStore({
      state: {},
    });

    const pinia = createTestingPinia();

    return mount(App, {
      global: {
        plugins: [i18n, store, router, pinia, notifications],
      },
    });
  }

  it('should load enduser layout correctly', async () => {
    const wrapper = await setup();

    const layout = wrapper.findComponent({ name: 'Layout' });
    expect(layout.exists()).toBe(true);
  });

  it('should load menu items correctly', async () => {
    const wrapper = await setup();

    const sideMenu = wrapper.findComponent({ name: 'SideMenu' });
    const menuItems = sideMenu.findAllComponents({ name: 'MenuItem' });

    expect(menuItems.length).toBe(1);
    expect(menuItems[0].text()).toBe('dashboardDashboard');
  });
});
