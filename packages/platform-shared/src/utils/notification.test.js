/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { notify } from '@kyvg/vue3-notification';
import { displayNotification, getApiErrorMessage, showErrorMessage } from './notification';

jest.mock('@kyvg/vue3-notification');
jest.mock('./translations', () => ({ getTranslation: (id) => id }));

describe('notification utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('displayNotification', () => {
    it('calls notify with the given type and message', () => {
      displayNotification('success', 'saved');
      expect(notify).toHaveBeenCalledWith({ type: 'success', text: 'saved' });
    });

    it('converts "error" type to "danger"', () => {
      displayNotification('error', 'something went wrong');
      expect(notify).toHaveBeenCalledWith({ type: 'danger', text: 'something went wrong' });
    });
  });

  describe('getApiErrorMessage', () => {
    it('returns response.data.message when present', () => {
      expect(getApiErrorMessage({ response: { data: { message: 'bad input' } } }, 'fallback')).toBe('bad input');
    });

    it('returns response.data.error when message is absent', () => {
      expect(getApiErrorMessage({ response: { data: { error: 'unauthorized' } } }, 'fallback')).toBe('unauthorized');
    });

    it('returns response.data string when message and error are absent', () => {
      expect(getApiErrorMessage({ response: { data: '  server fault  ' } }, 'fallback')).toBe('server fault');
    });

    it('returns fallback when no usable field is present', () => {
      expect(getApiErrorMessage({}, 'fallback')).toBe('fallback');
    });

    it('returns empty string as default fallback', () => {
      expect(getApiErrorMessage({})).toBe('');
    });
  });

  describe('showErrorMessage', () => {
    it('notifies with the default message when no response.data.message', () => {
      showErrorMessage('error', 'default message');
      expect(notify).toHaveBeenCalledWith({ type: 'danger', text: 'default message' });
    });

    it('notifies with the parsed response message', () => {
      showErrorMessage({ response: { data: { message: 'server error' } } }, 'default');
      expect(notify).toHaveBeenCalledWith({ type: 'danger', text: 'server error' });
    });

    it('decodes HTML entities in the error response message', () => {
      const encoded = '&#39;fr-idm-uuid&#61;02c2681b-d6ae-42ad-83da-ca39fcb19fb0,ou&#61;user,o&#61;alpha,o&#61;root,ou&#61;identities&#39;';
      showErrorMessage({ response: { data: { message: encoded } } }, 'default');
      expect(notify).toHaveBeenCalledWith({ type: 'danger', text: '\'fr-idm-uuid=02c2681b-d6ae-42ad-83da-ca39fcb19fb0,ou=user,o=alpha,o=root,ou=identities\'' });
    });

    it('strips XSS payloads from the error response message instead of rendering them', () => {
      const xssPayload = decodeURIComponent('%3Cimg%20src%3D%22invalid-image-source%22%20onerror%3D%22alert(%27XSS%20Attack%20Successful!%27)%22%3E%0A');
      showErrorMessage({ response: { data: { message: xssPayload } } }, 'default');
      expect(notify).toHaveBeenCalledWith({ type: 'danger', text: '\n' });
    });
  });
});
