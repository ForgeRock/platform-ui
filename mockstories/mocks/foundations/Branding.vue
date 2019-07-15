<template>
    <div>
        <div class="sg_masthead">
            <b-container>
                <h1 class="display-4">Branding</h1>
                <p class="mb-4 lead">Brand assets used in this system.</p>
            </b-container>
        </div>
        <b-container>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Logos</h2>
                    <div class="row">
                        <div class="col-12">
                            <div class="card mb-5">
                                <div class="card-body d-flex align-items-center justify-content-center" style="height: 300px;">
                                    <img src="images/horizontal-logo.svg" alt="ForgeRock" class="w-100 py-5" />
                                </div>
                                <div class="card-footer border-top">
                                    <h5 class="text-muted">Horizontal Logo</h5>
                                    <p class="mb-0">src/assets/images/horizontal-logo.svg</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="card bg-dark mb-5">
                                <div class="card-body d-flex align-items-center justify-content-center" style="height: 300px;">
                                    <img src="images/horizontal-logo-white.svg" alt="ForgeRock" class="w-100 py-5" />
                                </div>
                                <div class="card-footer">
                                    <h5 class="text-white">Horizontal Logo (on dark)</h5>
                                    <p class="mb-0 text-light">src/assets/images/horizontal-logo-white.svg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <div class="card mb-5">
                                <div class="card-body d-flex align-items-center justify-content-center" style="height: 300px;">
                                    <img src="images/vertical-logo.svg" alt="ForgeRock" />
                                </div>
                                <div class="card-footer border-top">
                                    <h5 class="text-muted">Vertical Logo</h5>
                                    <p class="mb-0">src/assets/images/vertical-logo.svg</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card bg-dark">
                                <div class="card-body d-flex align-items-center justify-content-center" style="height: 300px;">
                                    <img src="images/vertical-logo-white.svg" alt="ForgeRock" />
                                </div>
                                <div class="card-footer">
                                    <h5 class="text-white">Vertical Logo (on dark)</h5>
                                    <p class="mb-0 text-light">src/assets/images/vertical-logo-white.svg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Default Avatar</h2>
                    <div class="card">
                        <div class="card-body">
                            <img src="images/avatar.png" alt="Ferne Romero" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                        </div>
                    </div>
                </section>
            </template>
        </b-container>
    </div>
</template>

<script>
import { BContainer } from 'bootstrap-vue';

export default {
    name: 'Typography',
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
