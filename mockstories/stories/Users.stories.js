import { storiesOf } from '@storybook/vue';
import Users from '../mocks/templates/Users.vue';

storiesOf('Templates|Users', module)
    .add('Users', () => ({
        components: { 'fr-users': Users },
        template: '<fr-users></fr-users>'
    }));
