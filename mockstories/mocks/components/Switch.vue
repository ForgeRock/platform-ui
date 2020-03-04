<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div class="mock">
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Switch</h1>
                <p class="mb-4 lead">Switches toggle the state of a single setting on or off.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Switch</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <BFormCheckbox name="check-button" switch>
                                    Toggle this switch element
                                </BFormCheckbox>
                            </div>
                            <div class="form-group">
                                <BFormCheckbox v-model="checked" name="check-button" switch>
                                    Toggle this switch element
                                </BFormCheckbox>
                            </div>
                            <div class="form-group">
                                <BFormCheckbox name="check-button" switch disabled>
                                    Disabled switch
                                </BFormCheckbox>
                            </div>
                            <div class="form-group">
                                <BFormCheckbox v-model="checked2" name="check-button" switch disabled>
                                    Disabled and selected switch
                                </BFormCheckbox>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </BContainer>
    </div>
</template>

<script>
import { BContainer, BFormCheckbox } from 'bootstrap-vue';

export default {
    name: 'FrSwitch',
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
