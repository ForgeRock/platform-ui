<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Spinner</h1>
                <p class="mb-4 lead">Spinners are loading indicators that should be shown when retrieving data or performing slow computations. </p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Large Spinner</h2>
                    <p class="mb-5">Use a large spinner to indicate a card or page load.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="spinner-border text-primary" style="width: 10rem; height: 10rem;" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Inline spinner</h2>
                    <p class="mb-5">Use a small spinner when displaying in a data table or smaller area.</p>
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="spinner-border text-primary" style="width: 1rem; height: 1rem;" role="status">
                                <span class="sr-only">Loading...</span>
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
    name: 'ProgressBar',
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
