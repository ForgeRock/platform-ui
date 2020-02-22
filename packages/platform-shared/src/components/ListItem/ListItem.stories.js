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
import ListItem from './index';

const stories = storiesOf('Components|Lists|ListItem', module).addParameters({ component: ListItem });

stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <h1 class="display-4">ListItem</h1>
    </div>

    <FrListItem
      :collapsible="collapsible"
      :panelShown="panelShown"
      :hoverItem="hoverItem">

      <div slot="list-item-header">
        Header. Click Me!
      </div>

      <div slot="list-item-collapse-body">
        Body
      </div>
    </FrListItem>

    <div class="sg_masthead">
      <h1 class="display-4">ListItem Nested</h1>
    </div>

    <FrListItem
      :collapsible="collapsible"
      :panelShown="panelShown"
      :hoverItem="hoverItem">

      <div slot="list-item-header">
        Header. Click Me!
      </div>

      <div slot="list-item-collapse-body">
        Body
        <div>
          <FrListItem
            :collapsible="collapsible"
            :panelShown="panelShown"
            :hoverItem="hoverItem">
            <div slot="list-item-header">
              Nested ListItem
            </div>
            <div slot="list-item-collapse-body">
              Body
            </div>
          </FrListItem>
        </div>
      </div>
    </FrListItem>
  </div>
`;

stories.add('ListItem', () => ({
  components: {
    FrListItem: ListItem,
  },
  template,
  props: {
    collapsible: {
      type: Boolean,
      default: boolean('collapsible', true),
    },
    panelShown: {
      type: Boolean,
      default: boolean('panelShown', true),
    },
    hoverItem: {
      type: Boolean,
      default: boolean('hoverItem', false),
    },
  },
  description: {
    FrListItem: {
      // keeping this info here until addon-docs supports template based events
      events: {
        hide: 'BCollapse event passthrough: emitted when collapse has started to close',
        show: 'BCollapse event passthrough: emitted when collapse has started to open',
        hidden: 'BCollapse event passthrough: emitted when collapse has finished closing',
        shown: 'BCollapse event passthrough: emitted when collapse has finished opening',
        'row-click': 'Emitted by clicking a row or header when collapsible prop is false.',
      },
    },
  },
}));
