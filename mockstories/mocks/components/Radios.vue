<template>
    <div>
        <div class="sg_masthead">
            <b-container>
                <h1 class="display-4">Radios</h1>
                <p class="mb-4 lead">A select list that can have a single entry checked at any one time.</p>
            </b-container>
        </div>
        <b-container>
            <template>
                <section class="sg_pattern">
                    <h2>Radio Group</h2>
                    <p class="mb-5">Radio buttons are shown in a group of two or more. The user can only select one radio button at a time.</p>
                    <div class="card">
                        <div class="card-body">
                          <b-form-group label="Individual radios">
                              <b-form-radio v-model="selected" name="some-radios" value="A">Option A</b-form-radio>
                              <b-form-radio name="some-radios" value="B">Option B</b-form-radio>
                          </b-form-group>
                        </div>
                    </div>
                </section>
            </template>
        </b-container>
    </div>
</template>

<script>
import { BContainer, BFormRadio } from 'bootstrap-vue';

export default {
    name: 'Radios',
    data: function () {
        return {
            selected: 'A'
        };
    },
    components: {
        BContainer,
        BFormRadio
    },
    mounted () {},
    methods: {}
};
</script>
<style lang="scss"></style>
