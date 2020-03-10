/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { BCardBody, BCardFooter, BContainer } from 'bootstrap-vue';
import shieldLogo from '@/assets/images/shield.svg';
import CenterCard from './index';

const stories = storiesOf('Components|CenterCard', module).addParameters({ component: CenterCard });
stories.addDecorator(withKnobs);

const template = `
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">
          Card
        </h1>
        <p class="mb-4 lead">
          Cards are used to apply a container around a related grouping of information.
        </p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>With Default Logo</h2>
        <p class="mb-5">
          Centered Card contains a ForgeRock logo
        </p>
        <div class="row">
          <div class="col">
            <FrCenterCard :hideLogo="false">
              <template v-slot:center-card-header>
                <h1>Header</h1>
              </template>
              <template v-slot:center-card-body>Body</template>
              <template v-slot:center-card-footer>Footer</template>
            </FrCenterCard>
          </div>
        </div>
      </section>
      <section class="sg_pattern">
        <h2>With Custom Logo</h2>
        <p class="mb-5">
          Centered Card contains a ForgeRock logo
        </p>
        <div class="row">
          <div class="col">
            <FrCenterCard :hideLogo="false" :logoPath="logoPath">
              <template v-slot:center-card-header>
                <h1>Header</h1>
              </template>
              <template v-slot:center-card-body>Body</template>
              <template v-slot:center-card-footer>Footer</template>
            </FrCenterCard>
          </div>
        </div>
      </section>
      <section class="sg_pattern">
        <h2>Without Logo</h2>
        <p class="mb-5">
          Centered Card does not contain a ForgeRock logo
        </p>
        <div class="row">
          <div class="col">
            <FrCenterCard :hideLogo="true">
              <template v-slot:center-card-header>
                <h1>Header</h1>
              </template>
              <template v-slot:center-card-body>Body</template>
              <template v-slot:center-card-footer>Footer</template>
            </FrCenterCard>
          </div>
        </div>
      </section>
      <section class="sg_pattern">
        <h2>Without Header &amp; Footer</h2>
        <p class="mb-5">
          Centered Card does not contain a ForgeRock logo
        </p>
        <div class="row">
          <div class="col">
            <FrCenterCard :hideLogo="true" hideHeader="true" hideFooter="true">
              <template v-slot:center-card-header>
                <h1>Header</h1>
              </template>
              <template v-slot:center-card-body>This is a card with header and footer set to hide.</template>
              <template v-slot:center-card-footer>Footer</template>
            </FrCenterCard>
          </div>
        </div>
      </section>
    </BContainer>
  </div>
`;

stories.add('Default CenterCard', () => ({
  components: {
    FrCenterCard: CenterCard,
    BCardBody,
    BCardFooter,
    BContainer,
  },
  template,
  props: {
    logoPath: {
      type: String,
      default: shieldLogo,
    },
    showLogo: {
      type: Boolean,
      default: boolean('showLogo', false),
    },
  },
}));
