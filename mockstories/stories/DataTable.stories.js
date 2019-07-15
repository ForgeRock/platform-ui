import { storiesOf } from '@storybook/vue';
import DataTable from '../mocks/components/DataTable.vue';

storiesOf('Components-Mock|Data Table', module)
    .add('Data Table', () => ({
        components: { 'fr-datatable': DataTable },
        template: '<fr-datatable></fr-datatable>'
    }));
