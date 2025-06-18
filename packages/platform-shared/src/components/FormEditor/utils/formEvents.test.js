/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { useWebWorker } from './formEvents';

// Mock Worker
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.terminated = false;
    MockWorker.instance = this;
  }

  postMessage(msg) {
    this._lastMsg = msg;
    // Simulate async worker response
    setTimeout(() => {
      if (msg.script === 'throw') {
        this.onmessage({ data: { error: 'Script error' } });
      } else {
        this.onmessage({
          data: {
            formValues: { foo: 'bar' },
            formSchema: { type: 'object' },
          },
        });
      }
    }, 0);
  }

  terminate() {
    this.terminated = true;
  }
}
global.Worker = MockWorker;

describe('useWebWorker', () => {
  const script = 'return formValues;';
  const formValues = { a: 1 };
  const formSchema = { type: 'object' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with updated formValues and formSchema from worker', async () => {
    const result = await useWebWorker(script, formValues, formSchema);

    expect(result).toEqual({
      formValues: { foo: 'bar' },
      formSchema: { type: 'object' },
    });
    expect(MockWorker.instance.terminated).toBe(true);
  });

  it('should reject if worker returns an error', async () => {
    await expect(useWebWorker('throw', formValues, formSchema)).rejects.toThrow(
      'Error executing onLoad event: Script error',
    );
    expect(MockWorker.instance.terminated).toBe(true);
  });

  it('should post the correct message to the worker', async () => {
    await useWebWorker(script, formValues, formSchema);
    const { script: postedScript, scriptVariables } = MockWorker.instance._lastMsg;
    expect(postedScript).toBe(script);
    expect(scriptVariables).toEqual({
      formValues: { a: 1 },
      formSchema: { type: 'object' },
      windowSearch: '',
    });
  });

  it('sends the current window search params', async () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?test=123' },
      writable: true,
    });

    await useWebWorker(script, formValues, formSchema);
    const { scriptVariables } = MockWorker.instance._lastMsg;
    expect(scriptVariables.windowSearch).toBe('?test=123');
  });
});
