/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, DOMWrapper } from '@vue/test-utils';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import ReCaptchaEnterpriseCallback from './ReCaptchaEnterprise';
import i18n from '@/i18n';

const { showErrorMessage } = mockNotification();

const API_URL = 'http://test.com';
const SITE_KEY = 'site-key';
const ELEMENT_CLASS = 'classy';
const TOKEN = 'token';
const RECAPTCHA_ERROR = 'Error creating recaptcha';
const setResult = jest.fn();

const mockCreateRecpatchaElementSuccess = () => {
  const container = document.createElement('div');
  const child = document.createElement('div');
  child.classList.add('grecaptcha-badge');
  container.appendChild(child);
  document.body.append(container);
};

const mockCreateRecpatchaElementFailure = () => {
  throw new Error(RECAPTCHA_ERROR);
};

window.grecaptcha = {
  enterprise: {
    ready: jest.fn(),
    execute: jest.fn().mockImplementation(() => Promise.resolve(TOKEN)),
  },
};

describe('CustomNodesView', () => {
  function setup() {
    return mount(ReCaptchaEnterpriseCallback, {
      global: {
        plugins: [i18n],
        mocks: {
        },
      },
      props: {
        callback: {
          getSiteKey: jest.fn(() => SITE_KEY),
          getApiUrl: jest.fn(() => API_URL),
          getElementClass: jest.fn(() => ELEMENT_CLASS),
          setResult,
        },
      },
    });
  }

  let headWrap;
  let scriptSrc;
  let recaptchaScript;

  beforeEach(() => {
    setup();
    headWrap = new DOMWrapper(document.head);
    scriptSrc = `${API_URL}?render=${SITE_KEY}`;
    recaptchaScript = headWrap.find(`script[src='${scriptSrc}']`);
  });

  describe('@renders', () => {
    it('should add recaptcha script to the head of the page with the correct api url and site key', async () => {
      expect(recaptchaScript.exists()).toBeTruthy();
    });

    it('should add it add the class specified in the node config to the recaptcha container', async () => {
      window.grecaptcha.enterprise.ready = jest.fn().mockImplementation((callback) => {
        mockCreateRecpatchaElementSuccess();
        callback();
      });

      await recaptchaScript.trigger('load');
      const bodyWrap = new DOMWrapper(document.body);
      const recpatchaContainer = bodyWrap.find(`.${ELEMENT_CLASS}`);

      expect(recpatchaContainer.exists()).toBeTruthy();
    });

    it('should displays error if recapctha initialisation fails', async () => {
      window.grecaptcha.enterprise.ready = jest.fn().mockImplementation(() => {
        mockCreateRecpatchaElementFailure();
      });
      const error = new Error(RECAPTCHA_ERROR);
      await recaptchaScript.trigger('load');

      expect(showErrorMessage).toHaveBeenCalledWith(
        error,
        'Error loading reCaptcha',
      );
    });
  });

  describe('@actions', () => {
    it('should set the callbacks value to be the recaptcha token', async () => {
      window.grecaptcha.enterprise.ready = jest.fn().mockImplementation((callback) => {
        mockCreateRecpatchaElementSuccess();
        callback();
      });
      await recaptchaScript.trigger('load');

      expect(setResult).toHaveBeenCalledWith(TOKEN);
    });
  });
});
