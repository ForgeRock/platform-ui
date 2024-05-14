/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import useReportParameters from './ReportParameters';

describe('@useReportParameters', () => {
  const {
    parameterDefinitions,
    parameterTypeLabels,
    parametersPayload,
    profileAttributeNames,
  } = useReportParameters();

  const sharedUserProvidedBody = {
    source: 'user_provided',
    label: 'paramOne label',
    description: 'param description',
  };
  const userProvidedEnumeratedMultivalued = {
    enumeratedValues: [{
      name: 'enumName',
      value: 'enumVal',
    }],
    helpText: 'param description',
    inputType: 'String',
    inputLabel: 'paramOne label',
    multivalued: true,
    parameterName: 'paramOne',
    parameterType: 'user_provided',
    profileAttribute: undefined,
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

  ReportsUtils.getManagedObject = jest.fn().mockReturnValue(Promise.resolve({
    schema: {
      properties: {
        _id: { description: 'User ID', type: 'string' },
        name: { description: 'User Name', type: 'string' },
        group: { description: 'User Group', type: 'array' },
      },
    },
  }));

  describe('@unit', () => {
    const parametersAPIUserProvided = {
      paramOne: {
        source: 'user_provided',
        label: 'paramOne label',
        description: 'param description',
        type: 'string',
        enum: [{
          name: 'enumName',
          value: 'enumVal',
        }],
        item: { type: 'string' },
      },
    };

    it('gets the expected parameters data and ensures that parameter types and schema properties output expected lists', async () => {
      await parameterDefinitions(parametersAPIUserProvided);
      expect(parameterTypeLabels.value).toEqual(['String', 'Boolean']);
      expect(profileAttributeNames.value).toEqual(['_id', 'name', 'group']);
    });

    it('outputs a UI friendly data set from an expected API input', async () => {
      const firstDefinition = await parameterDefinitions(parametersAPIUserProvided);
      expect(firstDefinition).toEqual([userProvidedEnumeratedMultivalued]);

      const parametersAPIProfileAttribute = {
        mySecondParam: {
          type: 'string',
          source: 'profile_attribute',
          profile_attribute: '_id',
        },
      };

      const secondDefinition = await parameterDefinitions(parametersAPIProfileAttribute);
      expect(secondDefinition).toEqual([{
        enumeratedValues: [],
        helpText: undefined,
        inputType: 'String',
        inputLabel: undefined,
        multivalued: false,
        parameterName: 'mySecondParam',
        parameterType: 'profile_attribute',
        profileAttribute: '_id',
      }]);
    });

    describe('@payload', () => {
      describe('parameterType = user_provided', () => {
        it('outputs an expected payload with enumerated values and is multivalued', async () => {
          const payload = {
            ...sharedUserProvidedBody,
            type: 'string',
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

      describe('parameterType = profile_attribute', () => {
        it('outputs an expected payload if the profile_attribute property is a primitive value', () => {
          const profileAttributePrimitive = {
            id: 'myProfileAttributeParam',
            parameterType: 'profile_attribute',
            profileAttribute: '_id',
          };
          const payload = {
            type: 'string',
            source: 'profile_attribute',
            profile_attribute: '_id',
          };

          expect(parametersPayload([profileAttributePrimitive])).toEqual({
            parameters: {
              [profileAttributePrimitive._id]: payload,
            },
          });
        });

        it('outputs an expected payload if the profile_attribute property has a type of array', () => {
          const profileAttributeArray = {
            id: 'myProfileAttributeParam',
            parameterType: 'profile_attribute',
            profileAttribute: 'group',
          };
          const payload = {
            type: 'array',
            source: 'profile_attribute',
            profile_attribute: 'group',
            item: { type: 'string' },
          };

          expect(parametersPayload([profileAttributeArray])).toEqual({
            parameters: {
              [profileAttributeArray._id]: payload,
            },
          });
        });
      });
    });
  });
});
