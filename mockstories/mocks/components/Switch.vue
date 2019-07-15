<template>
    <div>
        <div class="sg_masthead">
            <b-container>
                <h1 class="display-4">Switch</h1>
                <p class="mb-4 lead">Switches toggle the state of a single setting on or off.</p>
            </b-container>
        </div>
        <b-container>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Switch</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <b-form-checkbox name="check-button" switch>
                                    Toggle this switch element
                                </b-form-checkbox>
                            </div>
                            <div class="form-group">
                                <b-form-checkbox v-model="checked" name="check-button" switch>
                                    Toggle this switch element
                                </b-form-checkbox>
                            </div>
                            <div class="form-group">
                                <b-form-checkbox name="check-button" switch disabled>
                                    Disabled switch
                                </b-form-checkbox>
                            </div>
                            <div class="form-group">
                                <b-form-checkbox v-model="checked2" name="check-button" switch disabled>
                                    Disabled and selected switch
                                </b-form-checkbox>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </b-container>
    </div>
</template>

<script>
import { BContainer, BFormCheckbox } from 'bootstrap-vue';

export default {
    name: 'Switch',
    data: function () {
        return {
            checked: true,
            checked2: true
        };
    },
    components: {
        BContainer,
        BFormCheckbox
    },
    mounted () {},
    methods: {}
};
</script>
<style lang="scss"></style>
