/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';
import {
  BButton, BCard,
} from 'bootstrap-vue';
import Accordion from './index';

const stories = storiesOf('Components|Accordions', module).addParameters({ component: Accordion });
stories.addDecorator(withKnobs);

const template = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Accordion</h1>
    <p class="mb-4 lead">Basic input field with Bootstrap Button Input Group functionality</p>
  </div>
  <div class="container">
    <section class="sg_pattern">
      <FrAccordion
        class="mb-4"
        :items="items"
        @open="handleOpen"
        accordionGroup="trustedDevices">
        <template v-slot:accordionHeader>
          <div class="p-4">
            <h4>Trusted Devices</h4>
            <p class="m-0">Devices that have accessed your account.</p>
          </div>
        </template>
        <template v-slot:header=slotData>
          <div class="row align-items-center">
            <div class="col-md-5">
              <div class="media align-items-center">
                <div class="media-body">
                  <h5 class="mb-0">{{slotData.device}}</h5>
                  <small v-if=slotData.open class="text-muted">
                    <a target="_self" href="#" class="">Edit</a>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:body=slotData>
          <dl>
            <dt>
              <small>Operating System</small>
            </dt>
            <dd class="mb-3">{{slotData.os}}</dd>
            <dt>
              <small>Browser</small>
            </dt>
            <dd class="mb-3">{{slotData.browser}}</dd>
            <dt>
              <small>CPU</small>
            </dt>
            <dd>{{slotData.cpu}}</dd>
          </dl>
        </template>
      </FrAccordion>
      <BCard>
        <BButton v-b-toggle="'accordion-trustedDevices-0'">Toggle Via ID</BButton>
        <p>State change: {{this.stateChange}}</p>
      </BCard>
    </section>
  </div>
</div>
`;

stories.add('Accordion variants', () => ({
  components: {
    BButton,
    BCard,
    FrAccordion: Accordion,
  },
  template,
  data() {
    return {
      items: [
        {
          device: 'Mac', os: 'Mac OS 10.15', browser: 'Chrome 80.0', cpu: 'MacIntel, 8 Cores',
        },
        {
          device: 'iPhone', os: 'iOS 13.3', browser: 'Chrome 80.0', cpu: 'iPhone', open: true,
        },
        {
          device: 'Pixel', os: 'Android 10.0', browser: 'Chrome 81.0',
        },
      ],
      stateChange: null,
    };
  },
  methods: {
    handleOpen(open) {
      this.stateChange = open ? 'Has a tab open' : 'Has no tabs open';
    },
  },
}));
