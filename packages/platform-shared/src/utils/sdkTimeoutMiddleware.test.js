/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { JAVASCRIPT_SDK_TIMEOUT } from './constants';
import { sdkTimeoutMiddleware } from './sdkTimeoutMiddleware';

describe('sdkTimeoutMiddleware', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('attaches an abort signal to the request', () => {
    const req = { headers: new Headers() };
    sdkTimeoutMiddleware(req, {}, () => {});
    expect(req.signal).toBeInstanceOf(AbortSignal);
    expect(req.signal.aborted).toBe(false);
  });

  it('aborts the request after JAVASCRIPT_SDK_TIMEOUT', () => {
    const req = { headers: new Headers() };
    sdkTimeoutMiddleware(req, {}, () => {});
    jest.advanceTimersByTime(JAVASCRIPT_SDK_TIMEOUT);
    expect(req.signal.aborted).toBe(true);
  });

  it('does not abort before the timeout elapses', () => {
    const req = { headers: new Headers() };
    sdkTimeoutMiddleware(req, {}, () => {});
    jest.advanceTimersByTime(JAVASCRIPT_SDK_TIMEOUT - 1);
    expect(req.signal.aborted).toBe(false);
  });

  it('clears the timer when the request is aborted externally', () => {
    const req = { headers: new Headers() };
    sdkTimeoutMiddleware(req, {}, () => {});
    req.signal.dispatchEvent(new Event('abort'));
    expect(() => jest.advanceTimersByTime(JAVASCRIPT_SDK_TIMEOUT * 10)).not.toThrow();
  });

  it('propagates an external abort into the outgoing signal', () => {
    const external = new AbortController();
    const req = { headers: new Headers(), signal: external.signal };
    sdkTimeoutMiddleware(req, {}, () => {});
    external.abort();
    expect(req.signal.aborted).toBe(true);
  });

  it('aborts immediately when the incoming signal is already aborted', () => {
    const external = new AbortController();
    external.abort();
    const req = { headers: new Headers(), signal: external.signal };
    sdkTimeoutMiddleware(req, {}, () => {});
    expect(req.signal.aborted).toBe(true);
  });

  it('calls next exactly once', () => {
    const req = { headers: new Headers() };
    const next = jest.fn();
    sdkTimeoutMiddleware(req, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
