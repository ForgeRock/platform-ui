<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <form>
    <BListGroup>
      <BListGroupItem
        v-for="parameter in formattedParameters"
        class="p-0"
        :key="parameter.key"
      >
        <BButton
          variant="link"
          class="d-flex flex-row justify-content-between w-100 text-body p-4 text-decoration-none pipeline-parameter-form-section-btn"
          v-b-toggle="`collapse-${parameter.key.replace(' ', '-')}-${id}`">
          <div>
            <span class="text-capitalize font-weight-bold text-dark">
              {{ parameter.label }}
            </span>
            <BBadge
              variant="danger"
              v-if="parameterValidation[parameter.key].total > 0"
              pill
            >
              {{ parameterValidation[parameter.key].total }}
            </BBadge>
          </div>
          <span class="mr-2 md-24 material-icons-outlined text-dark expand-icon">
            expand_more
          </span>
          <span class="mr-2 md-24 material-icons-outlined text-dark collapse-icon">
            expand_less
          </span>
        </BButton>
        <BCollapse
          :id="`collapse-${parameter.key.replace(' ', '-')}-${id}`"
          class="px-4 pb-4"
        >
          <div
            v-for="field in parameter.values"
            :key="field.key"
            class="mb-2"
          >
            <FrField
              :field="field"
              :failed-policies="parameterValidation[parameter.key].errors[field.key]"
              :readonly="field.key === 'window'"
              @valueChange="(value) => updateParameterValue(value, parameter.key, field.key)"
            />
          </div>
        </BCollapse>
      </BListGroupItem>
    </BListGroup>
  </form>
</template>
<script>
import {
  BListGroup, BListGroupItem, BCollapse, BButton, BBadge,
} from 'bootstrap-vue';
import { v4 as uuidv4 } from 'uuid';
import { capitalize } from 'lodash';
import FrField from '../../Shared/Field';

export default {
  name: 'PipelineParametersForm',
  components: {
    BListGroup,
    BListGroupItem,
    BCollapse,
    BButton,
    FrField,
    BBadge,
  },
  props: {
    parameters: {
      type: Object,
      required: true,
    },
    parameterValidation: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      id: uuidv4(),
    };
  },
  watch: {
  },
  computed: {
    formattedParameters() {
      const arr = [];

      Object.keys(this.parameters)
        .sort()
        .forEach((key) => {
          const values = [];
          Object.keys(this.parameters[key])
            .sort()
            .forEach((pKey) => {
              values.push(
                {
                  key: pKey,
                  value: this.parameters[key][pKey],
                  title: capitalize(pKey.replace('_', ' ')),
                  type: 'number',
                },
              );
            });
          arr.push(
            {
              key,
              label: key.replace('_', ' '),
              values,
            },
          );
        });

      return arr;
    },
  },
  methods: {
    updateParameterValue(value, parameter, field) {
      this.$emit('parameter-change', { value, parameter, field });
    },
  },
};
</script>

<style lang="scss">
  .pipeline-parameter-form-section-btn {
    &[aria-expanded='false'] {
      .expand-icon {
        display: block;
      }

      .collapse-icon {
        display: none;
      }
    }

    &[aria-expanded='true'] {
      .expand-icon {
        display: none;
      }

      .collapse-icon {
        display: block;
      }
    }
  }
</style>
