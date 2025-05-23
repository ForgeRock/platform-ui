import * as workerModule from './formEventsWorker';

/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

describe('formEventsWorker module', () => {
  const mockPostMessage = jest.fn();
  global.postMessage = mockPostMessage;

  afterEach(() => {
    // Reset form values and schema after each test
    workerModule._tempFormValues = {};
    workerModule._tempFormSchema = [];
    jest.clearAllMocks();
  });

  it('should execute the provided script', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const script = "console.log('test');";
    const scriptVariables = {
      formValues: { foo: 'baz' },
      formSchema: [{ type: 'string' }],
    };

    global.onmessage({ data: { script, scriptVariables } });

    expect(logSpy).toHaveBeenCalledWith('test');
  });

  it('should send message with form value and schema after script is executed', () => {
    const script = '';
    const scriptVariables = {
      formValues: { foo: 'baz' },
      formSchema: [{ type: 'string' }],
    };

    global.onmessage({ data: { script, scriptVariables } });

    expect(mockPostMessage).toHaveBeenCalledWith({
      formValues: { foo: 'baz' },
      formSchema: [{ type: 'string' }],
    });
  });

  it('should post an error if the script throws', () => {
    const script = "throw new Error('fail!')";
    const scriptVariables = {
      formValues: {},
      formSchema: [],
    };

    global.onmessage({ data: { script, scriptVariables } });

    expect(mockPostMessage.mock.calls[0][0].error).toBeInstanceOf(Error);
    expect(mockPostMessage.mock.calls[0][0].error.message).toBe('fail!');
  });
});
