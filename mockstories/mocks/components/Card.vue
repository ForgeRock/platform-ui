<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Card</h1>
                <p class="mb-4 lead">Cards are used to apply a container around a related grouping of information.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Basic Card</h2>
                    <p class="mb-5">Basic card should consist of an image or graphic, title and action.</p>
                    <div class="row">
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card h-100">
                                <div class="card-body text-center py-5">
                                    <img :src="require('@/assets/images/logos/fr-ds.svg')"
                                         alt="Generic OAuth2"
                                         class="mb-4"
                                         style="width: 48px;" />
                                    <h5 class="mb-3">Card Title</h5>
                                    <div class="text-muted">
                                        <small>Meta (optional)</small>
                                    </div>
                                </div>
                                <div class="card-footer text-center py-3">
                                    <a href="/">Action</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Linked Cards</h2>
                    <p class="mb-5">Linked cards have a hover treatment.</p>
                    <div class="row">
                        <div class="col-6 col-lg-4">
                            <a href="#" class="card" style="max-width: 20rem;">
                                <div class="card-body text-center">
                                  <img :src="require('@/assets/images/vertical-logo.svg')"
                                       alt="ForgeRock"
                                       class="my-4"
                                       style="width: 50px;" />
                                  <h5 class="card-title">Card title</h5>
                                </div>
                            </a>
                        </div>
                        <div class="col-6 col-lg-4">
                            <a href="#" class="card h-100">
                                <div class="card-header">
                                    <h5 class="m-0">Username &amp; Password</h5>
                                </div>
                                <div class="overflow-hidden bg-gray-200 p-3 d-flex align-items-center" style="height: 170px;">
                                    <img :src="require('@/assets/images/th-tree.svg')" alt="Thumbnail" class="w-100" />
                                </div>
                                <div class="card-body">
                                    Sign-in users using a username and password.
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Card Radio Group</h2>
                    <p class="mb-5">Turn cards into large radio buttons for use in wizards and step-by-step flows.</p>
                    <div class="row">
                        <div class="col-12 col-md-4">
                            <label>
                                <input type="radio" name="exampleOptions" value="option1" class="card-input-element" v-model="radioChecked">
                                <div class="card card-input mb-4">
                                    <div class="card-body text-center">
                                        <img :src="require('@/assets/images/vertical-logo.svg')"
                                             alt="ForgeRock"
                                             class="my-4"
                                             style="width: 50px;" />
                                        <h5 class="card-title">Option 1</h5>
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
                                           style="width: 50px;" />
                                      <h5 class="card-title">Option 2</h5>
                                    </div>
                                </div>
                            </label>
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
