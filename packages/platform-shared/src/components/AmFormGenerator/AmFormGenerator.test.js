/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import FrKeyValueField from '@forgerock/platform-shared/src/components/KeyValueField/KeyValueField';
import i18n from '@/i18n';
import AmFormGenerator from './AmFormGenerator';

mockValidation(['required', 'integer']);

// Schema mirrors the shape produced by createAmForm: an array of property objects
// each with a `key`, plus AM metadata (title/description/type/required/...).
const schema = [
  {
    key: 'clientId',
    title: 'Client ID',
    description: 'The OAuth client identifier.',
    type: 'string',
    required: true,
  },
  {
    key: 'enabled',
    title: 'Enabled',
    description: 'Whether the provider is enabled.',
    type: 'boolean',
  },
  {
    key: 'tokenLifetime',
    title: 'Token Lifetime',
    description: 'Token TTL in seconds.',
    type: 'integer',
  },
];

const value = {
  clientId: 'my-client',
  enabled: false,
  tokenLifetime: 60,
};

function setup(props = {}) {
  return mount(AmFormGenerator, {
    global: {
      plugins: [i18n],
    },
    props: {
      schema,
      value,
      ...props,
    },
  });
}

describe('AmFormGenerator', () => {
  describe('@renders', () => {
    it('renders one FrField per non-object schema entry', () => {
      const wrapper = setup();

      // Each FrField wrapper carries a data-testid of `fr-field-<key>`.
      expect(findByTestId(wrapper, 'fr-field-clientId').exists()).toBe(true);
      expect(findByTestId(wrapper, 'fr-field-enabled').exists()).toBe(true);
      expect(findByTestId(wrapper, 'fr-field-tokenLifetime').exists()).toBe(true);

      // Sanity: total field count matches the schema length.
      const fieldRoots = wrapper.findAll('[data-testid^="fr-field-"]');
      expect(fieldRoots.length).toBe(schema.length);
    });

    it('wires the field name from the schema entry key', () => {
      const wrapper = setup();

      // The inner input is rendered with name="<key>" by FrField — verifies the
      // schema key flows through `:name="property.key"` on the FrField wrapper.
      expect(wrapper.find('input[name="clientId"]').exists()).toBe(true);
    });

    it('renders an empty list when schema is empty', () => {
      const wrapper = setup({ schema: [], value: {} });
      expect(wrapper.findAll('[data-testid^="fr-field-"]').length).toBe(0);
    });

    it('renders FrKeyValueField for object-type schema entries', () => {
      const objectSchema = [
        {
          key: 'headers',
          title: 'Custom Headers',
          description: 'Key-value pairs sent with each request.',
          type: 'object',
          required: true,
        },
      ];
      const wrapper = setup({ schema: objectSchema, value: { headers: { Accept: 'application/json' } } });

      const kvField = wrapper.findComponent(FrKeyValueField);
      expect(kvField.exists()).toBe(true);
      // FrField must NOT be rendered for this entry
      expect(wrapper.findAll('[data-testid^="fr-field-"]').length).toBe(0);
    });

    it('passes the correct value to FrKeyValueField', () => {
      const objectSchema = [{ key: 'headers', title: 'Headers', type: 'object' }];
      const headers = { Accept: 'application/json' };
      const wrapper = setup({ schema: objectSchema, value: { headers } });

      const kvField = wrapper.findComponent(FrKeyValueField);
      expect(kvField.props('value')).toEqual(headers);
    });

    it('passes valueOptions to FrKeyValueField when the object property has an enum', () => {
      const valueOptions = [
        { text: 'Chain A', value: 'a' },
        { text: 'Chain B', value: 'b' },
      ];
      const objectSchema = [{
        key: 'signingChain',
        title: 'Signing Chain',
        type: 'object',
        valueOptions,
      }];
      const wrapper = setup({ schema: objectSchema, value: { signingChain: {} } });

      const kvField = wrapper.findComponent(FrKeyValueField);
      expect(kvField.props('valueOptions')).toEqual(valueOptions);
    });

    it('passes undefined valueOptions to FrKeyValueField for object properties with no enum (KeyValueField default handles it)', () => {
      const objectSchema = [{
        key: 'headers',
        title: 'Custom Headers',
        type: 'object',
      }];
      const wrapper = setup({ schema: objectSchema, value: { headers: {} } });

      const kvField = wrapper.findComponent(FrKeyValueField);
      // valueOptions is absent on the schema entry — :value-options receives undefined,
      // which Vue resolves to KeyValueField's prop default of []. This is the code path
      // for all non-enum object attributes (e.g. jwtSigningKidHeaderMappings).
      expect(kvField.props('valueOptions')).toEqual([]);
    });

    it('does not render FrKeyValueField for non-object schema entries', () => {
      const stringSchema = [{ key: 'clientId', title: 'Client ID', type: 'string' }];
      const wrapper = setup({ schema: stringSchema, value: { clientId: 'test' } });

      expect(wrapper.findComponent(FrKeyValueField).exists()).toBe(false);
      expect(findByTestId(wrapper, 'fr-field-clientId').exists()).toBe(true);
    });
  });

  describe('@actions', () => {
    it('emits input with the merged value object when a field changes', async () => {
      const wrapper = setup();

      const clientIdInput = wrapper.find('input[name="clientId"]');
      await clientIdInput.setValue('updated-client');
      await flushPromises();

      const inputEvents = wrapper.emitted('input');
      expect(inputEvents).toBeTruthy();

      // Find the input event whose payload reflects the clientId change.
      const clientIdChange = inputEvents
        .map(([payload]) => payload)
        .find((payload) => payload.clientId === 'updated-client');
      expect(clientIdChange).toBeDefined();

      // Payload must merge the changed field over the existing `value` prop —
      // every previous key is preserved, and the changed key carries the new value.
      expect(clientIdChange).toEqual({
        clientId: 'updated-client',
        enabled: false,
        tokenLifetime: 60,
      });
    });

    it('emits input with merged value when FrKeyValueField emits input', async () => {
      const objectSchema = [{ key: 'headers', title: 'Headers', type: 'object' }];
      const wrapper = setup({ schema: objectSchema, value: { headers: {} } });

      const kvField = wrapper.findComponent(FrKeyValueField);
      await kvField.vm.$emit('input', { Accept: 'application/json' });

      const inputEvents = wrapper.emitted('input');
      expect(inputEvents).toHaveLength(1);
      expect(inputEvents[0][0]).toEqual({ headers: { Accept: 'application/json' } });
    });
  });

  describe('disableRequiredValidation prop', () => {
    it('applies the required validator when disableRequiredValidation is false (default)', () => {
      const wrapper = setup();

      // FrField forwards the `:validation` binding through $attrs (it doesn't
      // declare validation as a prop) — read it directly off the component instance.
      const clientIdField = findByTestId(wrapper, 'fr-field-clientId').getComponent({ name: 'FrField' });
      expect(clientIdField.vm.$attrs.validation).toMatchObject({ required: true });
    });

    it('suppresses the required validator when disableRequiredValidation is true', () => {
      const wrapper = setup({ disableRequiredValidation: true });

      const clientIdField = findByTestId(wrapper, 'fr-field-clientId').getComponent({ name: 'FrField' });
      expect(clientIdField.vm.$attrs.validation).toMatchObject({ required: false });
    });

    it('suppresses required on FrKeyValueField when disableRequiredValidation is true', () => {
      const objectSchema = [{
        key: 'headers', title: 'Headers', type: 'object', required: true,
      }];
      const wrapper = setup({ schema: objectSchema, value: { headers: {} }, disableRequiredValidation: true });

      const kvField = wrapper.findComponent(FrKeyValueField);
      expect(kvField.vm.$attrs.validation).toMatchObject({ required: false });
    });
  });
});
