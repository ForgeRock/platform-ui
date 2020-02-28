/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, text } from '@storybook/addon-knobs';
import ListGroup from './index';
import ListItem from '../ListItem/index';

const stories = storiesOf('Components|Lists|ListGroup', module).addParameters({ component: ListGroup });

stories.addDecorator(withKnobs);
const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <h1 class="display-4">ListGroup</h1>
    </div>
    <FrListGroup
      :title="title"
      :subtitle="subtitle">
    </FrListGroup>

    <div class="sg_masthead">
      <h1 class="display-4">ListGroup with Custom Header</h1>
    </div>
    <FrListGroup
      :title="title"
      :subtitle="subtitle">
      <template v-slot:list-group-header>
        <div class="pl-3">
          <img src="images/id-card.svg" />
          <h4 style="display: inline" class="pl-2">{{title}}</h4>
          - {{subtitle}}
        </div>
      </template>
    </FrListGroup>
    
    <div class="sg_masthead">
      <h1 class="display-4">ListGroup with ListItems</h1>
    </div>
    <FrListGroup
      :title="title"
      :subtitle="subtitle">
      <FrListItem
        :collapsible="true"
        :panelShown="true"
        :hoverItem="false">
        <template v-slot:list-item-header>
          Item 1
        </template>
        <template v-slot:list-item-collapse-body>
            Additional info
        </template>
      </FrListItem>
      <FrListItem
        :collapsible="true"
        :panelShown="false"
        :hoverItem="false">
        <template v-slot:list-item-header>
          Item 2
        </template>
        <template v-slot:list-item-collapse-body>
            Additional info
        </template>
      </FrListItem>
    </FrListGroup>
  </div>
`;

stories.add('ListGroup', () => ({
  components: {
    FrListGroup: ListGroup,
    FrListItem: ListItem,
  },
  template,
  props: {
    title: {
      type: String,
      default: text('title', 'Title'),
    },
    subtitle: {
      type: String,
      default: text('subtitle', 'Subtitle'),
    },
  },
}));
