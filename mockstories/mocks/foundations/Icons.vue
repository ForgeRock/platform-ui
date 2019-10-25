<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Icons</h1>
                <p class="mb-4 lead">Icons used in this system.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Icons</h2>
                    <p class="mb-5">Use <a href="https://material.io/tools/icons/?icon=more_horiz&style=outline">Material Design outlined icons</a>.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">dashboard</i>
                                </div>
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">apps</i>
                                </div>
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">group</i>
                                </div>
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">fingerprint</i>
                                </div>
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">email</i>
                                </div>
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">assignment</i>
                                </div>
                                <div class="col-1 text-center">
                                    <i class="material-icons material-icons-outlined">settings</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Icon Sizes</h2>
                    <div class="card">
                        <div class="card-body">
                          <div class="row">
                              <div class="col-1 text-center">
                                  <i class="material-icons material-icons-outlined md-18">camera</i>
                              </div>
                              <div class="col-1 text-center">
                                  <i class="material-icons material-icons-outlined md-24">camera</i>
                              </div>
                              <div class="col-1 text-center">
                                  <i class="material-icons material-icons-outlined md-36">camera</i>
                              </div>
                              <div class="col-1 text-center">
                                  <i class="material-icons material-icons-outlined md-48">camera</i>
                              </div>
                          </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Flag Icons</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-1 text-center">
                                    <span class="flag-icon flag-icon-us"></span>
                                </div>
                                <div class="col-1 text-center">
                                    <span class="flag-icon flag-icon-gb"></span>
                                </div>
                                <div class="col-1 text-center">
                                    <span class="flag-icon flag-icon-eu"></span>
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
