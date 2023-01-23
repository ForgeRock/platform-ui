<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="chartdiv"
    class="risk-chart position-relative">
    <div
      class="map-loading"
      v-if="isLoading">
      <BSpinner
        class="map-spinner"
        variant="primary" />
    </div>
    <div
      id="risk-google-map"
      class="w-100 h-100" />
  </div>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies, no-undef */
import { isEqual } from 'lodash';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { BSpinner } from 'bootstrap-vue';
import {
  getMarkersStats, mapStyles, markerStyle, MAX_ZOOM, MIN_ZOOM,
} from './util';
import { getQueryFilters } from '../../Shared/utils/api';
import { getEventLogs } from '../api/ActivityAPI';
import formatNumber from '../../../../utils/formatNumber';

export default {
  name: 'RiskMap',
  props: {
    filterObject: {
      default: () => ({}),
      type: Object,
    },
    geoCoordinates: {
      default: () => ({}),
      type: Object,
    },
  },
  components: {
    BSpinner,
  },
  computed: {
    dateRange() {
      return this.$store.state.Dashboard.utcDates;
    },
  },
  data() {
    return {
      clusters: undefined,
      google: undefined,
      isLoading: false,
      mapObject: null,
    };
  },
  watch: {
    dateRange: {
      immediate: false,
      handler() {
        this.handleMapChanged(true);
      },
    },
    filterObject: {
      immediate: false,
      deep: true,
      handler(newVal, prevVal) {
        this.handleMapChanged(!isEqual(prevVal.geoCoordinates, newVal.geoCoordinates));
      },
    },
  },
  mounted() {
    const { handleMapChanged, updateGeoBounds } = this;
    const loader = new Loader({
      apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
    });
    loader.load().then(() => {
      const map = new google.maps.Map(document.getElementById('risk-google-map'), {
        center: { lat: 33.8616427, lng: 7.3176288 },
        zoom: MIN_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      map.setOptions({
        styles: mapStyles,
      });
      this.mapObject = map;
      map.addListener('zoom_changed', () => updateGeoBounds());
      map.addListener('dragend', () => updateGeoBounds());

      google.maps.event.addListenerOnce(map, 'idle', () => handleMapChanged());
    });
  },
  methods: {
    updateGeoBounds() {
      if (this.mapObject) {
        if (this.mapObject.getZoom() > MIN_ZOOM) {
          const bounds = this.mapObject.getBounds().toJSON();
          this.$emit('mapBoundChange', bounds);
        } else {
          this.$emit('mapBoundChange', {});
        }
      }
    },
    infoWindowContent(sum, avg) {
      const formatSum = formatNumber(sum, 'en-US');
      return `<div class="info-content font-weight-normal">${formatSum} Risky Event${sum !== 1 ? 's' : ''}<div>Average Score ${Math.round(avg)}</div></div>`;
    },
    /*
    * @params {Boolean} recenter - used to show the map in the initial center point with initial zoom value
    */
    handleMapChanged(recenter = false) {
      const bounds = !recenter && this.mapObject.getZoom() > MIN_ZOOM ? this.mapObject.getBounds().toJSON() : {};
      const query = {
        size: 0,
        aggs: {
          lat_lon_data: {
            filter: {
              bool: getQueryFilters(this.dateRange, { ...this.filterObject, geoCoordinates: bounds }),
            },
            aggs: {
              lat_lon_locations: {
                multi_terms: {
                  terms: [
                    {
                      field: 'predictionResult.features.geoData.lat',
                    },
                    {
                      field: 'predictionResult.features.geoData.longitude',
                    },
                  ],
                  size: 10000,
                },
                aggs: {
                  avg_score: {
                    avg: {
                      field: 'predictionResult.risk_score_data.risk_score',
                    },
                  },
                },
              },
            },
          },
        },
      };

      getEventLogs(query)
        .then(({ data }) => {
          const { mapObject, clusters, infoWindowContent } = this;

          if (clusters) {
            clusters.clearMarkers();
          }

          const infoWindow = new google.maps.InfoWindow({
            content: '',
          });
          const allBounds = new google.maps.LatLngBounds();

          const markers = data.aggregations.lat_lon_data.lat_lon_locations.buckets.map((bucket) => {
            const sum = bucket.doc_count;
            const marker = new google.maps.Marker({
              ...markerStyle(new google.maps.LatLng(bucket.key[0], bucket.key[1]), sum, formatNumber(sum, 'en-US')),
              getData: () => bucket,
            });

            allBounds.extend(marker.position);

            marker.addListener('click', () => {
              infoWindow.close();
              infoWindow.setOptions({
                shouldFocus: false,
                content: infoWindowContent(sum, bucket.avg_score.value),
                anchor: marker,
              });
              infoWindow.open(mapObject, marker);
            });

            return marker;
          });

          const renderer = {
            render(
              cluster,
            ) {
              const { position, markers: clusterMarkers } = cluster;
              const { sum } = getMarkersStats(clusterMarkers);
              return new google.maps.Marker(markerStyle(position, sum, formatNumber(sum, 'en-US')));
            },
          };

          const onClusterClick = (cluster, map) => {
            const { allMarkers, marker } = cluster;
            const { sum, avg } = getMarkersStats(allMarkers);

            infoWindow.close();
            infoWindow.open(map);
            infoWindow.setOptions({
              shouldFocus: false,
              content: infoWindowContent(sum, avg),
              anchor: marker,
            });
          };

          const markerCluster = new MarkerClusterer({
            map: mapObject, markers, renderer, onClusterClick,
          });

          this.clusters = markerCluster;

          if (recenter) {
            mapObject.setZoom(MIN_ZOOM);
            if (bounds.getCenter) {
              mapObject.setCenter(bounds.getCenter());
            }
          }
        });
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
