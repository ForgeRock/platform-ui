<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="risk-chart position-relative flex-grow-1 mt-3">
    <div
      class="map-loading"
      v-if="isLoading">
      <BSpinner
        class="map-spinner"
        variant="primary" />
    </div>
    <div
      id="event-detail-mini-map"
      class="w-100 h-100" />
  </div>
</template>

<script>

/* eslint-disable import/no-extraneous-dependencies, no-undef */
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { BSpinner } from 'bootstrap-vue';
import { mapStyles, MIN_ZOOM, MAX_ZOOM } from '../RiskMap/util';
import store from '@/store';

export default {
  name: 'MiniMap',
  props: {
    authentications: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    BSpinner,
  },
  data() {
    return {
      mapObject: null,
      isLoading: false,
    };
  },
  watch: {
    authentications: {
      handler() {
        if (this.authentications.length === 0) {
          return;
        }
        if (!this.mapObject) {
          const activity = this.authentications[0];

          const loader = new Loader({
            apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
          });
          loader.load().then(() => {
            const map = new google.maps.Map(document.getElementById('event-detail-mini-map'), {
              center: activity.geoData ? { lat: activity.geoData.lat, lng: activity.geoData.longitude } : { lat: 0, lng: 0 },
              zoom: 5,
              minZoom: MIN_ZOOM - 1,
              maxZoom: MAX_ZOOM,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            });
            map.setOptions({
              styles: mapStyles,
            });
            this.mapObject = map;
            this.handleMapChanged();
          });
        }
      },
    },
  },
  methods: {
    handleMapChanged() {
      const { mapObject } = this;

      const groups = [
        this.authentications.filter((auth) => auth.risk >= store.state.Dashboard.config.thresholds.high),
        this.authentications.filter((auth) => auth.risk < store.state.Dashboard.config.thresholds.high && auth.risk >= store.state.Dashboard.config.thresholds.medium),
        this.authentications.filter((auth) => auth.risk < store.state.Dashboard.config.thresholds.medium),
      ];
      const colors = [
        '#f7685b',
        '#ffb946',
        '#2ed47a',
      ];
      const bounds = new google.maps.LatLngBounds();

      groups.forEach((group, i) => {
        const color = colors[i];
        const icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: color,
          fillColor: color,
        };
        const markers = group.filter((auth) => auth.geoData).map((auth) => {
          const marker = new google.maps.Marker({
            map: mapObject,
            position: new google.maps.LatLng(auth.geoData.lat, auth.geoData.longitude),
            icon,
          });
          bounds.extend(marker.position);
          return marker;
        });

        const renderer = {
          render(
            cluster,
          ) {
            // eslint-disable-next-line no-shadow
            const { position, markers } = cluster;

            return new google.maps.Marker({
              position,
              icon,
              label: {
                text: `${markers.length}`,
                color: '#fff',
                fontWeight: 'normal',
                fontSize: '12px',
              },
            });
          },
        };

        // eslint-disable-next-line no-new
        new MarkerClusterer({
          map: mapObject, markers, renderer,
        });
      });

      this.mapObject.fitBounds(bounds);
    },
  },
};
</script>

<style lang="scss">
.map-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
}

.risk-chart {
  .info-content {
    line-height: 1.5;
    padding: 5px;
  }
}

.map-spinner {
  margin-top: -40px;
  margin-left: -40px;
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
