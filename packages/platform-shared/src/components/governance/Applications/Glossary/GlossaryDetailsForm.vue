<!-- Copyright 2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div id="application-glossary-form">
    <FrFormGenerator
      v-if="!loadingCount"
      :schema="schema"
      :model="model"
      @update:model="emitGlossaryValueUpdateEvent">
      <template #relationshipField="{ index, property }">
        <FrRelationshipEdit
          v-model="property.value"
          class="pb-1 mb-4"
          :close-on-select="!property.isMultiValue"
          :index="index"
          :key="property.key"
          :relationship-property="property"
          @setValue="relationshipValueChange( property, $event )" />
      </template>
    </FrFormGenerator>
  </div>
</template>

<script setup>
/**
 * Generic Glossary Form which displays fields based on glossary schema.
 * It has option to edit if there are glossary values previously saved.
 */
import { isArray, cloneDeep } from 'lodash';
import { onMounted, ref } from 'vue';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import { getManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import i18n from '@/i18n';

const props = defineProps({
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  userResourceName: {
    required: true,
    type: String,
  },
  roleResourceName: {
    required: true,
    type: String,
  },
  orgResourceName: {
    required: true,
    type: String,
  },
});

const emit = defineEmits(['update:modelValue']);

const loadingCount = ref(0);
const model = ref({});
const schema = ref([]);

function getObjectTypeName(attribute) {
  const objectType = attribute.managedObjectType.split('/')[3];
  let objectTypeName = '';

  if (objectType === 'user') {
    objectTypeName = props.userResourceName;
  } else if (objectType === 'role') {
    objectTypeName = props.roleResourceName;
  } else if (objectType === 'organization') {
    objectTypeName = props.orgResourceName;
  }
  return objectTypeName;
}

function buildResourceCollection(attribute, objectTypeName) {
  const objectType = attribute.managedObjectType.split('/')[3];
  const resourceCollection = { path: `managed/${objectTypeName}` };

  resourceCollection.query = { fields: ['name'], queryFilter: 'true' };
  if (objectType === 'user') {
    resourceCollection.label = i18n.global.t('governance.glossary.user');
    resourceCollection.query.fields = ['userName', 'givenName', 'sn'];
  } else if (objectType === 'role') {
    resourceCollection.label = i18n.global.t('governance.glossary.role');
  } else {
    // assumption is that objectType === 'organization'
    resourceCollection.label = i18n.global.t('governance.glossary.organization');
  }
  return [resourceCollection];
}

function cleanup(updateValue) {
  Object.keys(updateValue).forEach((key) => {
    if (updateValue[key] === null || updateValue[key] === undefined || updateValue[key] === '') {
      delete updateValue[key];
    } else if (isArray(updateValue[key])) {
      if (updateValue[key] && updateValue[key].length === 0) {
        delete updateValue[key];
      }
    }
  });
  return updateValue;
}

/**
 * Emits update event to notify parent that glossary values are updated
 * @param {*} model takes in the glossary attribute and value that got updated
 */
function emitGlossaryValueUpdateEvent(updatedModel) {
  let updateValue = cloneDeep(props.modelValue);
  updateValue[updatedModel.path] = updatedModel.value;
  updateValue = cleanup(updateValue);
  emit('update:modelValue', updateValue);
}

function relationshipValueChange(property, value) {
  let finalValue = value;
  const newValues = [];
  if (isArray(value)) {
    value.forEach((row) => {
      const rowRef = row._ref.split('/');
      const idValue = rowRef[2];
      const type = rowRef[1].split('_')[1];
      newValues.push(`managed/${type}/${idValue}`);
    });
    finalValue = newValues;
  } else if (value) {
    const rowRef = value._ref.split('/');
    const idValue = rowRef[2];
    const type = rowRef[1].split('_')[1];
    finalValue = `managed/${type}/${idValue}`;
  } else {
    finalValue = null;
  }
  emitGlossaryValueUpdateEvent({ path: property.key, value: finalValue });
}

function buildRelationshipResource(attribute, resourceName, queryObj) {
  if (!resourceName) return;
  const objectTypeName = getObjectTypeName(attribute);
  const resourceCollection = buildResourceCollection(attribute, objectTypeName);
  const schemaValue = {
    label: attribute.displayName,
    model: attribute.name,
    title: attribute.displayName,
    type: 'managedObject',
    isMultiValue: attribute.isMultiValue,
    key: attribute.name,
    options: [],
    objectType: `managed/${objectTypeName}`,
    ...(!attribute.isMultiValue && { resourceCollection }),
    ...(attribute.isMultiValue && { items: { resourceCollection } }),
    value: [],
  };

  const getRelationshipProperties = (arrayAttr, index) => {
    const idValue = arrayAttr.split('/')[2];
    if (idValue) {
      loadingCount.value += 1;
      return getManagedResource(resourceName, idValue, queryObj).then(({ data }) => {
        data._ref = `managed/${objectTypeName}/${data._id}`;
        return { data, index };
      }).catch(() => ({ data: null, index }));
    }
    return Promise.resolve({ data: null, index });
  };

  if (props.modelValue[attribute.name]) {
    if (isArray(props.modelValue[attribute.name])) {
      props.modelValue[attribute.name].forEach((arrayAttr, index) => {
        getRelationshipProperties(arrayAttr, index).then(({ data, index: resourceIndex }) => {
          if (data) schemaValue.value[resourceIndex] = data;
          if (loadingCount.value > 0) loadingCount.value -= 1;
        });
      });
    } else {
      getRelationshipProperties(props.modelValue[attribute.name]).then(({ data }) => {
        if (data) schemaValue.value = data;
        if (loadingCount.value > 0) loadingCount.value -= 1;
      });
    }
  }

  schema.value.push([schemaValue]);
}

function buildSchemaForPrimitiveType(type, attribute) {
  let fieldType = type;
  let value = null;
  let options = [];

  const isNumericType = type === 'int' || type === 'integer';
  if (isNumericType || type === 'string') {
    const ifEnumeratedValuesExist = attribute.enumeratedValues && attribute.enumeratedValues.length > 0;

    if (ifEnumeratedValuesExist && attribute.isMultiValue) {
      fieldType = 'multiselect';
      options = attribute.enumeratedValues;
      value = props.modelValue[attribute.name] || [];
    } else if (ifEnumeratedValuesExist && !attribute.isMultiValue) {
      fieldType = 'select';
      options = attribute.enumeratedValues;
      value = props.modelValue[attribute.name] || '';
    } else if (!ifEnumeratedValuesExist && attribute.isMultiValue) {
      fieldType = 'array';
      options = [];
      value = props.modelValue[attribute.name] || [];
    } else {
      const isAttributeNumericType = attribute.type === 'int' || attribute.type === 'integer';
      fieldType = isAttributeNumericType ? 'integer' : 'string';
      value = props.modelValue[attribute.name];
    }
  } else if (type === 'boolean' || type === 'date') {
    value = props.modelValue[attribute.name];
  }

  schema.value.push([{
    label: attribute.displayName, model: attribute.name, type: fieldType, options, value, allowEmpty: true,
  }]);
}

function buildSchemaForManagedObject(managedObjectType, attribute) {
  const resourceName = managedObjectType.split('/')[3];
  if (resourceName === 'user') {
    buildRelationshipResource(attribute, props.userResourceName, { fields: 'userName,givenName,sn,mail' });
  } else if (resourceName === 'role') {
    buildRelationshipResource(attribute, props.roleResourceName, { fields: 'name' });
  } else if (resourceName === 'organization') {
    buildRelationshipResource(attribute, props.orgResourceName, { fields: 'name' });
  }
}

onMounted(() => {
  props.glossarySchema.forEach((attribute) => {
    const { type, managedObjectType } = attribute;

    if (type === 'managedObject') {
      buildSchemaForManagedObject(managedObjectType, attribute);
    } else {
      buildSchemaForPrimitiveType(type, attribute);
    }
  });
});
</script>
