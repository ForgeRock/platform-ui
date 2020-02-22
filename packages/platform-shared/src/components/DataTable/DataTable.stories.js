/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const basicTemplate = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Data Table</h1>
    <p class="mb-4 lead">Data Tables are an enhanced version of a basic table and are used to display tabular data.</p>
  </div>
  Example using Basic Data Table
  <FrTable
    :items="itemsD"
    :fields="fields"
    :pagination="pagination"
    :initial-per-page="initialPerPage"
    :initial-page="initialPage"
    @row-clicked="clicked"
    >
  </FrTable> 
</div>`;

const toolbarDropdownTemplate = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Data Table</h1>
    <p class="mb-4 lead">Data Tables are an enhanced version of a basic table and are used to display tabular data.</p>
  </div>
  Example using toolbar and dropdown
    <FrTable
    :items="itemsD"
    :fields="fields"
    :pagination="pagination"
    :initial-per-page="initialPerPage"
    :responsive="true"
    :initial-page="initialPage"
    @row-clicked="clicked"
    >
    <div slot="toolbar" class="btn-toolbar justify-content-between">
      <BButton
      type="button"
      variant="primary"
      class="float-left">
        <i class="material-icons-outlined">
          add
        </i> New User
      </BButton>
      <BButton
      type="button"
      variant="outline-primary"
      class="float-left">
        <i class="material-icons-outlined">
          add
        </i> New Option
      </BButton>
    </div>
  </FrTable>
</div>`;

const toolbarCheckboxTemplate = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Data Table</h1>
    <p class="mb-4 lead">Data Tables are an enhanced version of a basic table and are used to display tabular data.</p>
  </div>
  Example using toolbar and checkboxes
    <FrTable
    :items="items"
    :fields="fields"
    :pagination="pagination"
    :initial-per-page="initialPerPage"
    :responsive="true"
    :initial-page="initialPage"
    @update-selected="updateSelected"
    >
    <div slot="toolbar" class="btn-toolbar justify-content-between">
      <div>
        <BButton
        type="button"
        variant="primary"
        class="float-left mr-1">
          <i class="material-icons-outlined">
            add
          </i> New User
        </BButton>
        <BButton
        v-if="deleteVisible"
        type="button"
        variant="outline-primary"
        class="float-left">
          <i class="material-icons-outlined">
            delete
          </i> Delete
        </BButton>
      </div>
      <BButton
      type="button"
      variant="outline-primary"
      class="float-left">
        <i class="material-icons-outlined">
          add
        </i> New Option
      </BButton>
    </div>
  </FrTable>
</div>`;

const slotExampleTemplate = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Data Table</h1>
    <p class="mb-4 lead">Data Tables are an enhanced version of a basic table and are used to display tabular data.</p>
  </div>
  Example using custom cell slots
  <FrTable
    :items="items"
    :fields="fields"
    :pagination="pagination"
    :initial-per-page="initialPerPage"
    :initial-page="initialPage"
    >
    <template v-slot:cell(avatar)=data > 
      <div class="media">
        <img src="img/avatar.f75f91dd.png" alt="Carl Smith" width="44" height="44" class="mr-4 align-self-center rounded-circle">
        <div class="media-body">
          <h5 class="mb-0">{{data.item.avatar.fullName}}</h5>
          <span class="text-muted">{{data.item.avatar.userName}}</span>
        </div>
      </div>
    </template>
  </FrTable> 
</div>`;

/* eslint-disable import/first */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  withKnobs, boolean, number, object,
} from '@storybook/addon-knobs';
import { BButton, BPagination } from 'bootstrap-vue';
import itemData from './DataTable.data';
import DataTable from './index';

const stories = storiesOf('Components|Data Table', module).addParameters({ component: DataTable });
stories.addDecorator(withKnobs);

