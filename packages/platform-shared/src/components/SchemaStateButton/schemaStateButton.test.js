/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { mount } from '@vue/test-utils';
import SchemaStateButton from './index';

let wrapper;

beforeEach(() => {
  wrapper = mount(SchemaStateButton, {
    mocks: {
      $t: () => {},
      $store: {
        state: {
          ApplicationStore: {
            jsonSchemas: {
              test: {
                status: {
                  options: [
                    { value: 'on', text: 'on' },
                    { value: 'off', text: 'off' },
                    { value: 'standby', text: 'standby' },
                  ],
                },
              },
            },
            jsonSchemaData: {
              test: {
                status: {
                  value: 'on',
                },
              },
            },
          },
        },
      },
    },
    propsData: {
      schemaType: 'test',
      model: 'status',
    },
  });
});

describe('Schema state button', () => {
  it('Schema state button successfully loaded', () => {
    expect(wrapper.name()).toEqual('SchemaStateButton');
  });

  it('Displays the selected option', () => {
    expect(wrapper.find('button').text()).toEqual('on');
  });

  it('Shows dropdown options consisting only of the options not currently selected', () => {
    const options = wrapper.findAll('li');
    expect(options.length).toEqual(2);
    expect(options.at(0).text()).toBe('off');
    expect(options.at(1).text()).toBe('standby');
  });
});
