/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import itemData from './DataTable.data';

import DataTable from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const emptyData = {
  items: [],
  fields: [],
  initialPerPage: 5,
  initialPage: 1,
  pagination: true,
};

describe('DataTable Component', () => {
  it('DataTable successfully loaded', () => {
    const wrapper = shallowMount(DataTable, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...emptyData,
      },
    });

    expect(wrapper.name()).toEqual('DataTable');
  });

  it('DataTable renders basic elements: Optional Toolbar Slot', () => {
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      slots: {
        toolbar: '<div class="toolbar">simple toolbar</div>',
      },
      propsData: {
        ...emptyData,
      },
    });

    const toolbarEl = wrapper.find('.fr-datatable .toolbar');

    expect(toolbarEl.exists()).toBe(true);
  });

  it('DataTable renders basic elements: Column Heading', () => {
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...emptyData,
        items: [...itemData.usersSimple.items],
      },
    });

    const colHeaders = wrapper.findAll('.fr-datatable .b-table thead th');

    expect(colHeaders.at(0).text()).toEqual('Age');
    expect(colHeaders.at(1).text()).toEqual('First Name');
    expect(colHeaders.at(2).text()).toEqual('Last Name');
  });

  it('DataTable renders basic elements: Pagination', () => {
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...emptyData,
        items: [...itemData.test.items],
        initialPerPage: 1,
      },
    });

    const paginationEl = () => wrapper.findAll('.pagination .page-item i');
    const firstPage = () => paginationEl().at(0);
    const chevronLeft = () => paginationEl().at(1);
    const chevronRight = () => paginationEl().at(2);
    const lastPage = () => paginationEl().at(3);

    expect(firstPage().text()).toEqual('first_page');
    expect(chevronLeft().text()).toEqual('chevron_left');
    expect(chevronRight().text()).toEqual('chevron_right');
    expect(lastPage().text()).toEqual('last_page');

    const cellDataTableSelector = '.b-table tbody td';
    expect(wrapper.find(cellDataTableSelector).text()).toEqual('1');

    lastPage().trigger('click');
    expect(wrapper.find(cellDataTableSelector).text()).toEqual('4');

    chevronLeft().trigger('click');
    expect(wrapper.find(cellDataTableSelector).text()).toEqual('3');

    firstPage().trigger('click');
    expect(wrapper.find(cellDataTableSelector).text()).toEqual('1');

    chevronRight().trigger('click');
    expect(wrapper.find(cellDataTableSelector).text()).toEqual('2');
  });

  it('Does not render pagination control if it only has one page of data', () => {
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...emptyData,
        items: [1, 2, 3],
        initialPerPage: 5,
        pagination: true,
      },
    });

    expect(wrapper.find('.pagination').exists()).toBe(false);
  });

  it('Does not limit the number of items shown if pagination is disabled', () => {
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...emptyData,
        items: [1, 2, 3],
        initialPerPage: 1,
        pagination: false,
      },
    });

    expect(wrapper.findAll('.b-table tbody tr').length).toEqual(3);
  });

  it('DataTable dropdown cell renders and is clickable', async () => {
    function addDropdown(items) {
      return items.map((item) => ({
        ...item,
        dropdown: [
          {
            icon: 'remove_red_eye',
            text: 'visible',
            action: () => {},
          }, {
            icon: 'delete',
            text: 'delete',
            action: () => {},
          },
        ],
      }));
    }

    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      stubs: {
        transition: false,
      },
      propsData: {
        ...emptyData,
        items: addDropdown(itemData.usersSimple.items),
        fields: ['first_name', 'dropdown'],
      },
    });

    const dropdownButtons = wrapper.findAll('button.dropdown-toggle');
    expect(dropdownButtons.length).toEqual(4);

    const visibleDropdownMenu = () => wrapper.findAll('.dropdown-menu.show');
    expect(visibleDropdownMenu().length).toEqual(0);
  });

  it('DataTable renders field specified row checkboxes', async () => {
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...emptyData,
        items: [...itemData.users.items],
        fields: ['checkbox', 'user_name'],
        initialPerPage: 3,
      },
    });

    const checkboxBooleans = (wrapperArray) => wrapperArray.wrappers.map((w) => w.element.checked);

    const visibleCheckboxes = () => wrapper.findAll('div.custom-checkbox input');
    const checkboxAll = () => wrapper.find('#checkbox-all');
    const checkbox0 = () => wrapper.find('#checkbox-0');
    const checkbox1 = () => wrapper.find('#checkbox-1');
    const checkbox2 = () => wrapper.find('#checkbox-2');

    const paginationEl = () => wrapper.findAll('.pagination .page-item i');
    const previousPage = () => paginationEl().at(1);
    const nextPage = () => paginationEl().at(2);

    expect(visibleCheckboxes().length).toEqual(4);
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([false, false, false, false]);

    checkbox0().setChecked(true);
    await wrapper.vm.$nextTick();
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([false, true, false, false]);

    checkbox1().setChecked(true);
    checkbox2().setChecked(true);
    await wrapper.vm.$nextTick();
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([true, true, true, true]);

    checkbox1().setChecked(false);
    await wrapper.vm.$nextTick();
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([false, true, false, true]);

    checkboxAll().setChecked(true);
    await wrapper.vm.$nextTick();
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([true, true, true, true]);

    checkboxAll().setChecked(false);
    await wrapper.vm.$nextTick();
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([false, false, false, false]);

    checkboxAll().setChecked(true);
    await wrapper.vm.$nextTick();
    nextPage().trigger('click');
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([false, false]);

    checkbox0().setChecked(true);
    await wrapper.vm.$nextTick();
    previousPage().trigger('click');
    expect(checkboxBooleans(visibleCheckboxes())).toEqual([false, false, false, false]);
  });

  it('DataTable renders custom cell slot', () => {
    function parseUserWithAvatarTable(users) {
      return users.map((user) => ({
        avatar: {
          fullName: `${user.first_name} ${user.last_name}`,
          userName: user.user_name,
        },
        email: user.email,
        status: user.status,
      }));
    }
    const wrapper = mount(DataTable, {
      mocks: {
        $t: () => {},
      },
      attachToDocument: true,
      scopedSlots: {
        // scoped data is passed in as props by default
        'cell(avatar)': `
        <template>
          <div class="media">
            <img src="img/avatar.f75f91dd.png" width="44" height="44" class="mr-4 align-self-center rounded-circle">
            <div class="media-body">
              <h5 class="mb-0">{{props.item.avatar.fullName}}</h5>
              <span class="text-muted">{{props.item.avatar.userName}}</span>
            </div>
          </div>
        </template>`,
      },
      propsData: {
        ...emptyData,
        items: parseUserWithAvatarTable(itemData.users.items),
        fields: [],
        initialPerPage: 3,
      },
    });

    const visibleCustomAvatarCells = wrapper.findAll('div.media');
    expect(visibleCustomAvatarCells.length).toBe(3);

    const firstAvatarCell = visibleCustomAvatarCells.at(0);
    expect(firstAvatarCell.html()).toBe(''
      + '<div class="media">'
        + '<img src="img/avatar.f75f91dd.png" width="44" height="44" class="mr-4 align-self-center rounded-circle">'
        + ' <div class="media-body">'
          + '<h5 class="mb-0">Carl Smith</h5>'
          + ' <span class="text-muted">carl.smith</span>'
        + '</div>'
      + '</div>');
  });
});
