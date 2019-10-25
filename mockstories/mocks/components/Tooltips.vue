<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Tooltips</h1>
                <p class="mb-4 lead">A Tooltip is a small piece of contextual information about an element on the screen, which is displayed when a user hovers or focuses on the element it is describing. It is not focusable and cannot contain focusable content.</p>
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
    name: 'Tooltips',
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
