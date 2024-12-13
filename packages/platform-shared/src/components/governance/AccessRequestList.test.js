/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { mount } from '@vue/test-utils';
import AccessRequestList from './AccessRequestList';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

const application = {
  id: 1,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'applicationGrant',
  application: {
    name: 'test application',
    description: 'test description',
  },
  user: {
    givenName: 'test givenName',
    sn: 'test sn',
  },
  requester: {
    givenName: 'requester givenName',
    sn: 'requester sn',
  },
};

const entitlement = {
  id: 2,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'entitlementGrant',
  application: {},
  entitlement: {},
  descriptor: { idx: { '/entitlement': { displayName: 'test entitlement' } } },
  glossary: { idx: { '/entitlement': { description: 'test description' } } },
  user: {
    givenName: 'test givenName',
    sn: 'test sn',
  },
};

const role = {
  id: 3,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'roleGrant',
  role: {
    name: 'test role',
    description: 'test description',
  },
  user: {
    givenName: 'test givenName',
    sn: 'test sn',
  },
};

const custom = {
  id: 4,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'customRequest',
};

describe('AccessReviews', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(AccessRequestList, {
      global: { plugins: [i18n] },
      props: {
        requests: [
          application,
        ],
      },
    });
  });

  describe(('applications'), () => {
    it('should display request types', async () => {
      const app = cloneDeep(application);
      await wrapper.setProps({
        requests: [
          app,
        ],
      });

      expect(wrapper.text()).toMatch('Grant Application');

      app.requestType = 'applicationRemove';

      await wrapper.setProps({
        requests: [
          app,
        ],
      });

      expect(wrapper.text()).toMatch('Remove Application');
    });

    it('should display application name', () => {
      wrapper.setProps({
        requests: [
          application,
        ],
      });

      expect(wrapper.text()).toMatch('test application');
    });
  });

  describe(('entitlements'), () => {
    it('should display request types', async () => {
      const ent = cloneDeep(entitlement);
      await wrapper.setProps({
        requests: [
          ent,
        ],
      });

      expect(wrapper.text()).toMatch('Grant Entitlement');

      ent.requestType = 'entitlementRemove';

      await wrapper.setProps({
        requests: [
          ent,
        ],
      });

      expect(wrapper.text()).toMatch('Remove Entitlement');
    });

    it('should display entitlement name', async () => {
      await wrapper.setProps({
        requests: [
          entitlement,
        ],
      });

      expect(wrapper.text()).toMatch('test entitlement');
    });
  });

  describe(('roles'), () => {
    it('should display request types', async () => {
      const myRole = cloneDeep(role);
      await wrapper.setProps({
        requests: [
          myRole,
        ],
      });

      expect(wrapper.text()).toMatch('Grant Role');

      myRole.requestType = 'roleRemove';

      await wrapper.setProps({
        requests: [
          myRole,
        ],
      });

      expect(wrapper.text()).toMatch('Remove Role');
    });

    it('should display role name', async () => {
      await wrapper.setProps({
        requests: [
          role,
        ],
      });

      expect(wrapper.text()).toMatch('test role');
    });
  });

  describe('custom request', () => {
    it('should show a custom request', async () => {
      await wrapper.setProps({
        requests: [
          custom,
        ],
      });

      expect(wrapper.text()).toMatch('customRequest');
    });
  });

  it('should show who submitted the request', () => {
    expect(wrapper.text()).toMatch('requester givenName requester sn');
  });

  it('should show who access has been requested for', () => {
    expect(wrapper.text()).toMatch('test givenName test sn');
  });

  it('should show the date the request was created', () => {
    expect(wrapper.text()).toMatch('Jun 22, 2023');
  });

  it('should show the request id', () => {
    expect(wrapper.text()).toMatch('ID: 1');
  });
});
