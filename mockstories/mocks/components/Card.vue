<template>
    <div>
        <div class="sg_masthead">
            <b-container>
                <h1 class="display-4">Card</h1>
                <p class="mb-4 lead">Cards are used to apply a container around a related grouping of information.</p>
            </b-container>
        </div>
        <b-container>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Basic Card</h2>
                    <div class="row">
                        <div class="col-12 col-lg-4">
                            <div class="card" style="max-width:20rem;">
                                <div class="card-body">
                                  <h4 class="card-title">Card title</h4>
                                  <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                  <a href="#" class="btn btn-primary">Go somewhere</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Linked Card</h2>
                    <div class="row">
                        <div class="col-12 col-lg-4">
                            <a href="#" class="card" style="max-width:20rem;">
                                <div class="card-body text-center">
                                  <img :src="require('@/assets/images/vertical-logo.svg')"
                                       alt="ForgeRock"
                                       class="my-4"
                                       style="width:50px;" />
                                  <h5 class="card-title">Card title</h5>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Card Radio Group</h2>
                    <div class="row">
                        <div class="col-12 col-md-4">
                            <label>
                                <input type="radio" name="exampleOptions" value="option1" class="card-input-element" v-model="radioChecked">
                                <div class="card card-input mb-4">
                                    <div class="card-body text-center">
                                        <img :src="require('@/assets/images/vertical-logo.svg')"
                                             alt="ForgeRock"
                                             class="my-4"
                                             style="width:50px;" />
                                        <h6 class="card-title">Option 1</h6>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div class="col-12 col-md-4">
                            <label>
                                <input type="radio" name="exampleOptions" value="option2" class="card-input-element" v-model="radioChecked">
                                <div class="card card-input mb-4">
                                    <div class="card-body text-center">
                                      <img :src="require('@/assets/images/vertical-logo.svg')"
                                           alt="ForgeRock"
                                           class="my-4"
                                           style="width:50px;" />
                                      <h6 class="card-title">Option 2</h6>
                                    </div>
                                </div>
                            </label>
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
<style lang="scss"></style>
