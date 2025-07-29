<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-inline-block">
    <div v-if="includeAbsolute && absoluteTime">
      {{ absoluteTime }}
    </div>

    <div :class="{ 'mt-1 small text-muted': includeAbsolute && absoluteTime }">
      {{ timeSince }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import i18n from '../i18n';

const props = defineProps({
  timestamp: {
    type: String,
    default: '',
  },
  /*  Maximum amount of relative time, after which full date is shown
      86400 is 24 hours
      604800 is 7 days
      18144000 is 30 days */
  maxSeconds: {
    type: Number,
    default: 18144000,
  },
  includeAgo: {
    type: Boolean,
    default: false,
  },
  includeAbsolute: {
    type: Boolean,
    default: false,
  },
});

function calculateSecondsPast() {
  const then = new Date(props.timestamp);
  const now = dayjs().toDate();

  return (now.getTime() - then.getTime()) / 1000;
}

const timeSince = computed(() => {
  const now = new Date();
  const secondsPast = calculateSecondsPast();

  if (secondsPast > props.maxSeconds) {
    const then = new Date(props.timestamp);
    if (props.includeAbsolute) {
      return dayjs(then).format('MMMM D, YYYY h:mm A');
    }
    const day = then.getDate();
    const month = then.toDateString().match(/ [a-zA-Z]*/)[0].replace(' ', '');
    const year = then.getFullYear() === now.getFullYear() ? '' : ` ${then.getFullYear()}`;
    return `${day} ${month} ${year}`;
  }

  if (secondsPast < 60) {
    return i18n.global.t('common.timePeriods.justNow');
  }
  let timeValue = '';
  let timeUnit = '';
  if (secondsPast < 3600) {
    timeValue = parseInt((secondsPast / 60), 10);
    timeUnit = i18n.global.t('common.timePeriods.min');
  } else if (secondsPast <= 86400) {
    timeValue = parseInt((secondsPast / 3600), 10);
    timeUnit = i18n.global.tc('common.timePeriods.hour', { count: timeValue });
  } else if (secondsPast <= 18144000) {
    timeValue = parseInt((secondsPast / 3600 / 24), 10);
    timeUnit = i18n.global.tc('common.timePeriods.day', { count: timeValue });
  }
  if (secondsPast <= 18144000) {
    if (props.includeAgo) {
      return i18n.global.t('common.timePeriods.timeCombinationAgo', { timeValue, timeUnit });
    }
    return i18n.global.t('common.timePeriods.timeCombination', { timeValue, timeUnit });
  }

  return '';
});

const absoluteTime = computed(() => {
  const secondsPast = calculateSecondsPast();
  if (secondsPast <= props.maxSeconds) {
    return dayjs(props.timestamp).format('MMMM D, YYYY h:mm A');
  }
  return null;
});
</script>
