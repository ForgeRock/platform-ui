/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable */
/**
 * Copyright 2022 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import _ from 'lodash';
import { getConfig } from '../../views/AutoAccess/Shared/utils/api';
import { defaultDateRange } from '@forgerock/platform-shared/src/components/DateRangePicker/utility';
import { getPipelineDefinition } from '../../views/AutoAccess/Pipelines/api/PipelineApi';
import { getUEBAClusteringExplainability, getFeatures } from '../../views/AutoAccess/Activity/api/ActivityAPI';
import { getDataSourceDefinition, getAuthenticationDefinition } from '../../views/AutoAccess/DataSources/api/DataSourcesAPI';

/* eslint-disable import/prefer-default-export */
export default {
  AutoAccessAuth: {
    namespaced: true,
    state: {
      token: '',
    },
    mutations: {
      setToken(state, token) {
        state.token = token;
      },
      setModule(state, module) {
        state.module = module;
      },
      // setTenantId(state, tenantId) {
      //   state.tenantId = tenantId;
      // },
      setLoginTime(state, time) {
        state.loginTime = time;
      },
      setUserTimeout(state, time) {
        state.userTimeout = time;
      },
    },
  },
  Dashboard: {
    namespaced: true,
    state: {
      dates: defaultDateRange().dates,
      utcDates: defaultDateRange().utcDates,
      features: [],
      uebaClusteringReasons: [],
      config: {
        thresholds: {
          high: 0,
        },
      },
    },
    actions: {
      initializeFeatures: ({ commit, state }) => {
        if (state.features.length === 0) {
          Promise.all([getFeatures(), getUEBAClusteringExplainability()]).then(values => {
            commit('setFeatures', values[0]);
            commit('setUEBAClustering', values[1]);
          })
            .catch(err => {

            })
        }
      },
      initializeConfig: ({ commit }) => {
        commit('setConfig', { thresholds: { high: 0, medium: 0 } });
        getConfig().then((res) => {
          commit('setConfig', res);
        })
          .catch((err) => {
            console.log(err);
          });
      },
    },
    mutations: {
      dateChange(state, payload) {
        state.dates = payload.dates;
        state.utcDates = payload.utcDates;
      },
      setFeatures: (state, payload) => {
        state.features = payload;
      },
      setUEBAClustering: (state, payload) => {
        state.uebaClusteringReasons = payload;
      },
      setConfig: (state, payload) => {
        state.config = payload;
      },
    },
  },
  DataSources: {
    namespaced: true,
    state: {
      ds_definition: null,
      auth_properties: [],
      errors: {
        ds_def_undefined: false,
      },
    },
    mutations: {
      setDataSourceDefintion: (state, payload) => {
        state.ds_definition = payload;
      },
      setError: (state, payload) => {
        state.errors[payload] = true;
      },
      setAuthProperties: (state, payload) => {
        const properties = _.get(payload, 'schemas._meta.properties', {});

        state.auth_properties = Object.keys(properties).map((key) => (
          {
            key,
            display: properties[key].display.name,
          }
        )).filter((prop) => prop.key !== 'isAuth')
          .sort((a, b) => a.display.localeCompare(b.display));
      },
    },
    actions: {
      getDefaultMapping: ({ commit, state }) => {
        const mapping = {};

        state.auth_properties.forEach((prop) => {
          mapping[prop.key] = '';
        });

        return mapping;
      },
      initializeDataSources: ({ commit, state }) => {
        getAuthenticationDefinition().then((res) => {
          commit('setAuthProperties', res[0]);
        });

        getDataSourceDefinition().then((res) => {
          if (res.length > 0) {
            commit('setDataSourceDefintion', res[0]);
          } else {
            commit('setError', 'ds_def_undefined');
          }
        });
      },
    },
  },
  Pipelines: {
    namespaced: true,
    state: {
      pipeline_definition: null,
      errors: {
        pipeline_def_undefined: false,
      },
    },
    mutations: {
      setPipelineDefinition: (state, payload) => {
        state.pipeline_definition = payload;
      },
      setError: (state, payload) => {
        state.errors[payload] = true;
      },
    },
    actions: {
      initializePipelines: ({ commit, state }) => {
        getPipelineDefinition().then((res) => {
          if (res.length > 0) {
            commit('setPipelineDefinition', res[0]);
          } else {
            commit('setError', 'pipeline_def_undefined');
          }
        });
      },
    },
  },
};
