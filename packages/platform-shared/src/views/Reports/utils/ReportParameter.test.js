/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ReportParameter from './ReportParameter';

describe('ReportParameter', () => {
  let requestSelectArgs;
  let requestMultiselectArgs;
  let enumsSelectArgs;
  let optionsArgs;

  beforeEach(() => {
    requestSelectArgs = {
      _id: 'requestSelectArgs',
      model: 'testModel',
      type: 'select',
      request: {
        fetch: jest.fn(),
        mutation: jest.fn(),
        entity: 'testEntity',
        attribute: 'testAttribute',
        data: [],
      },
    };
    requestMultiselectArgs = {
      _id: 'requestMultiselectArgs',
      model: ['testModel'],
      type: 'multiselect',
      request: {
        fetch: jest.fn(),
        mutation: jest.fn(),
        entity: 'testEntity',
        attribute: 'testAttribute',
        data: [],
      },
    };
    enumsSelectArgs = {
      _id: 'enumSelectArgs',
      model: 'testEnumModel',
      type: 'select',
      enums: [
        { name: 'option1', value: 'option1' },
        { name: 'option2', value: 'option2' },
      ],
    };
    optionsArgs = {
      _id: 'optionsArgs',
      model: '',
      type: 'select',
      options: [],
    };
  });

  it('should initialize with expected properties for a parameter that is requestable', () => {
    const instance = new ReportParameter(requestSelectArgs);
    expect(instance.request).toBeDefined();
    expect(instance.enums).toBeUndefined();
    expect(instance.options).toBeUndefined();
  });

  it('should initialize with expected properties for a parameter that contains an enums property', () => {
    const instance = new ReportParameter(enumsSelectArgs);
    expect(instance.enums).toBeDefined();
    expect(instance.request).toBeUndefined();
    expect(instance.options).toBeUndefined();
  });

  it('should initialize with expected properties for a parameter that contains an options property', () => {
    const instance = new ReportParameter(optionsArgs);
    expect(instance.options).toBeDefined();
    expect(instance.request).toBeUndefined();
    expect(instance.enums).toBeUndefined();
  });

  it('should set optional to true when args.optional is truthy', () => {
    const instance = new ReportParameter({ ...requestSelectArgs, optional: true });
    expect(instance.optional).toBe(true);
  });

  it('should not set optional property when args.optional is falsy', () => {
    const instance = new ReportParameter(requestSelectArgs);
    expect(instance).not.toHaveProperty('optional');
  });

  it('should set unique select data correctly', () => {
    const instance = new ReportParameter(requestSelectArgs);
    const data = ['option1', 'option2'];
    instance.model = 'option3';
    const result = instance.selectOptionsDataHandler(data);
    expect(result).toEqual(['option3', 'option1', 'option2']);
  });

  it('should not return an already present value for a select parameter', () => {
    const instance = new ReportParameter(requestSelectArgs);
    const data = ['option1', 'option2'];
    instance.model = 'option2';
    const result = instance.selectOptionsDataHandler(data);
    expect(result).toEqual(['option1', 'option2']);
  });

  it('should return a unique multi-select list from a unique input', () => {
    const instance = new ReportParameter(requestMultiselectArgs);
    const data = ['option1', 'option2', 'option3'];
    instance.model = ['option1', 'option2'];
    const result = instance.selectOptionsDataHandler(data);
    expect(result).toEqual(['option3']);
  });

  it('should not return an existing value for a multi-select parameter', () => {
    const instance = new ReportParameter(requestMultiselectArgs);
    const data = ['option1'];
    instance.model = ['option1', 'option2'];
    const result = instance.selectOptionsDataHandler(data);
    expect(result).toEqual([]);
  });

  it('adds a unique enum only', () => {
    const instance = new ReportParameter(enumsSelectArgs);
    instance.selectOptionsSetter('option3');
    expect(instance.enums).toEqual([
      { text: 'option3', value: 'option3' },
      { text: 'option1', value: 'option1' },
      { text: 'option2', value: 'option2' },
    ]);

    instance.selectOptionsSetter('option3');
    expect(instance.enums).toEqual([
      { text: 'option3', value: 'option3' },
      { text: 'option1', value: 'option1' },
      { text: 'option2', value: 'option2' },
    ]);
  });

  it('adds a unique option only', () => {
    const instance = new ReportParameter(optionsArgs);
    instance.selectOptionsSetter('option3');
    expect(instance.options).toEqual(['option3']);

    instance.selectOptionsSetter('option3');
    expect(instance.options).toEqual(['option3']);
  });

  it('should return expected payload', () => {
    const instance = new ReportParameter(requestSelectArgs);
    const payload = instance.payload();
    expect(payload).toEqual({ requestSelectArgs: 'testModel' });
  });

  it('should return expected payload for a date parameter', () => {
    const dateInput = '2025-03-12';
    const instance = new ReportParameter({
      _id: 'dateParam',
      model: dateInput,
      type: 'date',
    });
    const payload = instance.payload();
    expect(payload).toEqual({ dateParam: new Date(dateInput).toISOString() });
  });

  it('should convert date to ISO format', () => {
    const date = '2025-03-12';
    const isoDate = ReportParameter.dateToISO(date);
    expect(isoDate).toBe(new Date(date).toISOString());
  });

  it('should format enums correctly', () => {
    const value = 'enumValue';
    const formattedEnum = ReportParameter.enumFormat(value);
    expect(formattedEnum).toEqual({ text: value, value });
  });

  it('should mutate enums correctly', () => {
    const enums = [{ name: 'enum1', value: 'enum1' }];
    const mutatedEnums = ReportParameter.enumMutation(enums);
    expect(mutatedEnums).toEqual([{ text: 'enum1', value: 'enum1' }]);
  });

  describe('optional parameter payload', () => {
    it('returns null for an optional string parameter with an empty string model', () => {
      const instance = new ReportParameter({
        _id: 'optStr', model: '', type: 'string', optional: true,
      });
      expect(instance.payload()).toEqual({ optStr: null });
    });

    it('returns null for an optional multiselect parameter with an empty array model', () => {
      const instance = new ReportParameter({
        _id: 'optMulti', model: [], type: 'multiselect', optional: true,
      });
      expect(instance.payload()).toEqual({ optMulti: null });
    });

    it('returns null for an optional parameter whose model is already null', () => {
      const instance = new ReportParameter({
        _id: 'optNum', model: null, type: 'number', optional: true,
      });
      expect(instance.payload()).toEqual({ optNum: null });
    });

    it('returns the actual value for an optional parameter that has a value', () => {
      const instance = new ReportParameter({
        _id: 'optStr', model: 'hello', type: 'string', optional: true,
      });
      expect(instance.payload()).toEqual({ optStr: 'hello' });
    });

    it('returns the actual value for an optional multiselect parameter that has selections', () => {
      const instance = new ReportParameter({
        _id: 'optMulti', model: ['a', 'b'], type: 'multiselect', optional: true,
      });
      expect(instance.payload()).toEqual({ optMulti: ['a', 'b'] });
    });

    it('does not affect a non-optional parameter with an empty string model', () => {
      const instance = new ReportParameter({
        _id: 'reqStr', model: '', type: 'string',
      });
      expect(instance.payload()).toEqual({ reqStr: '' });
    });
  });
});
