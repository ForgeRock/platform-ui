<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Select</h1>
                <p class="mb-4 lead">Select element presents a menu of options.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Basic Select</h2>
                    <p class="mb-5">Selects use floating labels for a more streamlined layout.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <select class="custom-select" id="basicSelect" autofocus="autofocus" value="">
                                        <option disabled selected>Select an option</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                    <label for="basicSelect">Label</label>
                                </div>
                                <small id="basicInputHelp" class="form-text text-muted">Help text for this field.</small>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Disabled</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <select class="custom-select" id="disabledSelect" autofocus="autofocus" value="" disabled>
                                        <option disabled selected>Select an option</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                    <label for="disabledSelect">Label</label>
                                </div>
                                <small id="disabledInputHelp" class="form-text text-muted">Help text for this field.</small>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Invalid</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <select class="custom-select is-invalid" id="invalidSelect" autofocus="autofocus" value="">
                                        <option disabled selected>Select an option</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                    <label for="invalidSelect">Label</label>
                                </div>
                                <div class="invalid-feedback d-block">Please make a selection.</div>
                                <small id="invalidInputHelp" class="form-text text-muted">Help text for this field.</small>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </BContainer>
    </div>
</template>

<script>
import { BContainer } from 'bootstrap-vue';

export default {
    name: 'Select',
    data: function () {
        return {};
    },
    components: {
        BContainer
    },
    mounted () {},
    methods: {}
};
</script>
<style lang="scss"></style>
