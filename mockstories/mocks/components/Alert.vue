<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Alerts</h1>
        <p class="mb-4 lead">Provide contextual feedback messages for typical user actions with the handful of available and flexible alert messages.</p>
      </BContainer>
    </div>
    <BContainer>
      <template>
        <section class="sg_pattern">
          <h2>On-page alerts</h2>
          <p class="mb-5">Use on-page alerts for page-level warnings and information text.</p>
          <div class="alert alert-success " role="alert">
            <div class="media">
              <i class="material-icons material-icons-outlined mr-3">check_circle</i>
              <div class="media-body">
                This is a success alert—check it out!
              </div>
            </div>
          </div>
          <div class="alert alert-danger " role="alert">
            <div class="media">
              <i class="material-icons material-icons-outlined mr-3">error_outline</i>
              <div class="media-body">
                This is a danger alert—check it out!
              </div>
            </div>
          </div>
          <div class="alert alert-warning " role="alert">
            <div class="media">
              <i class="material-icons material-icons-outlined mr-3">warning</i>
              <div class="media-body">
                This is a warning alert—check it out!
              </div>
            </div>
          </div>
          <div class="alert alert-info " role="alert">
            <div class="media">
              <i class="material-icons material-icons-outlined mr-3">info</i>
              <div class="media-body">
                This is an info alert—check it out!
              </div>
            </div>
          </div>
        </section>


        <section class="sg_pattern">
          <h2>Toasts</h2>
          <p class="mb-5">Use toasts to display short confirmation messages that an action has taken place. For longer messages, use on-page alert.</p>
          <div class="alert alert-success alert-dismissible col-xs-11 col-sm-4" role="alert">
            <div class="media">
              <i class="material-icons material-icons-outlined mr-3">check_circle</i>
              <div class="media-body">
                This is a success toast!
              </div>
              <button aria-label="Close" class="close" data-dismiss="alert" type="button">
                <span aria-hidden="true">
                  &times;
                </span>
              </button>
            </div>
          </div>
          <div class="alert alert-danger alert-dismissible col-xs-11 col-sm-4" role="alert">
            <div class="media">
              <i class="material-icons material-icons-outlined mr-3">error_outline</i>
              <div class="media-body">
                This is a failure toast!
              </div>
              <button aria-label="Close" class="close" data-dismiss="alert" type="button">
                <span aria-hidden="true">
                  &times;
                </span>
              </button>
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
  data: () => {
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
