<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Checkbox</h1>
        <p class="mb-4 lead">A checkable input that communicates if an option is true, false or indeterminate.</p>
      </BContainer>
    </div>
    <BContainer>
      <template>
        <section class="sg_pattern">
          <h2>Basic Checkbox</h2>
          <p class="mb-5">Inputs use floating labels for a more streamlined layout.</p>
          <div class="card">
            <div class="card-body">
              <BFormCheckbox
                id="checkbox-1"
                name="checkbox-1">
                Check it out
              </BFormCheckbox>
              <BFormCheckbox
                id="checkbox-2"
                name="checkbox-2"
                v-model="checked">
                Check it out
              </BFormCheckbox>
            </div>
          </div>
        </section>
        <section class="sg_pattern">
          <h2>Stacked Checkboxes</h2>
          <p class="mb-5">In most cases use a stacked layout for checkboxes.</p>
          <div class="card">
            <div class="card-body">
              <BFormGroup label="Form-checkbox-group stacked checkboxes">
                <BFormCheckbox-group
                  v-model="selected"
                  :options="options"
                  name="flavour-2a"
                  stacked
                ></BFormCheckbox-group>
              </BFormGroup>
            </div>
          </div>
        </section>
        <section class="sg_pattern">
          <h2>Inline Checkboxes</h2>
          <p class="mb-5">In specialized use cases an inline layout can be used.</p>
          <div class="card">
            <div class="card-body">
              <BFormGroup label="Form-checkbox-group inline checkboxes (default)">
                <BFormCheckbox-group
                  v-model="selected"
                  :options="options"
                  name="flavour-1a"
                ></BFormCheckbox-group>
              </BFormGroup>
            </div>
          </div>
        </section>
      </template>
    </BContainer>
  </div>
</template>

<script>
import { 
  BContainer,
  BFormGroup,
  BFormCheckboxGroup,
  BFormCheckbox
 } from 'bootstrap-vue';

export default {
  name: 'Checkbox',
  data: function () {
    return {
      checked: true,
      selected: [], // Must be an array reference!
      options: [
        { text: 'Orange', value: 'orange' },
        { text: 'Apple', value: 'apple' },
        { text: 'Pineapple', value: 'pineapple' },
        { text: 'Grape', value: 'grape' }
      ]
    };
  },
  components: {
    BContainer,
    BFormGroup,
    BFormCheckboxGroup,
    BFormCheckbox
  },
  mounted () {},
  methods: {}
};
</script>
<style lang="scss"></style>
