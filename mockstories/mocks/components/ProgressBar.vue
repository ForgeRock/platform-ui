<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Progress Bar</h1>
                <p class="mb-4 lead">A progress bar component communicates to the user the progress of a particular process.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Basic Progress Bar</h2>
                    <p class="mb-5">Basic progress bar shows the static state of a process. It does not progress until the user takes an action.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Active Progress Bar</h2>
                    <p class="mb-5">Active progress bar shows an process and will progress on it's own until process is complete.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="progress mb-2">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <p class="text-muted m-0">Status message</p>
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
<style lang="scss"></style>
