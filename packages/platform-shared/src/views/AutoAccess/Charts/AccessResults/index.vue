<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-3">
    <StackedBarChart
      :chart-data="chartData"
      :view-box="[800, 200]"
    />
  </div>
</template>
<script>
import dayjs from 'dayjs';
import StackedBarChart from '../StackedBarChart';
import { getEventLogs } from '../../Activity/api/ActivityAPI';
import { defaultData } from '../AccessAttempts/api';

export default {
  name: 'AccessResults',
  components: {
    StackedBarChart,
  },
  props: {
    dateRange: {
      type: Object,
      default: () => ({}),
    },
    userId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      chartData: [],
      interval: 'day',
    };
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    dateRange: {
      handler() {
        this.fetchData();
      },
    },
  },
  methods: {
    fetchData() {
      const { userId, dateRange, interval } = this;
      const placeholder = defaultData(dayjs(dateRange.endDate).diff(dateRange.startDate, interval) + 1, dateRange.startDate, interval).map((d) => ({ ...d, success: 0, failure: 0 }));
      const param = {
        sort: [
          {
            'features.timestamp': {
              order: 'desc',
            },
          },
        ],
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  'features.timestamp': {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                  },
                },
              },
              {
                term: {
                  'features.userId.keyword': userId || null,
                },
              },
            ],
          },
        },
        aggs: {
          histogram: {
            date_histogram: {
              field: 'features.timestamp',
              calendar_interval: 'day',
              time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            aggs: {
              // failure_count: {
              //     value_count: {
              //         field: "raw_event_data.response.status", // TODO replace with real data
              //     },
              //     filter: {

              //     }
              // },
              // success_count: {
              //     value_count: {
              //         field: "city-state-country.keyword", // TODO replace with real data
              //     }
              // }
              outcomes: {
                terms: {
                  field: 'raw_event_data.response.status.keyword',
                },
              },
            },
          },
        },
      };

      getEventLogs(param).then((response) => {
        const eventLogsResponse = response.aggregations?.histogram?.buckets.forEach((d) => {
          const val = {
            raw: d,
            timestamp: d.key_as_string,
            success: d.outcomes?.buckets?.find((bucket) => bucket.key === 'SUCCESSFUL')?.doc_count || 0,
            failure: d.outcomes?.buckets?.find((bucket) => bucket.key !== 'SUCCESSFUL')?.doc_count || 0,
          };
          const index = placeholder.findIndex((r) => dayjs(r.timestamp).isSame(val.timestamp, interval));
          placeholder[index] = val;
        });
        this.chartData = placeholder;
        return eventLogsResponse;
      });
    },
  },
};
</script>
