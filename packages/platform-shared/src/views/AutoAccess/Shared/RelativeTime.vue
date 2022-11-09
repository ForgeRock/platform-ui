<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-inline-block">
    <div v-if="includeAbsolute && absoluteTime">
      {{ absoluteTime }}
    </div>

    <div :class="includeAbsolute && absoluteTime ? `mt-1 small text-muted` : ``">
      {{ timeSince }}
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'RelativeTime',
  props: {
    timestamp: {
      type: String,
      default: '',
    },
    /*  Maximum amount of relative time, after which full date is shown
            86400 is 24 hours
            604800 is 7 days
            18144000 is 30 days
        */
    maxSeconds: {
      type: Number,
      default: 86400,
    },
    includeAgo: {
      type: Boolean,
      default: false,
    },
    includeAbsolute: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    secondsPast() {
      const { timestamp } = this;
      const then = new Date(timestamp);
      const utcOffset = dayjs().utcOffset();
      const now = dayjs().add(-utcOffset, 'minutes').toDate();

      return (now.getTime() - then.getTime()) / 1000;
    },
  },
  computed: {
    timeSince() {
      const {
        includeAgo, includeAbsolute, timestamp, maxSeconds,
      } = this;
      let day; let month; let
        year;
      const then = new Date(timestamp);
      const now = new Date();
      const secondsPast = this.secondsPast();

      if (secondsPast > maxSeconds) {
        if (includeAbsolute) {
          return dayjs(then).format('MMMM D, YYYY h:mm A');
        }
        day = then.getDate();
        month = then.toDateString().match(/ [a-zA-Z]*/)[0].replace(' ', '');
        year = then.getFullYear() === now.getFullYear() ? '' : ` ${then.getFullYear()}`;
        return `${day} ${month}${year}`;
      }

      if (secondsPast < 60) {
        return 'Just now';
      }
      if (secondsPast < 3600) {
        return `${parseInt((secondsPast / 60), 10)} min${includeAgo ? ' ago' : ''}`;
      }
      if (secondsPast <= 86400) {
        const hours = parseInt((secondsPast / 3600), 10);
        return hours + (hours !== 1 ? ' hours' : ' hour') + (includeAgo ? ' ago' : '');
      }
      if (secondsPast <= 18144000) {
        const days = parseInt((secondsPast / 3600 / 24), 10);
        return days + (days !== 1 ? ' days' : ' day') + (includeAgo ? ' ago' : '');
      }

      return '?';
    },
    absoluteTime() {
      const { timestamp, maxSeconds } = this;
      const secondsPast = this.secondsPast();
      if (secondsPast <= maxSeconds) {
        return dayjs(timestamp).format('MMMM D, YYYY h:mm A');
      }
      return null;
    },
  },
};
</script>
