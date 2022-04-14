/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { v4 as uuidv4 } from 'uuid';
import { generateAutoAccessApi, generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
// import { getData, postData } from '../../Shared/utils/axios-utils';
import _ from 'lodash';
import store from '@/store';
import { saveEntityInstances, deleteEntityInstance } from '../../Entities/api/EntitiesAPI';

export const trainingTypes = [
  {
    name: 'Training',
    icon: 'lightbulb',
  },
  {
    name: 'Prediction',
    icon: 'batch_prediction',
  },
];

export const defaultParameterSettings = () => (
  {
    batch_size: 512,
    epochs: 300,
    learning_rate: 0.001,
    window: 5,
  }
);

export const defaultPipelineParameters = () => ({
  autoencoder: defaultParameterSettings(),
  embeddings: defaultParameterSettings(),
  vectorizer: defaultParameterSettings(),
  clustering: defaultParameterSettings(),
  variational_autoencoder: defaultParameterSettings(),
});

export const getPipelineDefinition = () => new Promise((resolve, reject) => {
  // getData('jas/entityDefinitions/autoaccess/api/pipeline_definition?latest=true')
  generateAutoAccessJas().get('/entityDefinitions/autoaccess/api/pipeline_definition?latest=true')
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject('An error occured when fetching pipelines definition.');
    });
});

