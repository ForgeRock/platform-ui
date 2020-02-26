/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import SideMenu from './index';

describe('SideMenu Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(SideMenu, {
      mocks: {
        $t: () => {},
      },
      stubs: {
        'router-link': true,
        RouterLink: true,
      },
      propsData: {
        menuItems: [
          {
            columns: 'testColumns',
            displayName: 'test',
            icon: 'testIcon',
            order: 'testOrder',
            routeName: 'ListResource',
            resourceType: 'testType',
          },
          {
            displayName: 'Local Route Item',
            icon: '',
            routeName: 'Local Route',
          },
          {
            displayName: 'External URL Item',
            icon: '',
            url: 'http://example.com',
          },
        ],
      },
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.name()).toEqual('SideMenu');
  });

  it('Component takes in menu items', () => {
    expect(wrapper.vm.menuItems[0].displayName).toEqual('test');
  });

  it('Menu item accepts Vue Router "routeName"', () => {
    const sidebarNavRouter = wrapper.find('.fr-sidebar-menuitems > li:nth-child(2) > routerlink-stub');
    expect(sidebarNavRouter.exists()).toEqual(true);
  });

  it('Menu item accepts external URL', () => {
    // const sidebarNavUrl = wrapper.find('.fr-sidebar-menuitems > li:nth-child(3) > a');
    const sidebarNavUrl = wrapper.find('.fr-sidebar-menuitems > li:nth-child(3)');
    expect(sidebarNavUrl.exists()).toEqual(true);
  });
});
