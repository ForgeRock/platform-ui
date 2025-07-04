/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as workerModule from './formEventsWorker';

describe('formEventsWorker module', () => {
  const mockPostMessage = jest.fn();
  global.postMessage = mockPostMessage;

  afterEach(() => {
    // Reset form values and schema after each test
    workerModule._setTempFormValues({});
    workerModule._setTempFormSchema([]);
    jest.clearAllMocks();
  });

  it('should execute the provided script', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const script = "console.log('test');";
    const scriptVariables = {
      formValues: { foo: 'baz' },
      formSchema: [{ type: 'string' }],
    };

    workerModule.onmessage({ data: { script, scriptVariables } });

    expect(logSpy).toHaveBeenCalledWith('test');
  });

  it('should send message with form value and schema after script is executed', () => {
    const script = '';
    const scriptVariables = {
      formValues: { foo: 'baz' },
      formSchema: [{ type: 'string' }],
    };

    workerModule.onmessage({ data: { script, scriptVariables } });

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

    workerModule.onmessage({ data: { script, scriptVariables } });

    expect(mockPostMessage.mock.calls[0][0].error).toBeInstanceOf(Error);
    expect(mockPostMessage.mock.calls[0][0].error.message).toBe('fail!');
  });

  describe('form functions', () => {
    describe('helper functions', () => {
      beforeEach(() => {
        workerModule._setTempFormValues({ foo: 'bar' });
        workerModule._setTempFormSchema([
          [
            { model: 'foo', label: 'Foo', type: 'string' },
          ],
        ]);
      });

      it('_getFieldByKey should return the correct field object when key exists in first group', () => {
        const field = workerModule._getFieldByKey('foo');
        expect(field).toEqual({ model: 'foo', label: 'Foo', type: 'string' });
      });

      it('_getFieldByKey should return null when key does not exist', () => {
        const field = workerModule._getFieldByKey('nonexistent');
        expect(field).toBeNull();
      });

      it('getLabel should return the label of a field by its key', () => {
        const label = workerModule.form.getLabel('foo');
        expect(label).toBe('Foo');
      });

      it('getLabel should return null if the field does not exist', () => {
        const label = workerModule.form.getLabel('nonexistent');
        expect(label).toBeNull();
      });

      it('getValue should return the value of a field by its key', () => {
        const value = workerModule.form.getValue('foo');
        expect(value).toBe('bar');
      });

      it('getValue should return undefined if the key does not exist', () => {
        const value = workerModule.form.getValue('nonexistent');
        expect(value).toBeUndefined();
      });
    });

    describe('manipulating form schema and values', () => {
      it('disableField should disable a field', () => {
        const script = "form.disableField('foo');";
        const scriptVariables = {
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', disabled: false,
              },
            ],
          ],
        };

        global.onmessage({ data: { script, scriptVariables } });

        expect(mockPostMessage).toHaveBeenCalledWith({
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', disabled: true,
              },
            ],
          ],
        });
      });

      it('enableField should enable a field', () => {
        const script = "form.enableField('foo');";
        const scriptVariables = {
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', disabled: true,
              },
            ],
          ],
        };

        global.onmessage({ data: { script, scriptVariables } });

        expect(mockPostMessage).toHaveBeenCalledWith({
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', disabled: false,
              },
            ],
          ],
        });
      });

      it('setLabel should enable a field', () => {
        const script = "form.enableField('foo');";
        const scriptVariables = {
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', disabled: true,
              },
            ],
          ],
        };

        global.onmessage({ data: { script, scriptVariables } });

        expect(mockPostMessage).toHaveBeenCalledWith({
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', disabled: false,
              },
            ],
          ],
        });
      });

      it('setValue should set the value of a field', () => {
        const script = "form.setValue('foo', 'new value');";
        const scriptVariables = {
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label',
              },
            ],
          ],
        };

        global.onmessage({ data: { script, scriptVariables } });

        expect(mockPostMessage).toHaveBeenCalledWith({
          formValues: { foo: 'new value' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label',
              },
            ],
          ],
        });
      });

      it('hideField should hide a field', () => {
        const script = "form.hideField('foo');";
        const scriptVariables = {
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label',
              },
            ],
          ],
        };

        global.onmessage({ data: { script, scriptVariables } });

        expect(mockPostMessage).toHaveBeenCalledWith({
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', showAlways: false,
              },
            ],
          ],
        });
      });

      it('showField should show a field', () => {
        const script = "form.showField('foo');";
        const scriptVariables = {
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', showAlways: false,
              },
            ],
          ],
        };

        global.onmessage({ data: { script, scriptVariables } });

        expect(mockPostMessage).toHaveBeenCalledWith({
          formValues: { foo: 'baz' },
          formSchema: [
            [
              {
                type: 'string', model: 'foo', label: 'Foo Label', showAlways: true,
              },
            ],
          ],
        });
      });
    });
  });
});
