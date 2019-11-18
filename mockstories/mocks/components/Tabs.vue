<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Tabs</h1>
                <p class="mb-4 lead">Use tabs to keep related content in a single container that is shown and hidden through navigation.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Tabs</h2>
                    <div class="card">
                        <div class="card-body">
                            <BTabs content-class="mt-3">
                                <BTab title="First" active><p>I'm the first tab</p></BTab>
                                <BTab title="Second"><p>I'm the second tab</p></BTab>
                                <BTab title="Third"><p>I'm the third tab</p></BTab>
                            </BTabs>
                        </div>
                    </div>
                </section>
            </template>
        </BContainer>
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
