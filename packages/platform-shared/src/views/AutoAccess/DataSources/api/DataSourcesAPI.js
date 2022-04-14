/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { generateAutoAccessApi, generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
import {
  postData, postDataToken, getData, getDataToken,
} from '../../Shared/utils/axios-utils';
import { deleteEntityInstance, saveEntityInstances } from '../../Entities/api/EntitiesAPI';
import { formatBytes } from '../../Shared/utils/util-functions';
import store from '@/store';

const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

export const getAuthenticationDefinition = () => new Promise((resolve, reject) => {
  // getData('/autoaccess/jas/entityDefinitions/autoaccess/base/authentication?latest=true')
  generateAutoAccessJas().get('/entityDefinitions/autoaccess/base/authentication?latest=true')
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

export const getFirstFile = (bucket, prefix) => new Promise((resolve, reject) => {
  if (prefix.indexOf('*') === -1) {
    resolve({ bucket, name: prefix });
  } else {
    searchBuckets(bucket).then((response) => {
      const b = response.buckets.find((x) => x.name === bucket);
      console.log(bucket, response, b);

      if (b) {
        searchObjects(b.name, prefix.replace('*', '')).then((objects) => {
          const firstJSON = objects.objects.find((o) => (o.extension.toLowerCase() === 'json' || o.extension.toLowerCase() === 'jsonl') && o.size > 0);

          if (firstJSON) {
            resolve(firstJSON);
          } else {
            reject('file not found');
          }
        });
      } else {
        reject('bucket not found');
      }
    });
  }
});

export const searchBuckets = (prefix, max) => new Promise((resolve, reject) => {
  // postDataToken('/autoaccess/api/datasources/search/buckets', { prefix, max })
  generateAutoAccessJas().post('/entity/search/autoaccess/risk_explainability?latest=true', { prefix, max })
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

export const searchObjects = (bucket, prefix, start) => new Promise((resolve, reject) => {
  // postDataToken('/autoaccess/api/datasources/search/objects', {
  //   bucket, prefix, start, pageSize: 6,
  // })
  generateAutoAccessApi().post('/datasources/search/objects', {
    bucket, prefix, start, pageSize: 6,
  })
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

export const getBucketAndPrefixFromLocation = (location = '') => {
  const split = location.split('/');
  const bucket = split[0];
  const prefix = location.replace(`${bucket}/`, '');

  return {
    bucket,
    prefix,
  };
};

export const getFilePreview = (bucket, filePath) => new Promise((resolve, reject) => {
  // getDataToken(`/autoaccess/api/datasources/preview?bucket=${bucket}&filePath=${filePath}`)
  generateAutoAccessApi().get(`/datasources/preview?bucket=${bucket}&filePath=${filePath}`)
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject('Invalid JSONL. Cannot be used as Data Source.');
    });
});

export const getJSLTPreview = (preview, mapping) => new Promise((resolve, reject) => {
  // postData('/autoaccess/jas/jslt/preview', { data: preview, feature_mapping: mapping })
  generateAutoAccessJas().post('/jslt/preview', { data: preview, feature_mapping: mapping })
    .then(({ data: result }) => {
      console.log('result:', result);
      resolve(result);
    })
    .catch((err) => reject(err));
});

export const getDataSourceDefinition = () => new Promise((resolve, reject) => {
  // getData('/autoaccess/jas/entityDefinitions/autoaccess/datasources?latest=true')
  generateAutoAccessJas().get('/entityDefinitions/autoaccess/datasources?latest=true')
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((err) => {
      reject('An error occured when fetching data source definition.');
    });
});

export const getDataSources = (sort, search, searchAfter = [], activeOnly = false) => {
  const { sortDesc = true, sortBy = 'name', perPage = 10 } = sort;
  const def = store.state.DataSources.ds_definition;
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
    case 'datasource_created': {
      sorting = [
        {
          datasource_created: {
            order: sortDesc ? 'asc' : 'desc',
            unmapped_type: 'date',
          },
        },
      ];
      break;
    }
    case 'name': {
      sorting = [
        {
          'name.keyword': {
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
    case 'isActive': {
      sorting = [
        {
          isActive: {
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
    default: {
      sorting = [];
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
              'name.keyword': `*${search}*`,
            },
          },
        ],
      },
    },
  };
  if (searchAfter.length > 0) {
    query.search_after = searchAfter;
  }

  if (activeOnly) {
    query.query.bool.must.push({
      term: {
        isActive: true,
      },
    });
  }
  return new Promise((resolve, reject) => {
    // postData(`/autoaccess/jas/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
    generateAutoAccessJas().post(`/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
      .then(({ data }) => {
        const items = data.hits.hits.map((item) => (
          {
            ...item._source,
            _sort: item.sort,
          }
        ));
        resolve({ items, total: data.hits.total.value });
      })
      .catch((err) => {
        reject('An error occured when fetching data sources.');
      });
  });
};

export const getDataSourceById = (id) => {
  const def = store.state.DataSources.ds_definition;
  const query = {
    query: {
      term: {
        datasource_id: id,
      },
    },
  };
  return new Promise((resolve, reject) => {
    // postData(`/autoaccess/jas/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
    generateAutoAccessJas().post(`/entity/search${def.namespace}/${def.name}/${def.version}`, { query })
      .then(({ data: result }) => {
        const items = result.hits.hits.map((item) => (
          {
            ...item._source,
            _sort: item.sort,
          }
        ));
        resolve({ items, total: result.hits.total.value });
      })
      .catch((err) => {
        reject('An error occured when fetching data sources.');
      });
  });
};

export const apiToInternalGCSObject = (item) => ({
  ...item,
  prefix: item.name + (item.isFolder ? '*' : ''),
  size_formatted: item.isFolder ? '—' : formatBytes(item.size),
  created_formatted: dayjs(item.created).format('YYYY-MM-DD HH:mm:ss'),
});

export const defaultDataSourceFromBucket = ({ name, row }) => ({
  datasource_id: uuidv4(),
  name,
  bucket: {
    name: row.bucket,
    prefix: row.prefix,
  },
  isActive: false,
  feature_mapping: store.dispatch('DataSources/getDefaultMapping'),
  datasource_created: dayjs().utc().format(),
});

const internalToAPIDataSource = (dataSource) => {
  const ds = { ...dataSource };

  delete ds._sort;

  if (dataSource.bucket) {
    ds.input = `${dataSource.bucket.name}/${dataSource.bucket.prefix}`;

    delete ds.bucket;
  }

  return ds;
};

export const saveDataSource = (payload) => {
  const dataSource = internalToAPIDataSource(payload);

  return new Promise((resolve, reject) => {
    saveEntityInstances(store.state.DataSources.ds_definition, [dataSource], 'create')
      .then((response) => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const updateDataSource = (payload) => {
  const dataSource = internalToAPIDataSource(payload);

  return new Promise((resolve, reject) => {
    saveEntityInstances(store.state.DataSources.ds_definition, [dataSource], 'edit')
      .then((response) => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteDataSource = (payload) => {
  const dataSource = internalToAPIDataSource(payload);

  return new Promise((resolve, reject) => {
    deleteEntityInstance([dataSource], store.state.DataSources.ds_definition)
      .then((response) => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const isValidFile = (bucket, filePath) => new Promise((resolve, reject) => {
  getFilePreview(bucket, filePath)
    .then((result) => {
      resolve(true);
    })
    .catch((err) => {
      reject(false);
    });
});

export const getFlattenedJSON = (json, prefix = '') => {
  let arr = [];

  if (json) {
    Object.keys(json).forEach((key) => {
      if (Array.isArray(json[key])) {
        let i = 0;
        while (i < json[key].length) {
          arr.push(`.${prefix}${key}[${i}]`);
          i += 1;
        }
      } else if (typeof json[key] === 'object') {
        arr = [].concat(arr, getFlattenedJSON(json[key], `${prefix}${key}.`));
      } else {
        arr.push(`.${prefix}${key}`);
      }
    });
  }

  return arr;
};
