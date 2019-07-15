<template>
    <div>
        <div class="sg_masthead">
            <b-container>
                <h1 class="display-4">Tabs</h1>
                <p class="mb-4 lead">Use tabs to keep related content in a single container that is shown and hidden through navigation.</p>
            </b-container>
        </div>
        <b-container>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Tabs</h2>
                    <div class="card">
                        <div class="card-body">
                            <b-tabs content-class="mt-3">
                                <b-tab title="First" active><p>I'm the first tab</p></b-tab>
                                <b-tab title="Second"><p>I'm the second tab</p></b-tab>
                                <b-tab title="Third"><p>I'm the third tab</p></b-tab>
                            </b-tabs>
                        </div>
                    </div>
                </section>
            </template>
        </b-container>
    </div>
</template>

<script>
import { BContainer, BTab, BTabs } from 'bootstrap-vue';

export default {
    name: 'Tabs',
    data: function () {
        return {};
    },
    components: {
        BContainer,
        BTab,
        BTabs
    },
    mounted () {},
    methods: {}
};
</script>
<style lang="scss"></style>
