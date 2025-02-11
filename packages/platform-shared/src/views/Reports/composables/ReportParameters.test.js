/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useReportParameters from './ReportParameters';

describe('@useReportParameters', () => {
  const { parameterDefinitions, parametersPayload } = useReportParameters();

  const sharedUserProvidedBody = {
    source: 'basic',
    label: 'paramOne label',
    description: 'param description',
  };
  const userProvidedEnumeratedMultivalued = {
    enumeratedValues: [{
      name: 'enumName',
      value: 'enumVal',
    }],
    helpText: 'param description',
    inputType: 'string',
    inputLabel: 'paramOne label',
    multivalued: true,
    parameterName: 'paramOne',
    source: 'basic',
  };

  autoApi.getReportParameterTypes = jest.fn().mockReturnValue(Promise.resolve({
    data: [
      {
        description: 'String',
        label: 'String',
        type: 'string',
      },
      {
        description: 'Boolean',
        label: 'Boolean',
        type: 'boolean',
      },
    ],
  }));

  describe('@unit', () => {
    const parametersAPIBasicEnum = {
      paramOne: {
        source: 'basic',
        label: 'paramOne label',
        description: 'param description',
        type: 'array',
        item: { type: 'string' },
        enum: [{
          name: 'enumName',
          value: 'enumVal',
        }],
      },
    };

    it('outputs a UI friendly data set from an expected API input', async () => {
      const firstDefinition = await parameterDefinitions(parametersAPIBasicEnum);
      expect(firstDefinition).toEqual([userProvidedEnumeratedMultivalued]);

      const BasicParameter = {
        mySecondParam: {
          label: 'My Basic Parameter',
          description: '',
          type: 'string',
          source: 'basic',
        },
      };

      const secondDefinition = await parameterDefinitions(BasicParameter);
      expect(secondDefinition).toEqual([{
        helpText: '',
        inputType: 'string',
        inputLabel: 'My Basic Parameter',
        multivalued: false,
        parameterName: 'mySecondParam',
        source: 'basic',
      }]);
    });

    describe('@payload', () => {
      describe('parameterType = basic', () => {
        it('outputs an expected payload with enumerated values and is multivalued', async () => {
          const payload = {
            ...sharedUserProvidedBody,
            type: 'array',
            enum: [{
              name: 'enumName',
              value: 'enumVal',
            }],
            item: { type: 'string' },
          };

          expect(parametersPayload([userProvidedEnumeratedMultivalued])).toEqual({
            parameters: {
              [userProvidedEnumeratedMultivalued.parameterName]: payload,
            },
          });
        });

        it('outputs an expected payload with enumerated values', () => {
          const userProvidedEnumerated = {
            ...userProvidedEnumeratedMultivalued,
            multivalued: false, // re-setting multivalued to false here on purpose for this test
          };
          const payload = {
            ...sharedUserProvidedBody,
            type: 'string',
            enum: [{
              name: 'enumName',
              value: 'enumVal',
            }],
          };

          expect(parametersPayload([userProvidedEnumerated])).toEqual({
            parameters: {
              [userProvidedEnumeratedMultivalued.parameterName]: payload,
            },
          });
        });

        it('outputs an expected payload if multivalued', () => {
          const userProvidedMultivalued = {
            ...userProvidedEnumeratedMultivalued,
            enumeratedValues: [], // re-setting enum values here on purpose for this test
          };
          const payload = {
            ...sharedUserProvidedBody,
            type: 'array',
            item: { type: 'string' },
          };

          expect(parametersPayload([userProvidedMultivalued])).toEqual({
            parameters: {
              [userProvidedEnumeratedMultivalued.parameterName]: payload,
            },
          });
        });

        it('outputs an expected payload if Input Type is a primitive value', () => {
          const userProvidedPrimitive = {
            ...userProvidedEnumeratedMultivalued,
            enumeratedValues: [], // re-setting enum values here on purpose for this test
            multivalued: false, // re-setting multivalued to false here on purpose for this test
          };
          const payload = {
            ...sharedUserProvidedBody,
            type: 'string',
          };

          expect(parametersPayload([userProvidedPrimitive])).toEqual({
            parameters: {
              [userProvidedEnumeratedMultivalued.parameterName]: payload,
            },
          });
        });
      });

      describe('parameterType = basic', () => {
        it('outputs an expected payload if the basic property is a primitive value', () => {
          const profileAttributePrimitive = {
            parameterName: 'myProfileAttributeParam',
            parameterType: 'basic',
          };
          const payload = {
            type: 'string',
            source: 'basic',
          };

          expect(parametersPayload([profileAttributePrimitive])).toEqual({
            parameters: {
              [profileAttributePrimitive.parameterName]: payload,
            },
          });
        });

        it('outputs an expected payload if the basic property has a type of array', () => {
          const profileAttributeArray = {
            helpText: '',
            inputLabel: 'My Basic Parameter',
            multivalued: true,
            parameterName: 'MyBasicParam',
            source: 'basic',
          };
          const payload = {
            label: 'My Basic Parameter',
            description: '',
            type: 'array',
            source: 'basic',
            item: { type: 'string' },
          };

          expect(parametersPayload([profileAttributeArray])).toEqual({
            parameters: {
              [profileAttributeArray.parameterName]: payload,
            },
          });
        });
      });
    });
  });
});
