/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { mount } from '@vue/test-utils';
import SchemaResetSecretField from './index';

let wrapper;

beforeEach(() => {
  wrapper = mount(SchemaResetSecretField, {
    mocks: {
      $t: () => {},
    },
  });
});

describe('Schema reset secret field', () => {
  it('Schema reset secret field successfully loaded', () => {
    expect(wrapper.name()).toEqual('SchemaResetSecretField');
  });
});
