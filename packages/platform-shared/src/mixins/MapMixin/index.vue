<script>
import GoogleMapsApiLoader from 'google-maps-api-loader';
import { mapState } from 'vuex';

const queue = [];
const enqueueFunction = (func, resolve) => {
  queue.push([func, resolve]);
};

const geocodeTypeGetter = (results) => {
  const getObj = (obj, type) => {
    if (obj) {
      return obj.filter((result) => result.types.indexOf(type) > -1)[0] || {};
    }
    return {};
  };
  return {
    getFormattedAddress(type) {
      return getObj(results, type).formatted_address || '';
    },
    getAddressComponent(type) {
      return getObj(getObj(results, 'street_address').address_components, type) || {};
    },
  };
};

export default {
  name: 'MapMixin',

  data() {
    return {
      googleMaps: null,
    };
  },
  mounted() {
    GoogleMapsApiLoader({
      apiKey: this.googleMapsApiKey,
    }).then(({ maps }) => {
      this.googleMaps = { ...maps };
      while (queue.length > 0) {
        const [func, resolve] = queue.pop();
        func()
          .then((result) => {
            resolve(result);
          });
      }
    });
  },
  computed: {
    ...mapState({
      googleMapsApiKey: (state) => state.googleMapsApiKey,
    }),
  },

  methods: {
    staticMap(mapConfig) {
      const {
        size = { width: 100, height: 100 },
        scale = 2,
        mapType = 'roadmap',
        language = 'en',
        center = 'San+Fransisco,CA',
        zoom = 9,
        markers = 'San+Fransisco,CA',
      } = mapConfig;

      // eslint-disable-next-line prefer-template
      return 'https://maps.googleapis.com/maps/api/staticmap?'
      + 'center=' + center
      + '&scale=' + scale
      + '&language=' + language
      + '&zoom=' + zoom
      + '&size=' + size.width + 'x' + size.height
      + '&maptype=' + mapType
      + '&markers=' + markers
      + '&key=' + this.googleMapsApiKey;
    },
    reverseGeocode({ latitude, longitude }) {
      return new Promise((resolve, reject) => {
        if (!this.googleMaps) {
          enqueueFunction(this.reverseGeocode.bind(this, { latitude, longitude }), resolve);
        } else {
          const geocoder = new this.googleMaps.Geocoder();
          const latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (results.length) {
              resolve(geocodeTypeGetter(results));
            } else {
              reject(status);
            }
          });
        }
      });
    },
  },
};
</script>
