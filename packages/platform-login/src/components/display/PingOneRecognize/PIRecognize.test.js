/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { recognize } from '@forgerock/recognize';
import { PIRecognize } from './PIRecognize';

jest.mock('@forgerock/recognize', () => ({
  recognize: jest.fn((options) => ({ _client: true, ...options })),
}));

describe('PIRecognize', () => {
  describe('recognizeSdkBase', () => {
    it('returns origin + pathname + recognize-sdk/', () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com', pathname: '/am/XUI/' },
        configurable: true,
      });
      expect(PIRecognize.recognizeSdkBase()).toBe('https://example.com/am/XUI/recognize-sdk/');
    });

    it('normalises pathname without trailing slash', () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com', pathname: '/am/XUI' },
        configurable: true,
      });
      expect(PIRecognize.recognizeSdkBase()).toBe('https://example.com/am/XUI/recognize-sdk/');
    });
  });

  describe('isCameraStreamAvailable', () => {
    let enumerateDevices;
    let getUserMedia;

    beforeEach(() => {
      enumerateDevices = jest.fn();
      getUserMedia = jest.fn();
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { enumerateDevices, getUserMedia },
        configurable: true,
      });
    });

    const makeDevice = (kind, label) => ({ kind, label });

    it('returns true when a labelled video input is already present', async () => {
      enumerateDevices.mockResolvedValue([makeDevice('videoinput', 'FaceTime HD Camera')]);
      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(true);
      expect(getUserMedia).not.toHaveBeenCalled();
    });

    it('returns false when there are no video inputs', async () => {
      enumerateDevices.mockResolvedValue([makeDevice('audioinput', 'Mic')]);
      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(false);
      expect(getUserMedia).not.toHaveBeenCalled();
    });

    it('opens and stops a throwaway stream when device labels are blank (Firefox)', async () => {
      enumerateDevices.mockResolvedValue([makeDevice('videoinput', '')]);
      const track = { stop: jest.fn() };
      getUserMedia.mockResolvedValue({ getTracks: () => [track] });

      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(true);
      expect(getUserMedia).toHaveBeenCalledWith({ video: true });
      expect(track.stop).toHaveBeenCalled();
    });

    it('returns false when the blank-label recovery stream is rejected', async () => {
      enumerateDevices.mockResolvedValue([makeDevice('videoinput', '')]);
      getUserMedia.mockRejectedValue(new Error('NotAllowedError'));

      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(false);
    });

    it('returns false when enumerateDevices rejects', async () => {
      enumerateDevices.mockRejectedValue(new Error('unsupported'));
      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(false);
    });

    it('returns false when mediaDevices or enumerateDevices is missing', async () => {
      Object.defineProperty(global.navigator, 'mediaDevices', { value: undefined, configurable: true });
      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(false);

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: jest.fn() },
        configurable: true,
      });
      await expect(PIRecognize.isCameraStreamAvailable()).resolves.toBe(false);
    });
  });

  describe('buildThemeOptions', () => {
    it('uses theme values when provided', () => {
      const result = PIRecognize.buildThemeOptions({
        primaryColor: '#FF0000',
        backgroundColor: '#000000',
        bodyText: '#CCCCCC',
      });
      expect(result.colors.light.primary).toBe('#FF0000');
      expect(result.colors.light.surface).toBe('#000000');
      expect(result.colors.light.onSurface).toBe('#CCCCCC');
      expect(result.colors.light.onPrimary).toBe('#FFFFFF');
    });

    it('falls back to defaults when theme is empty', () => {
      const result = PIRecognize.buildThemeOptions({});
      expect(result.colors.light.primary).toBe('#006AD4');
      expect(result.colors.light.surface).toBe('#FFFFFF');
      expect(result.colors.light.onSurface).toBe('#1A1A1A');
    });

    it('falls back to defaults when no theme passed', () => {
      const result = PIRecognize.buildThemeOptions();
      expect(result.colors.light.primary).toBe('#006AD4');
    });

    it('falls back to defaults when the store theme is still null (failed fetch)', () => {
      const result = PIRecognize.buildThemeOptions(null);
      expect(result.colors.light.primary).toBe('#006AD4');
      expect(result.colors.light.surface).toBe('#FFFFFF');
    });

    it('dark mode values are always hardcoded', () => {
      const result = PIRecognize.buildThemeOptions({ primaryColor: '#FF0000' });
      expect(result.colors.dark.primary).toBe('#4BA3FF');
      expect(result.colors.dark.surface).toBe('#14161C');
      expect(result.colors.dark.onSurface).toBe('#F8F8F8');
    });
  });

  describe('createClient', () => {
    it('calls recognize with the provided options and returns the result', () => {
      const options = { customer: 'test', serviceURL: 'https://example.com' };
      const result = PIRecognize.createClient(options);
      expect(recognize).toHaveBeenCalledWith(options);
      expect(result).toMatchObject({ _client: true, ...options });
    });
  });
});
