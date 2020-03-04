<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div class="mock">
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Popovers</h1>
                <p class="mb-4 lead">A popover is a non-modal dialog. The component should be paired with a clickable trigger element and contain at least one focusable element.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <div class="card">
                        <div class="card-body">
                            In progress...
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
    name: 'Popovers',
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