export const getPipelines = (sort, search, searchAfter = [], filters) => {
  const { sortDesc = true, sortBy = 'pipeline_name', perPage = 10 } = sort;
  const def = store.state.Pipelines.pipeline_definition;
  let sorting = [];

  switch (sortBy) {
    case 'updated': {
      sorting = [
        {
          'metadata.created': {
            order: sortDesc ? 'asc' : 'desc',
          },
        },
      ];
      break;
    }
    case 'pipeline_created': {
      sorting = [
        {
          pipeline_created: {
            order: sortDesc ? 'asc' : 'desc',
            unmapped_type: 'date',
          },
        },
      ];
      break;
    }
    case 'status': {
      sorting = [
        {
          'pipeline_executions.status.keyword': {
            order: sortDesc ? 'asc' : 'desc',
            unmapped_type: 'string',
          },
        },
        {
          'metadata.created': {
            order: 'asc',
          },
        },
      ];
      break;
    }
    default: {
      sorting = [
        {
          [`${sortBy}.keyword`]: {
            order: sortDesc ? 'desc' : 'asc',
          },
        },
        {
          'metadata.created': {
            order: 'desc',
          },
        },
      ];
      break;
    }
  }

  const query = {
    sort: sorting,
    size: perPage,
    track_total_hits: true,
    query: {
      bool: {
        must: [
          {
            wildcard: {
              'pipeline_name.keyword': `*${search}*`,
            },
          },
        ],
      },
    },
  };

  if (searchAfter.length > 0) {
    query.search_after = searchAfter;
  }

  if (filters) {
    if (filters.must) {
      filters.must.forEach((must) => {
        query.query.bool.must.push(must);
      });
    }
    if (filters.must_not) {
      query.query.bool.must_not = filters.must_not;
    }
  }

  return new Promise((resolve, reject) => {
    // postData(`jas/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
    generateAutoAccessJas().post(`/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
      .then(({ data: result }) => {
        const items = result.hits.hits.map((item) => (
          {
            ...item._source,
            pipeline_executions: item._source.pipeline_executions || [],
            _sort: item.sort,
          }
        ));
        resolve({ items, total: result.hits.total.value });
      })
      .catch((err) => {
        reject('An error occured when fetching pipelines.');
      });
  });
};

export const getPipelineById = (id) => {
  const def = store.state.Pipelines.pipeline_definition;
  const query = {
    query: {
      term: {
        pipeline_definition_id: id,
      },
    },
  };
  return new Promise((resolve, reject) => {
    // postData(`jas/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
    generateAutoAccessJas().post(`/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
      .then(({ data: result }) => {
        const items = result.hits.hits.map((item) => (
          {
            ...item._source,
            pipeline_executions: item._source.pipeline_executions || [],
            _sort: item.sort,
          }
        ));
        resolve({ items, total: result.hits.total.value });
      })
      .catch((err) => {
        reject('An error occured when fetching pipelines.');
      });
  });
};

const internalToAPIPipeline = (pipeline) => {
  const id = pipeline.pipeline_definition_id || uuidv4();

  delete pipeline._sort;

  return {
    ...pipeline,
    pipeline_definition_id: id,
  };
};

export const getLatestExecution = (executions) => {
  if (executions.length === 0) {
    return {
      execution_id: 'temp_execution',
    };
  }
  return executions[0];
};

export const savePipeline = (pipeline) => new Promise((resolve, reject) => {
  const saveType = pipeline.pipeline_id ? 'create' : 'upsert';
  const payload = [
    internalToAPIPipeline(pipeline),
  ];

  saveEntityInstances(store.state.Pipelines.pipeline_definition, payload, saveType)
    .then((response) => {
      resolve(true);
    });
});

export const deletePipeline = (pipeline) => new Promise((resolve, reject) => {
  deleteEntityInstance([pipeline], store.state.Pipelines.pipeline_definition)
    .then((response) => {
      resolve(true);
    });
});

export const runPipeline = (pipelineDefinitionId, riskThreshold) => new Promise((resolve, reject) => {
  const payload = {
    pipeline_definition_id: pipelineDefinitionId,
    ueba_risk_threshold: riskThreshold,
  };
  // postData('/api/pipeline', payload)
  generateAutoAccessApi().post('/pipeline', payload)
    .then(({ data: response }) => {
      resolve(response);
    })
    .catch((err) => {
      reject('An error occured.');
    });
});

export const getPipelineStatus = (executionID) => new Promise((resolve, reject) => {
  // getData(`/api/pipeline?executionID=${encodeURIComponent(executionID)}`)
  generateAutoAccessApi().get(`/pipeline?executionID=${encodeURIComponent(executionID)}`)
    .then(({ data: response }) => {
      resolve(response);
    })
    .catch((err) => {
      reject('An error occured.');
    });
});

export const checkStatusAndUpdate = (executionsToCheck) => {
  const promises = executionsToCheck.map((execution) => new Promise((resolve, reject) => {
    getPipelineStatus(execution.execution_id)
      .then((response) => {
        resolve({ response, execution });
      })
      .catch((err) => {
        reject('An error occured.');
      });
  }));

  return new Promise((resolve, reject) => {
    Promise.all(promises).then((values) => {
      // const toUpdate = values.filter(update => update.response.state !== 'ACTIVE')

      const updatePromises = values.map((update) => {
        const executions = _.cloneDeep(update.execution.pipeline.pipeline_executions);
        let updatePipeline = false;

        executions.forEach((execution, i) => {
          if (execution.execution_id === update.execution.execution_id) {
            const status = pipelineStatusFromStateAndResult(update.response.state, update.response.result);

            if (status !== executions[i].status) {
              updatePipeline = true;
              executions[i].status = status;
              executions[i].end_time = parseInt(update.response.endTime.seconds, 10);
            }
            // if (update.response.state === 'SUCCEEDED') {
            //     // result could be SUCCEEDED or FAILURE when state is SUCCEEDED
            //     const result = update.response.result.replaceAll('\"', '');
            //     executions[i].status = result === 'FAILURE' ? 'FAILED' : 'SUCCESS' ? 'SUCCEEDED' : 'SUCCEEDED';
            // } else {
            //     executions[i].status = update.response.state;
            // }
            // executions[i].end_time = parseInt(update.response.endTime.seconds, 10);
          }
        });

        if (updatePipeline) {
          return savePipeline({ ...update.execution.pipeline, pipeline_executions: executions });
        }
        return new Promise((resolve, reject) => { resolve(true); });
      });

      resolve(
        Promise.all(updatePromises).then((updated) => (updated)),
      );
    });
  });
};

const pipelineStatusFromStateAndResult = (state, result) => {
  result = result.replaceAll('\"', '');
  if (state === 'SUCCEEDED') {
    if (result === 'FAILURE') {
      return 'FAILED';
    }
    return 'SUCCEEDED';
  }
  return state;
};

export const getIncompleteExecutions = (pipelines) => {
  const runs = [];

  pipelines.forEach((pipeline) => {
    pipeline.pipeline_executions.forEach((run) => {
      if (run.status === 'ACTIVE') {
        runs.push({ pipeline, execution_id: run.execution_id });
      }
    });
  });

  return runs;
};

export const getExecutionModels = (pipelineId) => new Promise((resolve, reject) => {
  // getData(`/api/pipeline/${pipelineId}/models`)
  generateAutoAccessApi().get(`/pipeline/${pipelineId}/models`)
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

export const getPipelineExecutionLogs = (pipelineId) => new Promise((resolve, reject) => {
  // getData(`/api/pipeline/${pipelineId}/logs`);
  generateAutoAccessApi().get(`/api/pipeline/${pipelineId}/logs`)
    .then((result) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

export const isPipelineSuccess = (status) => status === 'SUCCEEDED';

export const publishTrainingPipeline = (id) => new Promise((resolve, reject) => {
  const payload = { pipeline_definition_id: id };
  // postData('/api/pipeline/publish', payload)
  generateAutoAccessApi().post('/pipeline/publish', payload)
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

export const getPublishedTrainingPipeline = () => {
  const query = {
    query: {
      term: {
        name: 'active-access-prediction-config',
      },
    },
  };
  return new Promise((resolve, reject) => {
    // postData('jas/entity/search/common/config', { query })
    generateAutoAccessJas().post('/entity/search/common/config', { query })
      .then(({ data: result }) => {
        const path = _.get(result, 'hits.hits[0]._source.value.common_settings.JSLT_MAPPER_PATH', null);
        const id = _.get(path.split('/'), '[3]', null);

        if (id) {
          getPipelineById(id).then((result) => {
            resolve(_.get(result, 'items[0]', {}));
          });
        } else {
          resolve({});
        }
      })
      .catch((err) => {
        reject('An error occured while fetching published training pipeline.');
      });
  });
};
