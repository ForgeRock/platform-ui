/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as ReportsApiHelper from './ReportsApiHelper';
import ParametersSchema from './ParametersSchema';
import store from '@/store';

describe('ParametersSchema', () => {
  describe('Platform Admin context', () => {
    beforeEach(() => {
      store.state.SharedStore.currentPackage = 'admin';
    });

    describe('Basic parameters', () => {
      it('returns the correct schema for a basic, text parameter', () => {
        const BasicText = {
          parameters: {
            Text: {
              description: 'description',
              label: 'Text',
              source: 'basic',
              type: 'string',
            },
          },
        };
        const { Text } = ParametersSchema(BasicText, false);
        expect(Text).toEqual({
          _id: 'Text',
          _model: '', // empty string for single-select payload
          component: 'FrField',
          description: 'description',
          // only dropdown fields can be searched internally
          internalSearch: false,
          label: 'Text',
          placeholder: 'Text',
          taggable: false, // only dropdown fields can be taggable
          testId: 'fr-field-Text',
          type: 'string', // text field
        });
      });

      it('returns the correct schema for a basic, boolean parameter', () => {
        const BasicBoolean = {
          parameters: {
            Boolean: {
              description: 'description',
              label: 'Boolean',
              source: 'basic',
              type: 'boolean',
            },
          },
        };
        const { Boolean } = ParametersSchema(BasicBoolean, false);
        expect(Boolean).toEqual({
          _id: 'Boolean',
          _model: false, // boolean type
          component: 'FrField',
          description: 'description',
          // only dropdown fields can be searched internally
          internalSearch: false,
          label: 'Boolean',
          placeholder: 'Boolean',
          taggable: false, // only dropdown fields can be taggable
          testId: 'fr-field-Boolean',
          type: 'boolean', // boolean field
        });
      });

      it('returns the correct schema for a basic, integer parameter', () => {
        const BasicInteger = {
          parameters: {
            Integer: {
              description: 'description',
              label: 'Integer',
              source: 'basic',
              type: 'integer',
            },
          },
        };
        const { Integer } = ParametersSchema(BasicInteger, false);
        expect(Integer).toEqual({
          _id: 'Integer',
          _model: null, // null is default value for an integer field
          component: 'FrField',
          description: 'description',
          // only dropdown fields can be searched internally
          internalSearch: false,
          label: 'Integer',
          placeholder: 'Integer',
          taggable: false, // only dropdown fields can be taggable
          testId: 'fr-field-Integer',
          type: 'number', // number field
        });
      });

      it('returns the correct schema for a basic, float parameter', () => {
        const BasicFloat = {
          parameters: {
            Float: {
              description: 'description',
              label: 'Float',
              source: 'basic',
              type: 'float',
            },
          },
        };
        const { Float } = ParametersSchema(BasicFloat, false);
        expect(Float).toEqual({
          _id: 'Float',
          _model: null, // null is default value for a float field
          component: 'FrField',
          description: 'description',
          // only dropdown fields can be searched internally
          internalSearch: false,
          label: 'Float',
          placeholder: 'Float',
          taggable: false, // only dropdown fields can be taggable
          testId: 'fr-field-Float',
          type: 'number', // number field
        });
      });

      it('returns the correct schema for a basic, date parameter', () => {
        const BasicDate = {
          parameters: {
            Date: {
              description: 'description',
              label: 'Date',
              source: 'basic',
              type: 'date',
            },
          },
        };
        const { Date } = ParametersSchema(BasicDate, false);
        expect(Date).toEqual({
          _id: 'Date',
          _model: '', // date type is a string
          component: 'FrField',
          description: 'description',
          // only dropdown fields can be searched internally
          internalSearch: false,
          label: 'Date',
          placeholder: 'Date',
          taggable: false, // only dropdown fields can be taggable
          testId: 'fr-field-Date',
          type: 'date', // date field
        });
      });

      it('returns the correct schema for a basic, single-select, enum parameter', () => {
        const BasicSingleSelectEnum = {
          parameters: {
            SingleSelectEnum: {
              description: 'description',
              enum: [
                {
                  name: 'Active',
                  value: 'active',
                },
                {
                  name: 'Inactive',
                  value: 'inactive',
                },
              ],
              label: 'SingleSelectEnum',
              source: 'basic',
              type: 'string',
            },
          },
        };
        const { SingleSelectEnum } = ParametersSchema(BasicSingleSelectEnum, false);
        expect(SingleSelectEnum).toEqual({
          _id: 'SingleSelectEnum',
          _model: '', // empty string for single-select payload
          component: 'FrField',
          description: 'description',
          enums: [
            {
              text: 'Active',
              value: 'active',
            },
            {
              text: 'Inactive',
              value: 'inactive',
            },
          ],
          internalSearch: true, // enums are always internally searchable
          label: 'SingleSelectEnum',
          placeholder: 'SingleSelectEnum',
          // Per PM requirement, all basic dropdown parameters should universally be taggable
          taggable: true,
          testId: 'fr-field-SingleSelectEnum',
          type: 'select', // single-select
        });
      });

      it('returns the correct schema for a basic, multi-select, enum parameter', () => {
        const BasicMultiSelectEnum = {
          parameters: {
            MultiSelectEnum: {
              description: 'description',
              enum: [
                {
                  name: 'Active',
                  value: 'active',
                },
                {
                  name: 'Inactive',
                  value: 'inactive',
                },
              ],
              item: { type: 'string' },
              label: 'MultiSelectEnum',
              source: 'basic',
              type: 'array',
            },
          },
        };
        const { MultiSelectEnum } = ParametersSchema(BasicMultiSelectEnum, false);
        expect(MultiSelectEnum).toEqual({
          _id: 'MultiSelectEnum',
          _model: [], // empty array for multi-select payload
          component: 'FrField',
          description: 'description',
          enums: [
            {
              text: 'Active',
              value: 'active',
            },
            {
              text: 'Inactive',
              value: 'inactive',
            },
          ],
          internalSearch: true, // enums are always internally searchable
          label: 'MultiSelectEnum',
          placeholder: 'MultiSelectEnum',
          // Per PM requirement, all basic dropdown parameters should universally be taggable
          taggable: true,
          testId: 'fr-field-MultiSelectEnum',
          type: 'multiselect', // multiselect
        });
      });
    });

    describe('Datasource parameters', () => {
      describe('Fetchable parameters', () => {
        it('returns the correct schema for the "amconfig" mapped parameter', async () => {
          jest.spyOn(ConfigApi, 'getAMConfig').mockImplementation(() => Promise.resolve({
            data: {
              trees: {
                suspendedAuthenticationTimeout: 2,
                authenticationSessionsMaxDuration: 3,
              },
            },
          }));

          const Amconfig = {
            parameters: {
              AMConfig: {
                attribute: 'abandonedTimeout',
                description: 'description',
                entity: 'amconfig',
                label: 'Abandoned Timeout',
                source: 'datasource',
                type: 'integer',
              },
            },
          };
          const { AMConfig } = ParametersSchema(Amconfig, false);
          expect(AMConfig).toEqual({
            _id: 'AMConfig',
            _model: null, // null is default value for an integer field
            component: 'FrField',
            description: 'description',
            internalSearch: false,
            label: 'Abandoned Timeout',
            placeholder: 'Abandoned Timeout',
            request: { // fetchable
              attribute: 'abandonedTimeout',
              data: [],
              entity: 'amconfig',
              fetch: ReportsApiHelper.getAMTreesConfig,
              fetchRequestData: expect.any(Function),
              mutation: expect.any(Function),
              mutateRequestData: expect.any(Function),
            },
            taggable: false, // would always be taggable false since this is a number field
            testId: 'fr-field-AMConfig',
            type: 'number', // number field
          });
          const fetchedData = await AMConfig.request.fetchRequestData();
          const mutatedData = AMConfig.request.mutateRequestData(fetchedData);
          // mutation function finds the lower number of the two values in the response
          expect(mutatedData).toEqual(2);
        });

        describe('Single-select parameters', () => {
          it('returns the correct schema for a fetchable, single-select, queriable parameter', () => {
            const SingleSelectFetchableQueriable = {
              parameters: {
                Users: {
                  attribute: 'userName',
                  description: 'description',
                  entity: 'user',
                  label: 'Users',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };
            const { Users } = ParametersSchema(SingleSelectFetchableQueriable, false);
            expect(Users).toEqual({
              _id: 'Users',
              _model: '', // empty string for single-select payload
              component: 'FrField',
              description: 'description',
              internalSearch: false,
              label: 'Users',
              placeholder: 'Users',
              request: { // fetchable & queriable
                attribute: 'userName',
                data: [],
                entity: 'user',
                fetch: expect.any(Function),
                fetchRequestData: expect.any(Function),
                mutation: expect.any(Function),
                mutateRequestData: expect.any(Function),
              },
              // Per PM requirement, all datasource dropdown parameters should universally be non-taggable
              taggable: false,
              testId: 'fr-field-Users',
              type: 'select', // single-select
            });
          });

          it('returns the correct schema for a fetchable, single-select, non-queriable parameter', () => {
            const SingleSelectFetchableNonQueriable = {
              parameters: {
                Journey: {
                  attribute: '_id',
                  description: 'description',
                  entity: 'trees',
                  label: 'Journey',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };
            const { Journey } = ParametersSchema(SingleSelectFetchableNonQueriable, false);
            expect(Journey).toEqual({
              _id: 'Journey',
              _model: '', // empty string for single-select payload
              component: 'FrField',
              description: 'description',
              internalSearch: true,
              label: 'Journey',
              placeholder: 'Journey',
              request: { // fetchable
                attribute: '_id',
                canQuery: false, // non-queriable
                data: [],
                entity: 'trees',
                fetch: expect.any(Function),
                fetchRequestData: expect.any(Function),
                mutation: expect.any(Function),
                mutateRequestData: expect.any(Function),
              },
              // Per PM requirement, all datasource dropdown parameters should universally be non-taggable
              taggable: false,
              testId: 'fr-field-Journey',
              type: 'select', // single-select
            });
          });

          it('should set the data in the "request.data" property when updating a select field', () => {
            const FetchableSelectParameter = {
              parameters: {
                Users: {
                  attribute: 'userName',
                  description: 'description',
                  entity: 'user',
                  label: 'Users',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };

            const { Users } = ParametersSchema(FetchableSelectParameter, false);
            const data = 'user1';
            Users.selectOptionsSetter(data);
            expect(Users.request.data).toEqual([data]);
            expect(Users.model).toEqual(data);
          });

          it('should NOT set the data in the "request.data" property when updating a select field if it exists in the data list already', () => {
            const FetchableSelectParameter = {
              parameters: {
                Users: {
                  attribute: 'userName',
                  description: 'description',
                  entity: 'user',
                  label: 'Users',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };

            const { Users } = ParametersSchema(FetchableSelectParameter, false);
            Users.request.data = ['user1'];
            const data = 'user1';
            Users.selectOptionsSetter(data);
            expect(Users.request.data).toEqual([data]);
            expect(Users.model).toEqual(data);
          });

          it('should set the data in "enums" property when updating a select field with enums', () => {
            const FetchableSelectEnumParameter = {
              parameters: {
                Users: {
                  description: 'description',
                  enum: [
                    {
                      name: 'Active',
                      value: 'active',
                    },
                    {
                      name: 'Inactive',
                      value: 'inactive',
                    },
                  ],
                  label: 'Users',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };

            const { Users } = ParametersSchema(FetchableSelectEnumParameter, false);
            const data = 'banned';
            Users.selectOptionsSetter(data);
            expect(Users.enums).toEqual([
              { text: data, value: data },
              ...Users.constructor.enumMutation(FetchableSelectEnumParameter.parameters.Users.enum),
            ]);
            expect(Users.model).toEqual(data);
          });

          it('should NOT set the data in the "enums" property when updating a select field with an enum value that already exists', () => {
            const FetchableSelectEnumParameter = {
              parameters: {
                Users: {
                  description: 'description',
                  enum: [
                    {
                      name: 'Active',
                      value: 'active',
                    },
                    {
                      name: 'Inactive',
                      value: 'inactive',
                    },
                  ],
                  label: 'Users',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };

            const { Users } = ParametersSchema(FetchableSelectEnumParameter, false);
            const data = 'active';
            Users.selectOptionsSetter(data);
            expect(Users.enums).toEqual([
              ...Users.constructor.enumMutation(FetchableSelectEnumParameter.parameters.Users.enum),
            ]);
            expect(Users.model).toEqual(data);
          });

          it('returns taggable: true in the schema for an unmapped datasource entity that does not contain enums', () => {
            const UnmappedParameterEntity = {
              parameters: {
                UnmappedEntity: {
                  attribute: 'userName',
                  description: 'description',
                  entity: 'unmappedEntity',
                  label: 'Unmapped Entity',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };
            const { UnmappedEntity } = ParametersSchema(UnmappedParameterEntity, false);
            expect(UnmappedEntity.taggable).toBe(true);
          });

          it('returns taggable: false in the schema for an unmapped datasource entity that contain enums', () => {
            const UnmappedParameterEntity = {
              parameters: {
                UnmappedEntity: {
                  attribute: 'userName',
                  description: 'description',
                  entity: 'unmappedEntity',
                  enum: [{ name: 'enum1', value: 'enum1' }],
                  label: 'Unmapped Entity',
                  source: 'datasource',
                  type: 'string',
                },
              },
            };
            const { UnmappedEntity } = ParametersSchema(UnmappedParameterEntity, false);
            expect(UnmappedEntity.taggable).toBe(false);
          });
        });

        describe('Multi-select parameters', () => {
          ConfigApi.getConfig = jest.fn().mockReturnValue({ data: { objects: [{ name: 'alpha_role' }] } });
          ManagedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              result: [
                { _id: 'role1', name: 'role1' },
                { _id: 'role2', name: 'role2' },
              ],
            },
          }));

          it('returns the correct schema for a fetchable, multi-select, queriable parameter', async () => {
            const MultiSelectFetchableQueriable = {
              parameters: {
                Roles: {
                  attribute: 'name',
                  description: 'description',
                  entity: 'role',
                  item: { type: 'string' },
                  label: 'Roles',
                  source: 'datasource',
                  type: 'array',
                },
              },
            };
            const { Roles } = ParametersSchema(MultiSelectFetchableQueriable, false);
            expect(Roles).toEqual({
              _id: 'Roles',
              _model: [], // empty array for multi-select payload
              component: 'FrField',
              description: 'description',
              internalSearch: false,
              label: 'Roles',
              placeholder: 'Roles',
              request: { // fetchable & queriable
                attribute: 'name',
                data: [],
                entity: 'role',
                fetch: expect.any(Function),
                fetchRequestData: expect.any(Function),
                mutation: expect.any(Function),
                mutateRequestData: expect.any(Function),
              },
              // Per PM requirement, all datasource dropdown parameters should universally be non-taggable
              taggable: false,
              testId: 'fr-field-Roles',
              type: 'multiselect', // multiselect
            });

            const fetchedData = await Roles.request.fetchRequestData();
            const mutatedData = Roles.request.mutateRequestData(fetchedData);
            // ensures the default mutation function triggers and returns the expected data
            expect(mutatedData).toEqual(['role1', 'role2']);
          });

          it('returns the correct schema for a fetchable, multi-select, non-queriable parameter', () => {
            const MultiSelectFetchableNonQueriable = {
              parameters: {
                Journey: {
                  attribute: '_id',
                  description: 'description',
                  entity: 'trees',
                  item: { type: 'string' },
                  label: 'Journey',
                  source: 'datasource',
                  type: 'array',
                },
              },
            };
            const { Journey } = ParametersSchema(MultiSelectFetchableNonQueriable, false);
            expect(Journey).toEqual({
              _id: 'Journey',
              _model: [], // empty array for multi-select payload
              component: 'FrField',
              description: 'description',
              internalSearch: true,
              label: 'Journey',
              placeholder: 'Journey',
              // Per PM requirement, all datasource dropdown parameters should universally be non-taggable
              request: { // fetchable
                attribute: '_id',
                canQuery: false, // non-queriable
                data: [],
                entity: 'trees',
                fetch: expect.any(Function),
                fetchRequestData: expect.any(Function),
                mutation: expect.any(Function),
                mutateRequestData: expect.any(Function),
              },
              taggable: false,
              testId: 'fr-field-Journey',
              type: 'multiselect', // multiselect
            });
          });
        });
      });

      describe('Enum parameters', () => {
        it('returns the correct schema for an enum, multi-select parameter', () => {
          const MultiSelectEnum = {
            parameters: {
              CampaignStatus: {
                attribute: 'status',
                description: 'description',
                entity: 'Campaign',
                enum: [
                  {
                    name: 'In-Progress',
                    value: 'in-progress',
                  },
                  {
                    name: 'Complete',
                    value: 'complete',
                  },
                ],
                item: { type: 'string' },
                label: 'Campaign Status',
                source: 'datasource',
                type: 'array',
              },
            },
          };
          const { CampaignStatus } = ParametersSchema(MultiSelectEnum, false);
          expect(CampaignStatus).toEqual({
            _id: 'CampaignStatus',
            _model: [], // empty array for multi-select payload
            component: 'FrField',
            description: 'description',
            enums: [
              {
                text: 'In-Progress',
                value: 'in-progress',
              },
              {
                text: 'Complete',
                value: 'complete',
              },
            ],
            internalSearch: true, // enums can only search internal data
            label: 'Campaign Status',
            placeholder: 'Campaign Status',
            // Per PM requirement, all datasource dropdown parameters should universally be non-taggable
            taggable: false,
            testId: 'fr-field-CampaignStatus',
            type: 'multiselect', // multiselect
          });
        });

        it('returns the correct schema for an enum, single-select parameter', () => {
          const SingleSelectEnum = {
            parameters: {
              CampaignStatus: {
                attribute: 'status',
                description: 'description',
                entity: 'campaign',
                enum: [
                  {
                    name: 'In-Progress',
                    value: 'in-progress',
                  },
                  {
                    name: 'Complete',
                    value: 'complete',
                  },
                ],
                label: 'Campaign Status',
                source: 'datasource',
                type: 'string',
              },
            },
          };
          const { CampaignStatus } = ParametersSchema(SingleSelectEnum, false);
          expect(CampaignStatus).toEqual({
            _id: 'CampaignStatus',
            _model: '', // empty string for single-select payload
            component: 'FrField',
            description: 'description',
            enums: [
              {
                text: 'In-Progress',
                value: 'in-progress',
              },
              {
                text: 'Complete',
                value: 'complete',
              },
            ],
            internalSearch: true, // enums can only search internal data
            label: 'Campaign Status',
            placeholder: 'Campaign Status',
            // Per PM requirement, all datasource dropdown parameters should universally be non-taggable
            taggable: false,
            testId: 'fr-field-CampaignStatus',
            type: 'select', // single-select
          });
        });
      });
    });
  });

  describe('End-user context', () => {
    beforeEach(() => {
      store.state.SharedStore.currentPackage = 'enduser';
    });

    it('returns the expected properties for parameters that render under end-user that are otherwise fetchable under admin', () => {
      const FetchableParameter = {
        parameters: {
          Users: {
            attribute: 'userName',
            description: 'description',
            entity: 'user',
            label: 'Users',
            source: 'datasource',
            type: 'string',
          },
        },
      };
      const { Users } = ParametersSchema(FetchableParameter, false);

      expect(Users.request).toBeUndefined();
      expect(Users.enum).toBeUndefined();
      expect(Users.options).toBeDefined();
      expect(Users.internalSearch).toBe(true);
      expect(Users.taggable).toBe(true);
    });

    it('returns the expected properties for parameters that render under end-user that contain enums', () => {
      const EnumParameter = {
        parameters: {
          CampaignStatus: {
            attribute: 'status',
            description: 'description',
            entity: 'Campaign',
            enum: [
              {
                name: 'In-Progress',
                value: 'in-progress',
              },
              {
                name: 'Complete',
                value: 'complete',
              },
            ],
            label: 'Campaign Status',
            source: 'datasource',
            type: 'string',
          },
        },
      };
      const { CampaignStatus } = ParametersSchema(EnumParameter, false);

      expect(CampaignStatus.request).toBeUndefined();
      expect(CampaignStatus.options).toBeUndefined();
      expect(CampaignStatus.enums).toBeDefined();
      expect(CampaignStatus.taggable).toBe(true);
    });

    it('should set the data in the "options" property when updating a select field', () => {
      const EndUserSelectParameter = {
        parameters: {
          Users: {
            attribute: 'userName',
            description: 'description',
            entity: 'user',
            label: 'Users',
            source: 'datasource',
            type: 'string',
          },
        },
      };

      const { Users } = ParametersSchema(EndUserSelectParameter, false);
      const data = 'user1';
      Users.selectOptionsSetter(data);
      expect(Users.options).toEqual([data]);
      expect(Users.model).toEqual(data);
    });

    it('should NOT set the data in the "options" property when updating a select field with an existing value', () => {
      const EndUserSelectParameter = {
        parameters: {
          Users: {
            attribute: 'userName',
            description: 'description',
            entity: 'user',
            label: 'Users',
            source: 'datasource',
            type: 'string',
          },
        },
      };

      const { Users } = ParametersSchema(EndUserSelectParameter, false);
      Users.options = ['user1'];
      const data = 'user1';
      Users.selectOptionsSetter(data);
      expect(Users.options).toEqual([data]);
      expect(Users.model).toEqual(data);
    });
  });

  describe('@unit', () => {
    beforeEach(() => {
      store.state.SharedStore.currentPackage = 'admin';
    });

    it('should update the component property to "FrTimeframeField" if the report is pre-packaged and the name is equal to "startDate"', () => {
      const prePackagedConfig = {
        parameters: {
          startDate: {},
          endDate: {},
        },
      };

      const schema = ParametersSchema(prePackagedConfig, true);
      expect(schema.startDate.component).toEqual('FrTimeframeField');
      expect(schema.endDate.component).toEqual(null);
    });

    it('should update the request data when querying a select field parameter', () => {
      const FetchableSelectParameter = {
        parameters: {
          Users: {
            attribute: 'userName',
            description: 'description',
            entity: 'user',
            label: 'Users',
            source: 'datasource',
            type: 'string',
          },
        },
      };

      const { Users } = ParametersSchema(FetchableSelectParameter, false);
      const data = [{ userName: 'user2' }];
      const mutatedData = Users.request.mutateRequestData(data);
      expect(mutatedData).toEqual(['user2']);
    });

    it('returns the expected payload for any parameter', () => {
      const FetchableSelectParameter = {
        parameters: {
          Users: {
            attribute: 'userName',
            description: 'description',
            entity: 'user',
            item: { type: 'string' },
            label: 'Users',
            source: 'datasource',
            type: 'array',
          },
        },
      };

      const { Users } = ParametersSchema(FetchableSelectParameter, false);
      Users.model = ['user1'];
      expect(Users.payload(Users.model)).toEqual({ Users: ['user1'] });
    });

    it('should handle an empty report config', () => {
      const emptyConfig = {};
      const schema = ParametersSchema(emptyConfig, false);
      expect(schema).toEqual({});
    });

    it('should handle a report config with no parameters', () => {
      const noParamsConfig = { parameters: {} };
      const schema = ParametersSchema(noParamsConfig, false);
      expect(schema).toEqual({});
    });
  });
});
