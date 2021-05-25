/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SchemaStateButton from './index';

let wrapper;

beforeEach(() => {
  wrapper = mount(SchemaStateButton, {
    mocks: {
      $t: () => {},
    },
    propsData: {
      schema: {
        status: {
          options: [
            { value: 'on', text: 'on' },
            { value: 'off', text: 'off' },
            { value: 'standby', text: 'standby' },
          ],
        },
      },
      model: {
        status: {
          value: 'on',
        },
      },
      field: 'status',
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
