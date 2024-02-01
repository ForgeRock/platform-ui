/**
 * @license
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import PushChallengeNumber from './index';

describe('PushChallengeNumber', () => {
  it('renders push-challenge number', () => {
    const wrapper = mount(PushChallengeNumber, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getOutputValue: () => 45,
        },
        pushMessage: 'Tap the number [55] on the Push Notification to continue.',
      },
    });
    expect(wrapper.text()).toContain('45');
  });

  it('renders push-challenge with default message', () => {
    const defaultAmMessage = 'Tap the number [55] on the Push Notification to continue.';
    const defaultIDCloudMessage = 'Open your Authenticator app and tap the number shown to sign-in.';
    const wrapper = mount(PushChallengeNumber, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getOutputValue: () => 45,
        },
        pushMessage: defaultAmMessage,
      },
    });
    expect(wrapper.text()).toContain(defaultIDCloudMessage);
  });

  it('renders push-challenge override message defined by admin', () => {
    const wrapper = mount(PushChallengeNumber, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getOutputValue: () => 45,
        },
        pushMessage: 'Tap your forehead this many times',
      },
    });
    expect(wrapper.text()).toContain('Tap your forehead this many times');
  });
});
