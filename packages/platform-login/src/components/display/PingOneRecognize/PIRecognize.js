/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { recognize } from '@forgerock/recognize';

export class PIRecognize {
  static createClient(options) {
    return recognize(options);
  }

  /**
   * The SDK assets deploy next to the login app (whatever the context root or
   * fronting proxy), so resolve them relative to the page, not AM's URL.
   */
  static recognizeSdkBase() {
    const page = `${window.location.origin}${window.location.pathname.replace(/\/?(\?.*)?$/, '/')}`;
    return `${page}recognize-sdk/`;
  }

  /**
   * Firefox can report the camera permission as granted while enumerateDevices()
   * still returns unlabelled video inputs: labels require a live stream in the
   * current document, not just the underlying permission grant. The Recognize
   * SDK's own startCameraFlow treats unlabelled devices the same as "not
   * granted" and falls back to its camera-permission step, which we disable
   * (we render our own themed screen instead), so trusting "granted" and
   * skipping straight to the instructions screen can strand the flow with no
   * visible next step. Mirrors the SDK's own recovery
   * (kl_sdk_web's isVideoMediaStreamAvailable): force a throwaway stream so
   * Firefox reveals the labels before trusting a "granted" permission.
   */
  static async isCameraStreamAvailable() {
    if (!navigator.mediaDevices?.enumerateDevices) return false;
    let devices;
    try {
      devices = await navigator.mediaDevices.enumerateDevices();
    } catch (e) {
      return false;
    }
    const videoInputs = devices.filter((device) => device.kind === 'videoinput');
    if (!videoInputs.length) return false;
    if (videoInputs.some((device) => device.label)) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Maps the login theme store onto the SDK's colour options. Dark mode is
   * intentionally hardcoded: the login screens' dark theme values are fixed.
   *
   * @param {Object} [theme] the theme store's theme object; may be null while
   *   the store is still loading (a failed fetch falls back to defaults).
   * @returns {Object} the SDK themeOptions shape ({ colors: { light, dark } }).
   */
  static buildThemeOptions(theme = {}) {
    const colors = theme || {};
    return {
      colors: {
        light: {
          primary: colors.primaryColor || '#006AD4',
          onPrimary: colors.textColor || '#FFFFFF',
          surface: colors.backgroundColor || '#FFFFFF',
          onSurface: colors.bodyText || '#1A1A1A',
        },
        dark: {
          primary: '#4BA3FF',
          onPrimary: '#1A1A1A',
          surface: colors.darkColor || '#14161C',
          onSurface: colors.lightColor || '#F8F8F8',
        },
      },
    };
  }
}
