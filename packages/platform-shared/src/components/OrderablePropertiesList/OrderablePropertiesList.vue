<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      v-if="properties.length === 0"
      class="text-center mt-2 mb-4 pt-3 pb-4">
      <FrIcon
        icon-class="md-96 text-secondary opacity-20 mb-4"
        name="list" />
      <h3 class="h4">
        {{ $t('orderablePropertiesList.noPropertiesDefined') }}
      </h3>
      <p class="mb-5">
        {{ $t('orderablePropertiesList.noPropertiesDefinedSubtitle') }}
      </p>
      <BButton
        variant="primary"
        @click="$emit('show-add-modal');">
        <FrIcon
          icon-class="mr-2"
          name="add">
          {{ $t('orderablePropertiesList.addProperty') }}
        </FrIcon>
      </BButton>
    </div>
    <template v-else>
      <BButtonToolbar
        class="py-3 px-4">
        <div class="align-items-center">
          <BButton
            variant="primary"
            data-testid="btn-add-property"
            @click="$emit('show-add-modal');">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('orderablePropertiesList.addProperty') }}
            </FrIcon>
          </BButton>
        </div>
      </BButtonToolbar>
      <BTableSimple
        hover
        class="mb-0"
        tbody-tr-class="cursor-pointer"
        responsive>
        <BThead>
          <BTr>
            <BTh class="w-100px pr-0">
              <div class="d-flex justify-content-start">
                {{ $t('common.order') }}
              </div>
            </BTh>
            <BTh class="col-width-30">
              {{ $t('common.property') }}
            </BTh>
            <BTh>
              {{ $t('common.type') }}
            </BTh>
            <BTh>
              {{ $t('common.required') }}
            </BTh>
            <BTh class="col-width-15" />
          </BTr>
        </BThead>
        <Draggable
          id="properties-table"
          tag="tbody"
          v-model="orderedProperties"
          chosen-class="chosen-item"
          drag-class="drag-item"
          ghost-class="ghost-item"
          @end="onRowChange"
          item-key="name">
          <template #item="{ element }">
            <BTr
              class="cursor-pointer"
              :id="element.name || element.title"
              :key="element.name || element.title"
              @click="$emit('show-edit-modal', element)">
              <BTd>
                <FrIcon
                  icon-class="text-dark p-1 cursor-drag mr-2"
                  name="drag_indicator">
                  {{ element.order + 1 }}
                </FrIcon>
              </BTd>
              <BTd class="text-truncate">
                <div class="text-truncate">
                  {{ element.name || element.title }}
                </div>
                <small class="text-truncate text-body">
                  {{ element.key }}
                </small>
              </BTd>
              <BTd class="type-cell">
                {{ element.type && element.type.toLowerCase() }}
              </BTd>
              <BTd class="required-cell">
                <BBadge
                  v-if="element.required"
                  variant="success">
                  {{ $t('common.required') }}
                </BBadge>
              </BTd>
              <BTd>
                <FrActionsCell
                  class="py-2"
                  :edit-option="false"
                  :delete-option="false"
                  :divider="false"
                  :test-id="`property-${element.order}`">
                  <template #custom-top-actions>
                    <BDropdownItem
                      v-if="element.order !== 0"
                      @click.stop="moveProperty(element.order, element.order - 1)"
                      data-testid="move-up-btn">
                      <FrIcon
                        icon-class="mr-2"
                        name="arrow_upward">
                        {{ $t('orderablePropertiesList.moveUp') }}
                      </FrIcon>
                    </Bdropdownitem>
                    <BDropdownItem
                      v-if="element.order !== (orderedProperties.length - 1)"
                      @click.stop="moveProperty(element.order, element.order + 1)"
                      data-testid="move-down-btn">
                      <FrIcon
                        icon-class="mr-2"
                        name="arrow_downward">
                        {{ $t('orderablePropertiesList.moveDown') }}
                      </FrIcon>
                    </Bdropdownitem>
                    <BDropdownDivider v-if="orderedProperties.length > 1" />
                    <BDropdownItem
                      @click.stop="$emit('remove-property', element);"
                      data-testid="remove-btn">
                      <FrIcon
                        icon-class="mr-2"
                        name="delete">
                        {{ $t('common.remove') }}
                      </FrIcon>
                    </Bdropdownitem>
                  </template>
                </FrActionsCell>
              </BTd>
            </BTr>
          </template>
        </Draggable>
      </BTableSimple>
      <slot />
    </template>
  </div>
</template>

<script setup>
/**
 * Table that contains properties for an object type.
 * Supports add, edit, and delete
 */
import {
  BBadge,
  BButton,
  BDropdownItem,
  BDropdownDivider,
  BButtonToolbar,
  BTableSimple,
  BTd,
  BThead,
  BTh,
  BTr,
} from 'bootstrap-vue';
import Draggable from 'vuedraggable';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import {
  ref,
  watch,
} from 'vue';

Draggable.compatConfig = { MODE: 3 };

const emits = defineEmits([
  'show-add-modal',
  'show-edit-modal',
  'update-row-order',
]);

const props = defineProps({
  /**
   * Properties to display in table
   */
  properties: {
    type: Array,
    default: () => [],
  },
});

const orderedProperties = ref([]);

/**
 * Sorts properties by their order prop
 *
 * @param items to sort
 */
const sortProperties = (items) => {
  orderedProperties.value = items.sort((a, b) => a.order - b.order);
};

/**
 * On first load the list items may not have the order property. In that case we
 * need to add it
 */
const orderTable = () => {
  if (props.properties[0]?.order === undefined) {
    orderedProperties.value = props.properties;
    orderedProperties.value.forEach((prop, index) => {
      prop.order = index;
    });
    emits('update-row-order', orderedProperties.value);
  } else {
    sortProperties(props.properties);
  }
};

/**
 * Take the re-ordered list, and assign new order property to match
 */
const onRowChange = () => {
  orderedProperties.value.forEach((prop, index) => {
    prop.order = index;
  });
  emits('update-row-order', orderedProperties.value);
};

/**
 * Moves a property in the list the same way dragging an dropping would. Allows
 * the list to be keyboard accessibile
 *
 * @param fromIndex the index the item is being moved from
 * @param toIndex the index the item is moving to
 */
const moveProperty = (fromIndex, toIndex) => {
  if (toIndex >= 0 && toIndex < orderedProperties.value.length) {
    const element = orderedProperties.value[fromIndex];
    orderedProperties.value.splice(fromIndex, 1);
    orderedProperties.value.splice(toIndex, 0, element);

    onRowChange();
  }
};

// Watch for changes in the properties prop such as new items being added or
// items being deleted in order to keep up to date
watch(() => props.properties, (newVal) => {
  sortProperties(newVal);
  onRowChange();
}, { deep: true });

// On load
orderTable();

</script>

<style lang="scss" scoped>
:deep {
  .col-width-15 {
    width: 15%;
  }

  .col-width-30 {
    width: 30%;
  }

  #properties-table {
    .chosen-item {
      background-color: $white;
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }

    .ghost-item {
      opacity: 0.5;
      background-color: $light-blue;
    }

    .cursor-drag {
      cursor: move; /* fallback if grab cursor is unsupported */
      cursor: grab;
      cursor: -moz-grab;
      cursor: -webkit-grab;
    }

    .type-cell {
      text-transform: capitalize;
    }

    .required-cell .badge{
      width: 100px;
    }
  }
}
</style>
