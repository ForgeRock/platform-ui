/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import {
  BCard, BButton,
} from 'bootstrap-vue';
import QueryFilterBuilder from './index';

export default {
  title: 'Components|Query Filter Builder',
};

export const QueryFilterStory = () => ({
  component: QueryFilterBuilder,
  title: 'Components|Query Filter Builder',
  data() {
    return {
      queryFilterString: '',
    };
  },
  methods: {
    onChange(data) {
      this.queryFilterString = data;
    },
    clearQueryFilterString() {
      this.queryFilterString = '';
    },
  },
  render() {
    const properties = [
      {
        label: 'Username',
        value: 'userName',
        type: 'string',
      },
      {
        label: 'Age',
        value: 'age',
        type: 'number',
      },
      {
        label: 'First Name',
        value: 'givenName',
        type: 'string',
      },
      {
        label: 'Last Name',
        value: 'sn',
        type: 'string',
      },
      {
        label: 'Email Address',
        value: 'mail',
        type: 'string',
      },
      {
        label: 'Description',
        value: 'description',
        type: 'string',
      },
      {
        label: 'Status',
        value: 'accountStatus',
        type: 'string',
      },
      {
        label: 'Telephone Number',
        value: 'telephoneNumber',
        type: 'string',
      },
      {
        label: 'Address 1',
        value: 'postalAddress',
        type: 'string',
      },
      {
        label: 'Address 2',
        value: 'address2',
        type: 'string',
      },
      {
        label: 'City',
        value: 'city',
        type: 'string',
      },
      {
        label: 'Postal Code',
        value: 'postalCode',
        type: 'string',
      },
      {
        label: 'Country',
        value: 'country',
        type: 'string',
      },
      {
        label: 'State/Province',
        value: 'stateProvince',
        type: 'string',
      },
      {
        label: 'Preferences/updates',
        value: 'preferences/updates',
        type: 'boolean',
      },
      {
        label: 'Preferences/marketing',
        value: 'preferences/marketing',
        type: 'boolean',
      },
    ];

    return (
      <div class="m-5">
        <div class="sg_masthead">
          <h1 class="display-4">Query Filter Builder</h1>
        </div>
        <div style="max-width: 914px;">
          <h3>Output</h3>
          <BCard class="mb-5" style="font-family: monospace">{this.queryFilterString}</BCard>
          <div class="mb-5"><BButton variant="primary" onClick={this.clearQueryFilterString}>Clear data</BButton></div>
          <h3>Tool</h3>
          <QueryFilterBuilder resource="user" properties={properties} onChange={this.onChange} />
        </div>
      </div>
    );
  },
});
