<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="accordion"
    role="tablist">
    <BCard
      no-body
      :class="cardClasses"
    >
      <header>
        <!-- @slot Accordion header -->
        <slot name="accordionHeader" />
      </header>
      <template
        v-for="(data, key) in items"
        :key="key">
        <!--
          triggered on click
          @event section-expanded
          @property {string} key item index
          @property {object} data item data
        -->
        <div
          :class="`border-top ${data.accordionItemClass ? data.accordionItemClass : ''}`"
          data-testid="accordion-item-wrapper"
          no-body
          @click="$emit('section-expanded', {key, data})">
          <BCardHeader
            :class="`pr-4 border-0 position-relative cursor-pointer ${headerClasses}`"
            role="tab"
            v-b-toggle="`accordion-${accordionGroup}-${key}`">
            <!-- @slot item header (shown while collapsed and expanded) -->
            <slot
              name="header"
              v-bind="{...data, index$:key}" />
          </BCardHeader>
          <BCollapse
            :id="`accordion-${accordionGroup}-${key}`"
            :accordion="accordionGroup"
            v-model="data.open$"
            v-on="$listeners"
            @show="emitAccordionState"
            @hide="emitAccordionState"
            role="tabpanel">
            <BCardBody
              class="pt-0">
              <!-- @slot item body (shown while expanded) -->
              <slot
                name="body"
                v-bind="{...data, index$:key}" />
            </BCardBody>
          </BCollapse>
        </div>
      </template>
    </BCard>
  </div>
</template>

<script>
import {
  BCard,
  BCardBody,
  BCardHeader,
  BCollapse,
} from 'bootstrap-vue';

/**
 * List that has a header and collapsible cards for each item
 */
export default {
  name: 'Accordion',
  components: {
    BCard,
    BCardBody,
    BCardHeader,
    BCollapse,
  },
  data() {
    return {
      wasOpen: false,
    };
  },
  props: {
    /**
     * The name of the accordion group used to group the collapsable elements
     */
    accordionGroup: {
      type: String,
      required: true,
    },
    /**
     * Used to build aria-labelledby for the card header element
     */
    ariaGroup: {
      type: String,
      default: 'accordion',
    },
    /**
     * Items contained in the list
     */
    items: {
      type: Array,
      required: true,
    },
    headerClasses: {
      type: String,
      default: '',
    },
    cardClasses: {
      type: String,
      default: '',
    },
  },
  mounted() {
    this.emitAccordionState();
  },
  methods: {
    /**
     * Calculate padding based on position of item and open state
     *
     * @param {Number} position index of list element
     * @param {Boolean} open is the list element expanded
     */
    padding(position, open) {
      if (open) {
        if (position === 0) {
          return 'mb-4';
        } if (position === this.items.length - 1) {
          return 'mt-4';
        }
        return 'my-4';
      }
      return '';
    },
    /**
     * Checks to see if any item is expanded and emits that value
     */
    emitAccordionState() {
      const isOpen = this.items.reduce((acc, cur) => acc || cur.open$, false);
      if (this.wasOpen !== isOpen) {
        this.wasOpen = isOpen;
        /**
         * On state change event for entire accordion. Open [boolean]
         *
         * @property {boolean} isOpen open state of accordion
         */
        this.$emit('open', isOpen);
      }
    },
  },
};
</script>

<style lang="scss">
.accordion {
  > .card:not(:first-of-type) {
    transition: margin 0.25s ease-in-out;

    > .card-header::after {
      top: 1.875rem;
      font-size: 1.25rem;
    }

    > .card-header {
      cursor: pointer;

      &.collapsed:hover {
        background-color: $table-hover-bg;
      }
    }

    .card-header:not([aria-expanded='true']):not([aria-expanded='false'])::after {
      display: none;
    }
  }

  > .card:not(:last-of-type) {
    border-bottom: 0;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
