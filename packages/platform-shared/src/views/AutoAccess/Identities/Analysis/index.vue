<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-2">
    <div class="d-flex justify-content-end">
      <div class="w-25">
        <FrSelect
          :select-options="options"
          :value="model"
          :placeholder="$t('access.models.optionTitle')"
          @input="handleRiskModelChange" />
      </div>
    </div>
    <BCard
      no-body
      class="my-2 p-1">
      <div id="user_chart" />
    </BCard>
    <BCard
      no-body
      class="my-2 p-1"
      v-if="eventLogData.length > 0">
      <div
        id="event_log"
        class="mx-1 p-1">
        <h4 class="mb-2">
          {{ $t("access.identities.eventLog") }}
        </h4>
        <FrAccordion
          :key="`event-accordion-${eventLogPage}`"
          accordion-group="event-logs"
          :items="eventLogDataComputed"
          @section-expanded="$set($event.data, 'loaded', true)"
          :header-props="(data, key) => ({ 'aria-labelledby': `treelist-tab-${key}`, 'aria-controls': `treelist-tabpanel-${key}` })"
          class="mt-2"
        >
          <template #accordionHeader>
            <div class="px-4">
              <div class="d-flex justify-content-center align-items-center py-2 pr-2">
                <b class="w-75 text-left">
                  {{ $t("common.user") }}
                </b>

                <b class="w-75 text-left">
                  {{ $t("access.dashboard.accessScore") }}
                </b>

                <div class="col-2">
                  <b>{{ $t("access.dashboard.transactionId") }}</b>
                </div>
                <div class="col-4">
                  <b>{{ $t("common.labels") }}</b>
                </div>
                <div class="col-1" />
              </div>
            </div>
          </template>
          <template #header="row">
            <div class="px-3">
              <div class="d-flex justify-content-center align-items-center py-2 pr-2">
                <div class="col-3">
                  <div class="d-flex flex-column">
                    <BLink>
                      <i class="material-icons material-icons-outlined">
                        person
                      </i>
                      <span className="uk-text-break">
                        {{ row.user }}
                      </span>
                    </BLink>

                    <div class="d-flex mt-2">
                      <div class="mr-5">
                        <i class="material-icons material-icons-outlined">
                          apps
                        </i> {{ row.app }}
                      </div>
                      <div>
                        <i class="material-icons material-icons-outlined">
                          alarm
                        </i> {{ row.time }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <span>{{ row.risk }}</span>
                </div>
                <div class="col-2">
                  <span>{{ row.transactionId }}</span>
                </div>
                <div class="col-4">
                  <div class="d-flex flex-wrap">
                    <BBadge
                      class="m-1"
                      v-for="data in row.labels.data"
                      :key="'label_' + JSON.stringify(data)">
                      {{ data.label + " : " + data.value }}
                    </BBadge>
                  </div>
                </div>
                <div class="col-1 text-right" />
              </div>
            </div>
          </template>
          <template #body="row">
            <div class="d-flex flex-column border m-2 p-4">
              <div class="d-flex">
                <div class="w-25 text-left m-2 d-flex align-items-center">
                  <span class="mr-2">
                    Model:
                  </span>
                  <FrSelect
                    :select-options="getModelSelectedOptions(row)"
                    :value="getModelSelected(row)"
                    :placeholder="$t('access.dashboard.modelOptions')"
                    @input="(value, id) => handleModelValueChange(value, id, row)"
                  />
                </div>
                <div class="w-50" />
                <div class="w-25 text-right m-2">
                  <BLink @click="$refs['modal_' + row.id].show()">
                    <i class="material-icons material-icons-outlined mr-2">
                      article
                    </i>
                  </BLink>
                  <BModal
                    @shown="handleShowFullLog(row)"
                    :key="'modal_' + row.id"
                    :ref="'modal_' + row.id"
                    size="lg"
                    :title="$t('access.dashboard.fullLog')"
                    no-close-on-backdrop
                    ok-only
                    :ok-title="$t('common.close')"
                  >
                    <div
                      id="json-editor"
                      class="p-4 json-editor" />
                  </BModal>
                </div>
              </div>
              <div class="d-flex border-top border-bottom mt-2">
                <div class="p-2 w-25">
                  Reason
                </div>

                <div class="uk-text-small uk-text-bold p-2 reason-detail">
                  Reason Detail
                </div>
                <div class="uk-text-small uk-text-bold p-2 risk-score">
                  Risk Score Contribution
                </div>
              </div>
              <div
                v-for="cause in getExpandModelCause(row)"
                :key="`causes-${cause.id}`"
                class="d-flex border-bottom">
                <div class="p-2 w-25">
                  <span
                    v-for="key in Object.keys(cause)"
                    :key="`causeDetailColumn-${key}`">
                    <span v-if="key !== 'score' && key !== 'id'">
                      <span> {{ causeMap[key] ? causeMap[key] : key }} </span>
                    </span>
                  </span>
                </div>
                <div class="p-2 reason-detail">
                  <div class="d-flex">
                    <div class="text-left w-50">
                      <span
                        v-for="key in Object.keys(cause)"
                        :key="`causeDetail-${key}`">
                        <span v-if="key !== 'score' && key !== 'id'">
                          <span> {{ cause[key] }} </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="uk-text-small p-2 risk-score">
                  <span>{{ cause.score ? cause.score.toFixed(2) : "" }}</span>
                </div>
              </div>
            </div>
          </template>
        </FrAccordion>
        <FrPagination
          :current-page="eventLogPage"
          :last-page="isEventLogLastPage"
          @pagination-change="eventLogPaginationChange" />
      </div>
    </BCard>
    <BCard
      no-body
      class="my-2 p-1">
      <div
        id="cause_freq"
        class="mx-1 p-1">
        <h4 class="mb-2">
          {{ $t("access.identities.causeFrequency") }}
        </h4>
        <BTableSimple
          hover
          small>
          <BThead>
            <BTr>
              <BTh class="cause-one">
                <FrSelect
                  size="sm"
                  :select-options="causeMap"
                  :value="causeArrayFields[0].key"
                  :placeholder="$t('access.models.optionTitle')"
                  @input="handleCauseOneChange" />
              </BTh>
              <BTh class="cause-two">
                <FrSelect
                  :select-options="causeMap"
                  :value="causeArrayFields[1].key"
                  :placeholder="$t('access.models.optionTitle')"
                  @input="handleCauseTwoChange" />
              </BTh>
              <BTh class="cause-three">
                <FrSelect
                  :select-options="[{ text: 'Frequency', value: 'frequency' }]"
                  value="frequency"
                  :disabled="true"
                  :placeholder="$t('access.models.optionTitle')" />
              </BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr
              v-for="cause in constFreqComputed"
              :key="JSON.stringify(cause)">
              <BTd
                v-for="key in Object.keys(cause)"
                :key="'cause_key_' + key">
                {{ cause[key] }}
              </BTd>
            </BTr>
          </BTbody>
        </BTableSimple>
        <FrPagination
          :current-page="causePage"
          :last-page="isCauseLastPage"
          @pagination-change="causePaginationChange" />
      </div>
    </BCard>
    <BTooltip
      v-if="targetBar"
      :key="'tooltip_' + targetBar"
      :target="targetBar"
      triggers="hover"
      placement="right">
      <div v-if="isHighRiskData">
        High Risk - {{ targetBarData[1] - targetBarData[0] }} of {{ targetBarData.data.total }}
      </div>
      <div v-else>
        Low Risk - {{ targetBarData[1] - targetBarData[0] }} of {{ targetBarData.data.total }}
      </div>
    </BTooltip>
  </div>
</template>

<script>
import FrSelect from '@forgerock/platform-shared/src/components/Field/Select';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import {
  BTableSimple, BTbody, BThead, BTr, BTh, BTd, BLink, BDropdown, BDropdownItem, BModal, BCard, BTooltip,
} from 'bootstrap-vue';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import FrPagination from '../../Shared/DataTable/Pagination';
import {
  getRiskHistogramForUser, getEventForTimeAndRisk, getCauseFrequency, MODELS,
} from '../../Dashboard/api/DashboardAPI';

const ace = require('brace');
require('brace/mode/json');

export default {
  name: 'Analysis',
  components: {
    FrSelect,
    FrSpinner,
    BTableSimple,
    BTbody,
    BThead,
    BTr,
    BTh,
    BTd,
    FrPagination,
    FrAccordion,
    BLink,
    BDropdown,
    BDropdownItem,
    BModal,
    BCard,
    BTooltip,
  },
  props: {
    id: {
      type: String,
    },
    dateRange: {
      type: Array,
    },
    score: {
      type: Object,
    },
  },
  computed: {
    eventLogDataComputed() {
      if (this.eventLogData.length > 0) return this.eventLogData[this.eventLogPage];
      return [];
    },
    constFreqComputed() {
      if (this.constFreq.length > 0) return this.constFreq[this.causePage];
      return [];
    },
    causeArrayFields() {
      const myCauseArray = [...this.causeArray];
      myCauseArray.push({ key: 'count', label: this.$t('access.identities.frequency') });
      return myCauseArray;
    },
    isCauseLastPage() {
      if ((this.causePage + 1) * 10 < this.totalCauses) return false;
      return true;
    },
    isEventLogLastPage() {
      if (this.eventLogPage + 1 < this.totalEventLogs) return false;
      return true;
    },
    isHighRiskData() {
      if (this.targetBarData) {
        const rowData = this.targetBarData;
        return this.isHighRisk(rowData);
      } return false;
    },
  },
  data() {
    return {
      options: [],
      model: 'ensemble',
      causeArray: [],
      barData: [],
      eventLogData: [],
      constFreq: [],
      isCauseFreqLoading: false,
      isHistLoading: false,
      constFreqFields: [],
      causePage: 0,
      eventLogPage: 0,
      totalEventLogs: 0,
      totalCauses: 0,
      targetBar: '',
      targetBarData: null,
      causeMap: [
        { text: 'User ID', value: 'userId' },
        { text: 'referer', value: 'referer' },
        { text: 'City', value: 'city' },
        { text: 'Country', value: 'country' },
        { text: 'Day of the Week', value: 'day_of_week' },
        { text: 'Time of Day', value: 'dayparting' },
        { text: 'Device', value: 'device' },
        { text: 'Model', value: 'model' },
        { text: 'OS', value: 'os' },
        { text: 'OS Version', value: 'os_version' },
        { text: 'Browser', value: 'user_agent' },
        { text: 'Component', value: 'component' },
      ],
    };
  },
  watch: {
    dateRange: {
      immediate: true,
      handler(newDateRange) {
        this.getBarData(this.model);
        this.causeArray = [{ key: 'city' }, { key: 'os' }];
      },
    },
    causeArray: {
      immediate: true,
      handler(newArray) {
        this.constFreq = [];
        if (newArray.length > 0) {
          this.isCauseFreqLoading = true;
          getCauseFrequency(this.id, newArray, this.model, this.dateRange)
            .then((data) => {
              let freqArray = [];
              data.aggregations[newArray[0].key].buckets.map((row) => {
                row[newArray[1].key].buckets.map((subRow) => {
                  let firstCause = row.key;
                  let secondCause = subRow.key;

                  if (newArray[0].key === 'referer') {
                    firstCause = decodeURIComponent(row.key.split('goto=')[1] ? row.key.split('goto=')[1] : '');
                  }

                  if (newArray[1].key === 'referer') {
                    secondCause = decodeURIComponent(subRow.key.split('goto=')[1] ? subRow.key.split('goto=')[1] : '');
                  }

                  freqArray.push({ [newArray[0].key]: firstCause, [newArray[1].key]: secondCause, count: subRow.doc_count });
                });
              });
              freqArray = _.orderBy(freqArray, ['count'], ['desc']);
              this.totalCauses = freqArray.length;
              const chunkArray = _.chunk(freqArray, 10);
              this.constFreq = chunkArray;
              this.isCauseFreqLoading = false;
            })
            .catch((e) => {
              this.isCauseFreqLoading = false;
            });
        }
      },
    },
    barData(newBarData) {
      if (newBarData && newBarData.length > 0) {
        const causes = ['highRisk', 'lowRisk'];
        const margin = {
          top: 20, right: 50, bottom: 70, left: 45,
        };
        const parentDiv = document.getElementById('user_chart');
        const width = parentDiv.clientWidth - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const x = d3.scaleBand().rangeRound([0, width]);

        const y = d3.scaleLinear().rangeRound([height, 0]);

        const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%m/%d/%Y'));

        const yAxis = d3.axisLeft(y);

        d3.select('#user_chart')
          .selectAll('svg')
          .remove();

        const svg = d3
          .select('#user_chart')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        const layers = d3.stack().keys(causes)(newBarData);

        x.domain(layers[0].map((d) => d.data.date)).padding(0.6);

        y.domain([0, d3.max(layers[layers.length - 1], (d) => d[0] + d[1])]).nice();

        const layer = svg
          .selectAll('layer')
          .data(layers)
          .enter()
          .append('g')
          .attr('class', 'layer')
          .style('fill', (d, i) => {
            if (d.key === 'highRisk') {
              return 'var(--danger)';
            }
            return 'var(--success)';
          });

        layer
          .selectAll('rect')
          .data((d) => d)
          .enter()
          .append('rect')
          .style('cursor', 'pointer')
          .attr('id', (d) => `rect_${this.isHighRisk(d) ? 'high_' : 'low_'}${d.data.id}`)
          .attr('x', (d) => x(`${d.data.date}`))
          .attr('y', (d) => y(d[1]))
          .attr('height', (d) => this.heightCal(d, y))
          .attr('width', x.bandwidth() - 1)
          .on('mouseover', (event, d) => {
            this.targetBar = `rect_${this.isHighRisk(d) ? 'high_' : 'low_'}${d.data.id}`;
            this.targetBarData = d;
          })
          .on('click', (event, data) => {
            this.causePage = 0;
            this.eventLogPage = 0;
            const isRisky = this.isHighRisk(data);
            const fromDate = dayjs(data.data.id).toISOString();
            const toDate = dayjs(data.data.id)
              .add(1, 'week')
              .toISOString();
            const timeParam = { gte: fromDate, lte: toDate };

            const riskParam = { gte: isRisky ? this.score[this.model] : 0, lte: isRisky ? 100 : this.score[this.model] };
            getEventForTimeAndRisk(this.id, timeParam, riskParam, this.model).then((data) => {
              const tableData = [];
              data.hits.hits.map((data) => {
                const riskInfo = [];
                const riskScore = data._source.risk[`${this.model}_model`].score.toFixed(2);
                Object.keys(data._source.risk).map((key) => {
                  if (key !== 'message') {
                    if (key.split('_')[0] === this.model) {
                      riskInfo.push({ model: key.split('_')[0], cause: data._source.risk[key].cause, selected: true });
                    } else {
                      riskInfo.push({ model: key.split('_')[0], cause: data._source.risk[key].cause, selected: false });
                    }
                  }
                });
                tableData.push({
                  id: uuidv4(),
                  user: data._source.userId,
                  app: data._source.http.request.headers['user-agent'].user_agent,
                  time: new Date(data._source.timestamp).toLocaleString(),
                  risk: riskScore,
                  labels: { showAll: false, data: data._source.userLabels ? data._source.userLabels : [] },
                  riskInfo,
                  transactionId: data._source.transactionId,
                  eventId: data._source._eventId,
                  rawData: data._source,
                  isRisky,
                  open$: true,
                });
              });
              const chunks = _.chunk(tableData);
              this.totalEventLogs = tableData.length;
              this.eventLogData = chunks;
              const causeArray = [];
              _.find(chunks[0][0].riskInfo, (row) => row.selected).cause.map((row) => Object.keys(row).forEach((key) => (key !== 'score' ? causeArray.push({ key, value: row[key] }) : console.log)));
              if (causeArray.length > 0) this.causeArray = causeArray;
            });
          });

        svg
          .append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', `translate(0,${height})`)
          .call(xAxis)
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('x', '2')
          .attr('y', '10')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-45)');

        svg
          .append('g')
          .attr('class', 'axis axis--y')
          .attr('transform', 'translate(0,0)')
          .call(yAxis);

        // Prep the tooltip bits, initial display is hidden
        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip')
          .style('display', 'none');

        tooltip
          .append('rect')
          .attr('width', 240)
          .attr('height', 20)
          .attr('fill', 'var(--confidence-med)')
          .style('opacity', 0.5);

        tooltip
          .append('text')
          .attr('x', 120)
          .attr('dy', '1.2em')
          .style('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold');

        // text label for the y axis
        svg
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left)
          .attr('x', 0 - height / 2)
          .attr('dy', '1em')
          .attr('font-size', '12px')
          .style('text-anchor', 'middle')
          .text('No of Events');

        // text label for the x axis
        svg
          .append('text')
          .attr('transform', `translate(${width / 2} ,${height + margin.top + 45})`)
          .style('text-anchor', 'middle')
          .attr('font-size', '12px')
          .text('Timestamp per week');
      }
    },
  },
  mounted() {
    const myOptions = [];
    Object.keys(MODELS).map((model) => {
      myOptions.push({ text: MODELS[model], value: model });
    });
    this.options = myOptions;
  },
  methods: {
    getBarData(model) {
      this.isHistLoading = true;
      this.barData = [];
      d3.selectAll('svg > *').remove();
      getRiskHistogramForUser(this.id, this.score, model, this.dateRange)
        .then((data) => {
          const histData = [];
          data.aggregations.user_event_count.monthly.buckets.map((riskData) => {
            histData.push({
              id: riskData.key,
              date: new Date(riskData.key),
              highRisk: riskData.high_risk.doc_count,
              lowRisk: riskData.doc_count - riskData.high_risk.doc_count,
              total: riskData.doc_count,
            });
          });

          this.barData = histData;
          this.isHistLoading = false;
        })
        .catch((e) => {
          this.isHistLoading = false;
        });
    },
    isHighRisk(rowData) {
      const diff = rowData[1] - rowData[0];
      if (rowData.data.highRisk === diff && rowData[0] === 0) return true;
      return false;
    },
    handleCauseOneChange(selectedOption) {
      const causeArray = [];
      causeArray.push({ key: selectedOption });
      causeArray.push({ key: this.causeArrayFields[1].key });
      if (causeArray.length > 0) this.causeArray = causeArray;
    },
    handleCauseTwoChange(selectedOption) {
      const causeArray = [];
      causeArray.push({ key: this.causeArrayFields[0].key });
      causeArray.push({ key: selectedOption });
      if (causeArray.length > 0) this.causeArray = causeArray;
    },
    causePaginationChange(page) {
      this.causePage = page;
    },
    eventLogPaginationChange(page) {
      this.eventLogPage = page;
    },
    getModelSelectedOptions(row) {
      const options = [];
      row.riskInfo.map((data) => options.push({ text: MODELS[data.model], value: data.model }));
      return options;
    },
    getModelSelected(row) {
      let expandModel = '';

      row.riskInfo.map((data) => {
        if (data.selected) {
          expandModel = data.model;
        }
      });

      return expandModel;
    },
    getExpandModelCause(row) {
      const myRow = _.cloneDeep(row);
      let expandModelCause = [];

      myRow.riskInfo.map((data) => {
        if (data.selected) {
          expandModelCause = [...data.cause];
        }
      });

      const sortedModelCauses = _.orderBy(expandModelCause, ['score'], ['desc']);
      sortedModelCauses.map((cause) => {
        cause.id = uuidv4();
      });

      return sortedModelCauses;
    },
    handleModelValueChange(value, id, row) {
      let myData = [...this.eventLogData];
      myData = myData[this.eventLogPage];
      const myRow = myData.filter((data) => data.id === row.id)[0];

      myRow.riskInfo.map((data) => {
        if (data.model === value) data.selected = true;
        else data.selected = false;
        data.expanded = true;
      });

      this.eventLogData[this.eventLogPage] = myData;
    },
    handleShowFullLog(row) {
      const editor = ace.edit('json-editor');
      editor.getSession().setMode('ace/mode/json');
      editor.setValue(JSON.stringify(row.rawData, null, '\t'));
      editor.$blockScrolling = Infinity;
      editor.setReadOnly(true);
      editor.clearSelection();
    },
    heightCal(d, y) {
      return d[0] === d[1] ? 0 : y(d[0]) - y(d[1]);
    },
    handleRiskModelChange(selectedOption) {
      this.model = selectedOption;
      this.getBarData(selectedOption);
      this.eventLogData = [];
    },
  },
};
</script>

<style lang="scss" scoped>
.frequency-align {
  vertical-align: middle;
}

.cause-one {
  width: 40%;
}

.cause-two {
  width: 40%;
}

.cause-three {
  width: 20%;
}

::v-deep .accordion .card {
  overflow: visible;
}

::v-deep .card-header {
  padding: 10px;
}

.json-editor {
  height: 500px;
}

.reason-detail {
  width: 30%;
  background-color: $light;
}

.risk-score {
  width: 15%;
}
</style>