const helpers = {
  addDropdown(items) {
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
  },
  parseUserWithAvatarTable(users) {
    return users.map((user) => ({
      avatar: {
        fullName: `${user.first_name} ${user.last_name}`,
        userName: user.user_name,
      },
      email: user.email,
      status: user.status,
    }));
  },
};

stories.add('Basic', () => ({
  template: basicTemplate,
  components: {
    FrTable: DataTable,
    BButton,
    BPagination,
  },
  props: {
    // Array of objects that will compose the table. Each object is a row.
    items: {
      type: Array,
      default: object('items', itemData.usersSimple.items),
    },
    // Object that identifies column order and column name.
    fields: {
      type: Array,
      default: object('fields', []),
    },
    initialPerPage: {
      type: Number,
      default: number('initialPerPage', 3),
    },
    initialPage: {
      type: Number,
      default: number('initialPage', 1),
    },
    pagination: {
      type: Boolean,
      default: boolean('pagination', true),
    },
  },
  data() {
    return {
      itemsD: this.items,
    };
  },
  methods: {
    clicked(item, index) {
      const selectedItem = { ...item, _rowVariant: 'primary' };
      const newItems = [...itemData.usersSimple.items];
      newItems.splice(index, 1, selectedItem);
      this.itemsD = newItems;
    },
  },
}));

stories.add('Toolbar and dropdown', () => ({
  template: toolbarDropdownTemplate,
  components: {
    FrTable: DataTable,
    BButton,
    BPagination,
  },
  props: {
    items: {
      type: Array,
      default: object('items', helpers.addDropdown(itemData.users.items)),
    },
    fields: {
      type: Array,
      default: object('fields', [
        'user_name',
        'email',
        'status',
        'dropdown',
      ]),
    },
    initialPerPage: {
      type: Number,
      default: number('initialPerPage', 3),
    },
    initialPage: {
      type: Number,
      default: number('initialPage', 1),
    },
    pagination: {
      type: Boolean,
      default: boolean('pagination', true),
    },
  },
  data() {
    return {
      itemsD: this.items,
    };
  },
  methods: {
    clicked(item, index) {
      const selectedItem = { ...item, _rowVariant: 'primary' };
      const newItems = [...itemData.users.items];
      newItems.splice(index, 1, selectedItem);
      this.itemsD = newItems;
    },
  },
}));

stories.add('Toolbar and checkbox', () => ({
  template: toolbarCheckboxTemplate,
  components: {
    FrTable: DataTable,
    BButton,
    BPagination,
  },
  props: {
    items: {
      type: Array,
      default: object('items', helpers.addDropdown(itemData.users.items)),
    },
    fields: {
      type: Array,
      default: object('fields', [
        'checkbox',
        'user_name',
        'email',
        'status',
      ]),
    },
    initialPerPage: {
      type: Number,
      default: number('initialPerPage', 3),
    },
    initialPage: {
      type: Number,
      default: number('initialPage', 1),
    },
    pagination: {
      type: Boolean,
      default: boolean('pagination', true),
    },
  },
  data() {
    return {
      deleteVisible: false,
    };
  },
  methods: {
    updateSelected(selected) {
      this.deleteVisible = selected.length !== 0;
    },
  },
}));

stories.add('Custom cells', () => ({
  template: slotExampleTemplate,
  components: {
    FrTable: DataTable,
    BButton,
    BPagination,
  },
  props: {
    items: {
      type: Array,
      default: object('items',
        helpers.addDropdown(
          helpers.parseUserWithAvatarTable(itemData.users.items),
        )),
    },
    fields: {
      type: Array,
      default: object('fields', [
        { key: 'avatar', label: 'User' },
        'email',
        'status',
        { key: 'dropdown', label: 'Options' },
      ]),
    },
    initialPerPage: {
      type: Number,
      default: number('initialPerPage', 3),
    },
    initialPage: {
      type: Number,
      default: number('initialPage', 1),
    },
    pagination: {
      type: Boolean,
      default: boolean('pagination', true),
    },
  },
}));
