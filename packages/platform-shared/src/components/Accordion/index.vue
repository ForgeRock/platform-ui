<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="accordion"
    role="tablist">
    <BCard
      no-body>
      <!-- @slot Accordion header. -->
      <slot name="accordionHeader" />
    </BCard>
    <template v-for="(data, key) in items">
      <BCard
        :class="padding(key, data.open)"
        :key="key"
        no-body
        role="tab">
        <BCardHeader
          class="pr-4 border-0 position-relative"
          role="tab"
          v-b-toggle="`accordion-${accordionGroup}-${key}`">
          <!-- @slot Item array header. -->
          <slot
            name="header"
            v-bind="data" />
        </BCardHeader>
        <BCollapse
          :id="`accordion-${accordionGroup}-${key}`"
          :accordion="accordionGroup"
          v-model="data.open"
          v-on="$listeners"
          @show="emitAccordionState"
          @hide="emitAccordionState"
          role="tabpanel">
          <BCardBody
            class="pt-0">
            <!-- @slot Item array body. -->
            <slot
              name="body"
              v-bind="data" />
          </BCardBody>
        </BCollapse>
      </BCard>
    </template>
  </div>
</template>

<script>
import {
  BCard,
  BCardBody,
  BCardHeader,
  BCollapse,
} from 'bootstrap-vue';

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
    accordionGroup: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      default() {
        return [{
          open: false,
        }];
      },
      required: true,
    },
  },
  mounted() {
    this.emitAccordionState();
  },
  methods: {
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
    emitAccordionState() {
      const isOpen = this.items.reduce((acc, cur) => acc || cur.open, false);
      if (this.wasOpen !== isOpen) {
        this.wasOpen = isOpen;
        /**
        * On state change event for entire accordion. Open [boolean]
        *
        * @event open
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
  > .card {
    transition: margin 0.25s ease-in-out;

    > .card-header::after {
      top: 1.875rem;
      font-size: 1.25rem;
    }
  }

  > .card:not(:last-of-type) {
    border-bottom: 0;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
