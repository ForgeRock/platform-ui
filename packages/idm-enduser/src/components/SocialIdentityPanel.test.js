/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as SelfServiceApi from '@/api/SelfServiceApi';
import SocialIdentityPanel from './SocialIdentityPanel';
import i18n from '@/i18n';

jest.mock('@/api/SelfServiceApi');
SelfServiceApi.getSocialProviderProfile.mockResolvedValue({
  data: [
    {
      id: 'testId',
      displayName: 'Michael Wong',
      givenName: 'Michael',
      familyName: 'Wong',
      email: 'test@test.com',
      username: 'test@test.com',
      photoUrl: 'someUrl',
    },
  ],
});

const testProvider = {
  provider: 'facebook',
  clientId: '189683322481639',
  scope: [
    'email',
    'user_birthday',
  ],
  uiConfig: {
    iconBackground: '#3b5998',
    iconClass: 'fa-facebook',
    iconFontColor: 'white',
    buttonImage: 'images/facebook.png',
    buttonClass: 'home',
    buttonDisplayName: 'Facebook',
    buttonCustomStyle: 'background-color: #3b5998;border-color: #3b5998; color: white;',
    buttonCustomStyleHover: 'background-color: #334b7d;border-color: #334b7d; color: white;',
  },
  propertyMap: [
    {
      source: 'id',
      target: 'id',
    },
    {
      source: 'name',
      target: 'displayName',
    },
    {
      source: 'first_name',
      target: 'givenName',
    },
    {
      source: 'last_name',
      target: 'familyName',
    },
    {
      source: 'email',
      target: 'email',
    },
    {
      source: 'email',
      target: 'username',
    },
    {
      source: 'picture',
      target: 'photoUrl',
      transform: {
        type: 'text/javascript',
        source: 'source.data.url',
      },
    },
  ],
  id: '3321072124604699',
  name: 'Michael Wong',
  picture: 'pictureUrl',
  email: 'test@test.com',
  first_name: 'Michael',
  last_name: 'Wong',
  _refResourceCollection: 'managed/facebook',
};

describe('SocialIdentityPanel', () => {
  function setup() {
    return mount(SocialIdentityPanel, {
      global: {
        plugins: [i18n],
      },
      props: {
        provider: testProvider,
      },
    });
  }

  it('calls to get profile data for social provider', async () => {
    setup();
    await flushPromises();

    expect(SelfServiceApi.getSocialProviderProfile).toHaveBeenCalledWith({
      rawProfile: {
        _refResourceCollection: 'managed/facebook',
        email: 'test@test.com',
        first_name: 'Michael',
        id: '3321072124604699',
        last_name: 'Wong',
        name: 'Michael Wong',
        picture: 'pictureUrl',
      },
    });
  });

  it('renders social provider profile data and shared scopes', async () => {
    const wrapper = setup();
    await flushPromises();

    expect(wrapper.text()).toContain('Michael Wong');
    expect(wrapper.text()).toContain('test@test.com');
    expect(wrapper.text()).toContain('Email');
    expect(wrapper.text()).toContain('User_birthday');
  });

  it('sets image to profile photoUrl', async () => {
    const wrapper = setup();
    await flushPromises();

    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('someUrl');
  });
});
