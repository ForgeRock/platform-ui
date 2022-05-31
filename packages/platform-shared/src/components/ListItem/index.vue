<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="collapsible"
    class="collapsible">
    <BListGroupItem
      href="#"
      :class="[{'list-item-cursor': collapsible===false}]"
      v-b-toggle="toggleId">
      <div class="media">
        <!-- @slot List header. Clicking can collapse body based on collapsible prop. -->
        <slot name="list-item-header" />
      </div>
    </BListGroupItem>

    <BCollapse
      :id="id"
      :visible="panelShown"
      @hide="$emit('hide')"
      @show="$emit('show')"
      @hidden="$emit('hidden')"
      @shown="$emit('shown')">
      <BCardBody class="pt-3">
        <!-- @slot Body of list item. Can collapse based on collapsible prop. -->
        <slot name="list-item-collapse-body" />
      </BCardBody>
    </BCollapse>
  </div>

  <div
    v-else
    @click="$emit('row-click')"
    :class="[{'fr-hover-item': hoverItem, 'fr-clickable-item': clickable}]">
    <BListGroupItem class="noncollapse">
      <div class="media">
        <slot name="list-item-header" />
      </div>
    </BListGroupItem>

    <BCardBody
      v-if="panelShown"
      class="pt-3">
      <slot name="list-item-collapse-body" />
    </BCardBody>
  </div>
</template>

<script>
import {
  BCardBody,
  BCollapse,
  BListGroupItem,
  VBToggle,
} from 'bootstrap-vue';
import Vue from 'vue';

Vue.directive('b-toggle', VBToggle);
/**
 * Used in conjunction with ListGroup.vue, this is the individual item in each list display.
 * */
export default {
  name: 'ListItem',
  components: {
    BCardBody,
    BCollapse,
    BListGroupItem,
  },
  props: {
    /**
     * Enables collapsing of panel.
     */
    collapsible: {
      type: Boolean,
      default: false,
    },
    /**
     * Toggle visibility of panel.
     */
    panelShown: {
      type: Boolean,
      default: false,
    },
    /**
     * Use pointer cursor for hovering when collapsible is false.
     */
    hoverItem: {
      type: Boolean,
      default: false,
    },
    /**
     * Use CSS styling to indicate item is clickable
     */
    clickable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      id: null,
    };
  },
  beforeMount() {
    // eslint-disable-next-line no-underscore-dangle
    this.id = `listItem${this._uid}`;
  },
  computed: {
    toggleId() {
      if (this.collapsible) {
        return this.id;
      }
      return null;
    },
  },
};
</script>
<style lang="scss" scoped>
.media {
  height: 38px;

  & > * {
    align-self: center;
  }
}

.list-item-cursor {
  cursor: default;
}

.fr-hover-item {
  position: relative;

  &:hover {
    cursor: pointer;

    .list-group-item {
      background-color: $fr-hover-list-color;
      border-right: 1px;
    }
  }
}

.fr-clickable-item {
  .list-group-item {
    &:hover {
      cursor: pointer;
    }
  }
}

.list-group-item {
  &:hover {
    cursor: default;
  }
}

.collapsible:last-of-type > .list-group-item.collapsed {
  border-bottom-right-radius: $border-radius;
  border-bottom-left-radius: $border-radius;
  border-bottom: 1px solid $border-color;
}

.noncollapse,
.list-group-item-action:not(.collapsed) {
  background-color: $card-bg;
  cursor: initial;
}

::v-deep .list-group-item-action {
  color: inherit;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  margin: 0;

  .caret {
    .caret-up {
      display: none;
    }
  }

  .meta {
    line-height: 1.2;
  }

  .btn-cancel {
    display: none;
  }

  .btn-edit {
    display: block;
  }

  &:not(.collapsed) {
    button {
      display: block;
    }

    .btn-cancel {
      display: block;
    }

    .btn-edit {
      display: none;
    }

    .caret {
      .caret-up {
        display: block;
      }

      .caret-down {
        display: none;
      }
    }
  }
}

.card-body {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.125);
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  background-color: white;
}

.card > .list-group .list-group-item {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.125);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}
</style>
