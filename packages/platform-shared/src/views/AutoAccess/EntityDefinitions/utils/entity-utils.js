/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { v4 as uuidv4 } from 'uuid';

import materialIconNames from './icon-options';

export const defaultEntity = {
  id: uuidv4(),
  isDirty: false,
  description: '',
  schemas: {
    _meta: {
      type: 'managed',
      indexing: {
        latest: 'false',
        log: 'true',
      },
      icon: '',
      displayName: '',
      properties: {},
    },
    properties: {},
  },
};

export const defaultAttribute = {
  id: uuidv4(),
  isInternal: false,
  isPrimaryKey: false,
  isRequired: false,
  isAutoGenerate: false,
  ml: {
    isFeature: false,
    isLabel: false,
  },
  display: {
    name: '',
    group: 'General',
    order: 10,
    isVisible: false,
    isReadOnly: false,
    isSearchable: false,
  },
};

export const getPrimaryKeyIfExistsOrFirstColumn = (entity) => {
  let primaryKey = null;

  Object.keys(entity.schemas._meta.properties ? entity.schemas._meta.properties : {}).forEach((attributeName) => {
    if (entity.schemas._meta.properties) {
      const attribute = entity.schemas._meta.properties[attributeName];
      if (attribute.isPrimaryKey && !primaryKey) {
        primaryKey = attributeName;
      }
    }
  });

  if (!primaryKey) {
    primaryKey = 'metadata.primaryKey';
  }

  return primaryKey;
};

export const isPrimaryKeyPresent = (entity) => {
  let isPresent = false;

  Object.keys(entity.schemas._meta.properties ? entity.schemas._meta.properties : {}).forEach((attributeName) => {
    if (entity.schemas._meta.properties[attributeName].isPrimaryKey) {
      isPresent = true;
    }
  });

  return isPresent;
};

export const getPrimaryKey = (entity) => {
  let primaryKey = null;

  Object.keys(entity.schemas._meta.properties ? entity.schemas._meta.properties : {}).forEach((attributeName) => {
    if (entity.schemas._meta.properties) {
      const attribute = entity.schemas._meta.properties[attributeName];
      if (attribute.isPrimaryKey && !primaryKey) {
        primaryKey = attributeName;
      }
    }
  });

  return primaryKey;
};

export const cleanUpEntityDefinition = (entity) => {
  if (entity) {
    entity.id = uuidv4();

    if (!entity.schemas) {
      entity.schemas = { ...defaultEntity.schemas };
    }
    if (entity?.schemas?.properties && !entity?.schemas?._meta?.properties) {
      entity.schemas._meta = {
        type: 'managed',
        indexing: {
          latest: 'false',
          log: 'true',
        },
        icon: '',
        displayName: '',
        properties: {},
      };
      Object.keys(entity.schemas.properties).forEach((attributeName) => {
        entity.schemas._meta.properties[attributeName] = { ...defaultAttribute };
      });
    }
    if (!entity.schemas._meta) {
      entity.schemas._meta = { ...defaultEntity.schemas._meta };
    }
    if (!entity.schemas._meta.displayName) {
      entity.schemas._meta.displayName = `${entity.namespace}/${entity.name}`;
    }

    if (!entity.schemas._meta.icon) {
      entity.schemas._meta.icon = 'apps';
    } else if (!materialIconNames.includes(entity.schemas._meta.icon)) {
      entity.schemas._meta.icon = 'apps';
    }

    if (!entity.schemas._meta.properties) {
      entity.schemas._meta.properties = {};
    }

    if (!entity.schemas.properties) {
      entity.schemas.properties = {};
    }

    Object.keys(entity.schemas._meta.properties).forEach((attributeName) => {
      const attribute = entity.schemas._meta.properties[attributeName];
      attribute.display = { ...defaultAttribute.display, ...attribute.display };
      attribute.ml = { ...defaultAttribute.ml, ...attribute.ml };
    });
  }
  return entity;
};

export const cleanUpEntity = (newEntity) => {
  const myEntity = { ...newEntity };
  delete myEntity.id;
  delete myEntity.isDirty;
  delete myEntity.created;
  delete myEntity.name;
  delete myEntity.namespace;
  delete myEntity.tenantId;
  delete myEntity.version;
  delete myEntity.open$;
  delete myEntity.index$;
  delete myEntity.createdMillis;
  delete myEntity.loaded;
  return myEntity;
};
