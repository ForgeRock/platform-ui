<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Progress Indicator</h1>
                <p class="mb-4 lead">A progress indicator component communicates to the user the progress of a particular process.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Basic Progress Indicator</h2>
                    <p class="mb-5">Steps can be complete, active or default to indicate the state of the step.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="progress-indicator position-relative mx-5">
                                <ol class="list-unstyled d-flex justify-content-between" style="z-index: 1;">
                                    <li class="list-inline-item complete">
                                        <button class="btn-progress-marker" title="Step 1 - Completed">
                                            <i class="progress-icon material-icons md-14">check_circle</i>
                                            <span class="sr-only">Step 1 - Completed</span>
                                        </button>
                                    </li>
                                    <li class="list-inline-item complete">
                                        <button class="btn-progress-marker" title="Step 2 - Completed">
                                            <i class="progress-icon material-icons md-14">check_circle</i>
                                            <span class="sr-only">Step 2 - Completed</span>
                                        </button>
                                    </li>
                                    <li class="list-inline-item active">
                                        <button class="btn-progress-marker">
                                            <span class="sr-only">Step 3 - Active</span>
                                        </button>
                                    </li>
                                    <li class="list-inline-item">
                                        <button class="btn-progress-marker">
                                            <span class="sr-only">Step 4</span>
                                        </button></li>
                                    <li class="list-inline-item">
                                        <button class="btn-progress-marker">
                                            <span class="sr-only">Step 5</span>
                                        </button>
                                    </li>
                                </ol>
                                <div class="progress w-100" style="height: 4px;">
                                    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
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
    name: 'Card',
    data: function () {
        return {
            radioChecked: 'option1'
        };
    },
    components: {
        BContainer
    },
    mounted () {},
    methods: {}
};
</script>
