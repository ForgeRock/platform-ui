<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Color</h1>
                <p class="mb-4 lead">Colors used in this system map to Bootstrap variables.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-4">Brand Colors</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="p-3 mb-2 bg-primary text-white">$primary</div>
                            <div class="p-3 mb-2 bg-secondary text-white">$secondary</div>
                            <div class="p-3 mb-2 bg-success text-white">$success</div>
                            <div class="p-3 mb-2 bg-yellow text-dark">$warning</div>
                            <div class="p-3 mb-2 bg-red text-white">$danger</div>
                            <div class="p-3 mb-2 bg-light text-dark">$light</div>
                            <div class="p-3 mb-2 bg-dark text-white">$dark</div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-4">Grays</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="p-3 mb-2 bg-gray-100 text-dark">$gray-100</div>
                            <div class="p-3 mb-2 bg-gray-200 text-dark">$gray-200</div>
                            <div class="p-3 mb-2 bg-gray-300 text-dark">$gray-300</div>
                            <div class="p-3 mb-2 bg-gray-400 text-dark">$gray-400</div>
                            <div class="p-3 mb-2 bg-gray-500 text-white">$gray-500</div>
                            <div class="p-3 mb-2 bg-gray-600 text-white">$gray-600</div>
                            <div class="p-3 mb-2 bg-gray-700 text-white">$gray-700</div>
                            <div class="p-3 mb-2 bg-gray-800 text-white">$gray-800</div>
                            <div class="p-3 mb-2 bg-gray-900 text-white">$gray-900</div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-4">Classes</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="p-3 mb-2 bg-primary text-white">.bg-primary</div>
                            <div class="p-3 mb-2 bg-secondary text-white">.bg-secondary</div>
                            <div class="p-3 mb-2 bg-success text-white">.bg-success</div>
                            <div class="p-3 mb-2 bg-danger text-white">.bg-danger</div>
                            <div class="p-3 mb-2 bg-warning text-white">.bg-warning</div>
                            <div class="p-3 mb-2 bg-info text-white">.bg-info</div>
                            <div class="p-3 mb-2 bg-light text-dark">.bg-light</div>
                            <div class="p-3 mb-2 bg-dark text-white">.bg-dark</div>
                            <div class="p-3 mb-2 bg-white text-dark">.bg-white</div>
                            <div class="mt-4">
                                <p class="text-primary">.text-primary</p>
                                <p class="text-secondary">.text-secondary</p>
                                <p class="text-success">.text-success</p>
                                <p class="text-danger">.text-danger</p>
                                <p class="text-warning">.text-warning</p>
                                <p class="text-info">.text-info</p>
                                <p class="text-light bg-dark">.text-light</p>
                                <p class="text-dark">.text-dark</p>
                                <p class="text-muted">.text-muted</p>
                                <p class="text-white">.text-white</p>
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
    name: 'Color',
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
