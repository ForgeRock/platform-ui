<template>
    <div>
        <div class="sg_masthead">
            <b-container>
                <h1 class="display-4">Checkbox</h1>
                <p class="mb-4 lead">A checkable input that communicates if an option is true, false or indeterminate.</p>
            </b-container>
        </div>
        <b-container>
            <template>
                <section class="sg_pattern">
                    <h2>Basic Checkbox</h2>
                    <p class="mb-5">Inputs use floating labels for a more streamlined layout.</p>
                    <div class="card">
                        <div class="card-body">
                            <b-form-checkbox
                              id="checkbox-1"
                              name="checkbox-1"
                            >
                              Check it out
                            </b-form-checkbox>
                            <b-form-checkbox
                              id="checkbox-2"
                              name="checkbox-2"
                              v-model="checked"
                            >
                              Check it out
                            </b-form-checkbox>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Stacked Checkboxes</h2>
                    <p class="mb-5">In most cases use a stacked layout for checkboxes.</p>
                    <div class="card">
                        <div class="card-body">
                            <b-form-group label="Form-checkbox-group stacked checkboxes">
                                <b-form-checkbox-group
                                  v-model="selected"
                                  :options="options"
                                  name="flavour-2a"
                                  stacked
                                ></b-form-checkbox-group>
                            </b-form-group>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Inline Checkboxes</h2>
                    <p class="mb-5">In specialized use cases an inline layout can be used.</p>
                    <div class="card">
                        <div class="card-body">
                            <b-form-group label="Form-checkbox-group inline checkboxes (default)">
                                <b-form-checkbox-group
                                  v-model="selected"
                                  :options="options"
                                  name="flavour-1a"
                                ></b-form-checkbox-group>
                            </b-form-group>
                        </div>
                    </div>
                </section>
            </template>
        </b-container>
    </div>
</template>

<script>
import { BContainer, BFormCheckboxGroup, BFormCheckbox } from 'bootstrap-vue';

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
        BFormCheckboxGroup,
        BFormCheckbox
    },
    mounted () {},
    methods: {}
};
</script>
<style lang="scss"></style>
