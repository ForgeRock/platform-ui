/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';
import { defaultDateRange } from '@forgerock/platform-shared/src/components/DateRangePicker/utility';
import { getConfig } from '../../views/AutoAccess/Shared/utils/api';
import { getPipelineDefinition } from '../../views/AutoAccess/Pipelines/api/PipelineApi';
import { getUEBAClusteringExplainability, getFeatures } from '../../views/AutoAccess/Activity/api/ActivityAPI';
import { getDataSourceDefinition, getAuthenticationDefinition } from '../../views/AutoAccess/DataSources/api/DataSourcesAPI';

export default {
  Dashboard: {
    namespaced: true,
    state: {
      activeFilters: {
        features: [],
        geoCoordinates: {},
        is_risky_event: true,
        reasons: [],
        riskRange: [0, 100],
        showFilters: false,
      },
      config: {
        thresholds: {
          high: 0,
        },
      },
      clusteringReasons: [],
      dates: defaultDateRange().dates,
      features: [],
      ignoreReasons: ['failed', 'unknown'],
      uebaReasons: [],
      uebaClusteringReasons: [],
      utcDates: defaultDateRange().utcDates,
    },
    actions: {
      initializeFeatures({ commit, state }) {
        if (state.features.length === 0) {
          Promise.all([getFeatures(), getUEBAClusteringExplainability()]).then((values) => {
            commit('setFeatures', values[0]);
            commit('setUEBAClustering', values[1]);
          });
        }
      },
      initializeConfig({ commit }) {
        commit('setConfig', { thresholds: { high: 0, medium: 0 } });
        getConfig().then((res) => {
          commit('setConfig', res);
        });
      },
      setActiveFilters({ commit }) {
        commit('setActiveFilters', commit);
      },
    },
    mutations: {
      dateChange(state, payload) {
        state.dates = payload.dates;
        state.utcDates = payload.utcDates;
      },
      setActiveGeoCoordinates(state, payload) {
        state.activeFilters.geoCoordinates = payload;
      },
      setActiveRiskRange(state, payload) {
        state.activeFilters.riskRange = payload;
      },
      setActiveReasonFilters(state, payload) {
        state.activeFilters.reasons = payload;
      },
      setActiveFeatureFilters(state, payload) {
        state.activeFilters.features = payload;
      },
      setFeatures(state, payload) {
        state.features = payload;
      },
      setUEBAClustering(state, payload) {
        state.clusteringReasons = payload.clustering;
        state.uebaReasons = payload.ueba;
        state.uebaClusteringReasons = payload.keys;
      },
      setConfig(state, payload) {
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
      getDefaultMapping: ({ state }) => {
        const mapping = {};

        state.auth_properties.forEach((prop) => {
          mapping[prop.key] = '';
        });

        return mapping;
      },
      initializeDataSources: ({ commit }) => {
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
      initializePipelines: ({ commit }) => {
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
