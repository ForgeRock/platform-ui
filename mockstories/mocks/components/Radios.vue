<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div class="mock">
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Radios</h1>
                <p class="mb-4 lead">A select list that can have a single entry checked at any one time.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Radio Group</h2>
                    <p class="mb-5">Radio buttons are shown in a group of two or more. The user can only select one radio button at a time.</p>
                    <div class="card">
                        <div class="card-body">
                          <BFormGroup label="Individual radios">
                              <BFormRadio v-model="selected" name="some-radios" value="A">Option A</BFormRadio>
                              <BFormRadio name="some-radios" value="B">Option B</BFormRadio>
                          </BFormGroup>
                        </div>
                    </div>
                </section>
            </template>
        </BContainer>
    </div>
</template>

<script>
import {
  BContainer,
  BFormGroup,
  BFormRadio
} from 'bootstrap-vue';

export default {
  name: 'Radios',
  data: function () {
    return {
      selected: 'A'
    };
  },
  components: {
    BContainer,
    BFormGroup,
    BFormRadio
  },
  mounted () {},
  methods: {}
};
</script>
