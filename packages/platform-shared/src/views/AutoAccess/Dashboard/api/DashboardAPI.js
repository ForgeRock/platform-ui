/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';

export const riskiestUsersQuery = (dates) => ({
  size: 10,
  query: {
    bool: {
      must: [
        {
          range: {
            'features.timestamp': {
              gte: dates[0],
              lte: dates[1],
            },
          },
        },
      ],
    },
  },
  aggs: {
    users: {
      terms: {
        field: 'features.userId.keyword',
      },
      aggs: {
        avg_risk_score: {
          avg: {
            field: 'risk_score_data.risk_score',
          },
        },
      },
    },
  },
});

// export const getParamFromFilter = (filterObj) => {
//   let myStartDate;
//   let myEndDate;
//   if (filterObj.time.type === "range") {
//     myStartDate = filterObj.time.startDate;
//     myEndDate = filterObj.time.endDate;
//   }
//   if (filterObj.time.type === "hour") {
//     myStartDate = "now-1h";
//     myEndDate = "now";
//   }
//   if (filterObj.time.type === "6hour") {
//     myStartDate = "now-6h";
//     myEndDate = "now";
//   }
//   if (filterObj.time.type === "week") {
//     myStartDate = "now-1w";
//     myEndDate = "now";
//   }
//   let range = {};
//   range["risk." + filterObj.risk.model + "_model.score"] = {
//     gte: filterObj.risk.riskRange[0],
//     lte: filterObj.risk.riskRange[1],
//   };
//   let riskThreshold = {};
//   riskThreshold["risk." + filterObj.risk.model + "_model.score"] = {
//     gte: filterObj.risk.riskThresholds[filterObj.risk.model],
//     lte: filterObj.risk.riskRange[1],
//   };
//   let logAttrArray = [];
//   if (filterObj.logAttributes) {
//     Object.keys(filterObj.logAttributes).map((key) => {
//       const keyArray = [];
//       const qKey = key + ".keyword";
//       filterObj.logAttributes[key].map((value) => {
//         keyArray.push({ term: { [qKey]: { value: value } } });
//       });
//       logAttrArray.push({ bool: { should: keyArray } });
//     });
//   }
//   let labels = [];
//   if (filterObj.labels) {
//     filterObj.labels.map((data) => {
//       const labData = data.fullLabel.split(":");
//       labels.push({ match: { "userLabels.label.keyword": labData[0].trim() } });
//       labels.push({ match: { "userLabels.value.keyword": labData[1].trim() } });
//     });
//   }
//   let geoQuery = {};
//   if (filterObj.geoCoordinates) {
//     geoQuery = {
//       filter: [
//         {
//           geo_bounding_box: {
//             "geo_info.geolocation": {
//               top_left: {
//                 lat: filterObj.geoCoordinates.north,
//                 lon: filterObj.geoCoordinates.west,
//               },
//               bottom_right: {
//                 lat: filterObj.geoCoordinates.south,
//                 lon: filterObj.geoCoordinates.east,
//               },
//             },
//           },
//         },
//       ],
//     };
//   }
//   let allowUnknownLocation = filterObj.allowUnknownLocation;
//   return { startDate: myStartDate, endDate: myEndDate, range, riskThreshold, logAttributes: logAttrArray, labels, geocoordinates: geoQuery, allowUnknownLocation };
// };

// export const fetchRiskData = () => {
//   return new Promise((resolve, reject) => {
//     const queryParam = {
//       query: {
//         sort: [
//           {
//             "metadata.created": {
//               order: "desc",
//             },
//           },
//         ],
//         size: 1,
//       },
//     };
//     postData("/jas/entity/search" + configPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

// const elasticMap = {
//   userId: "userId",
//   referer: "http.request.headers.referer",
//   city: "geo_info.city",
//   country: "geo_info.country",
//   day_of_week: "day_of_week",
//   dayparting: "dayparting",
//   device: "http.request.headers.user-agent.os",
//   model: "http.request.headers.user-agent.model",
//   os: "http.request.headers.user-agent.os",
//   os_version: "http.request.headers.user-agent.os_version",
//   user_agent: "http.request.headers.user-agent.user_agent",
//   component: "component",
// };

// export const getUniqueLocationInfo = (aNorth, aWest, aSouth, aEast, maxGeoPoints, filterObj) => {
//   return new Promise((resolve, reject) => {
//     const { startDate, endDate, riskThreshold, logAttributes, labels } = getParamFromFilter(filterObj);
//     const param = {
//       size: 0,
//       aggs: {
//         lat_lon_data: {
//           filter: {
//             bool: {
//               must: [
//                 {
//                   geo_bounding_box: {
//                     "geo_info.geolocation": {
//                       top_left: {
//                         lat: aNorth,
//                         lon: aWest,
//                       },
//                       bottom_right: {
//                         lat: aSouth,
//                         lon: aEast,
//                       },
//                     },
//                   },
//                 },
//                 {
//                   range: riskThreshold,
//                 },
//                 {
//                   range: {
//                     timestamp: {
//                       gte: startDate,
//                       lte: endDate,
//                       format: "epoch_millis",
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//           aggs: {
//             lat_lon_count: {
//               cardinality: {
//                 field: "lat-lon.keyword",
//               },
//             },
//             // "city_state_country_count": {
//             //     "cardinality": {
//             //         "field": "city-state-country.keyword"
//             //     }
//             // },
//             // "state_country_count": {
//             //     "cardinality": {
//             //         "field": "state-country.keyword"

//             //     }
//             // },
//             // "country_count": {
//             //     "cardinality": {
//             //         "field": "geo_info.country.keyword"

//             //     }
//             // },
//             lat_lon_locations: {
//               terms: {
//                 field: "lat-lon.keyword",
//                 size: maxGeoPoints,
//               },
//             },
//             // "city_state_locations": {
//             //     "terms": {
//             //         "field": "city-state-country.keyword",
//             //         "size": maxGeoPoints
//             //     }
//             // },
//             // "state_country_locations": {
//             //     "terms": {
//             //         "field": "state-country.keyword",
//             //         "size": maxGeoPoints
//             //     }
//             // },
//             // "country_locations": {
//             //     "terms": {
//             //         "field": "geo_info.country.keyword",
//             //         "size": maxGeoPoints
//             //     }
//             // }
//           },
//         },
//       },
//     };
//     if (logAttributes) {
//       logAttributes.map((attr) => {
//         param.aggs.lat_lon_data.filter.bool.must.push(attr);
//       });
//     }

//     if (labels) {
//       labels.map((attr) => {
//         param.aggs.lat_lon_data.filter.bool.must.push(attr);
//       });
//     }
//     const queryParam = {
//       query: param,
//     };
//     postData("/jas/entity/search" + entityPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

// export const getRiskStats = (granularity, param, latLongCache) => {
//   return new Promise((resolve, reject) => {
//     const queryParam = {
//       query: param,
//     };
//     postData("/jas/entity/search" + entityPath, queryParam)
//       .then((rawRiskData) => {
//         if (granularity === "lat-lon.keyword") {
//           const aggrs = rawRiskData.aggregations.lat_lon_data;
//           const riskData = [];
//           Object.keys(aggrs ? aggrs : {}).map((riskLocation) => {
//             if (riskLocation !== "meta" && riskLocation !== "doc_count") {
//               const latLang = riskLocation.split(",");
//               let lat = latLang[0].trim();
//               let long = latLang[1].trim();
//               riskData.push({ locationLabel: riskLocation, lat, long, riskData: aggrs[riskLocation]["risk_stats"] });
//             }
//           });
//           resolve({ riskData, latLongCache });
//         } else {
//           const aggrs = rawRiskData.aggregations;
//           let riskData = [];
//           const noLocations = [];

//           Object.keys(aggrs).map((riskLocation) => {
//             if (latLongCache[riskLocation] !== null && latLongCache[riskLocation] !== undefined) {
//               const latLang = latLongCache[riskLocation].split(",");
//               let lat = latLang[0].trim();
//               let long = latLang[1].trim();
//               riskData.push({ locationLabel: riskLocation, lat, long, riskData: aggrs[riskLocation]["risk_stats"] });
//             } else {
//               noLocations.push({ riskLocation, riskData: aggrs[riskLocation]["risk_stats"] });
//             }
//           });

//           const runAllQueries = async (queries) => {
//             return new Promise(async (resolve, reject) => {
//               const batches = _.chunk(queries, 50);
//               const results = [];
//               while (batches.length) {
//                 const batch = batches.shift();
//                 const result = await Promise.all(batch.map((riskInfo) => getCode_retry(riskInfo.riskLocation, riskInfo.riskData, 3)));
//                 results.push(result);
//                 await new Promise((timeoutResolve, reject) => {
//                   setTimeout(() => {
//                     timeoutResolve(null);
//                   }, 1000);
//                 });
//               }
//               resolve(_.flatten(results));
//             });
//           };
//           if (noLocations.length > 0) {
//             const geoStartDate = new Date();
//             runAllQueries(noLocations).then((data) => {
//               const geoEndDate = new Date();
//               console.log("Geocoding Process took " + (geoEndDate.getTime() - geoStartDate.getTime()) / 1000 + " seconds");
//               data.map((riskInfo) => {
//                 riskData.push(riskInfo);
//                 latLongCache[riskInfo.locationLabel] = riskInfo.lat + "," + riskInfo.long;
//               });
//               resolve({ riskData, latLongCache });
//               store.dispatch({ type: "SET_LOADING", isLoading: false });
//             });
//           } else {
//             resolve({ riskData, latLongCache });
//             store.dispatch({ type: "SET_LOADING", isLoading: false });
//           }
//         }
//       })
//       .catch((e) => {
//         store.dispatch({ type: "SET_LOADING", isLoading: false });
//         reject(e);
//       });
//   });
// };

// const getLogAttrName = (key) => {
//   const attr = logAttributes.filter((row) => row.id === key)[0];
//   return attr.label ? attr.label : key;
// };

// export const getFilterCountAndTags = (filterObject) => {
//   let count = 0;
//   const myFilterTags = [];
//   if (filterObject.time.type !== "range") {
//     if (filterObject.time.type === "6hour") myFilterTags.push({ id: uuidv4(), type: "Time Range", value: "Last 6 hours" });
//     if (filterObject.time.type === "week") myFilterTags.push({ id: uuidv4(), type: "Time Range", value: "Last 1 week" });
//     if (filterObject.time.type === "hour") myFilterTags.push({ id: uuidv4(), type: "Time Range", value: "Last 1 hour" });
//     // if (filterObject.time.type === 'range')
//     //     myFilterTags.push({ id: uuidv4(), type: 'Time Range', value: moment(filterObject.time.startDate).format("MM/DD/yyyy, HH:mm") + " "+moment.tz(moment.tz.guess()).zoneAbbr() + ' to ' + moment(filterObject.time.endDate).format("MM/DD/yyyy, HH:mm") + " "+moment.tz(moment.tz.guess()).zoneAbbr()})
//     count++;
//   }
//   if (filterObject.risk.model !== "ensemble") {
//     myFilterTags.push({ id: uuidv4(), type: "Risk Model", value: MODELS[filterObject.risk.model] });
//     count++;
//   }
//   if (filterObject.risk.riskRange[0] !== 0 || filterObject.risk.riskRange[1] !== 100) {
//     myFilterTags.push({ id: uuidv4(), type: "Risk Range", value: "[" + filterObject.risk.riskRange[0] + "-" + filterObject.risk.riskRange[1] + "]" });
//     count++;
//   }
//   if (filterObject.logAttributes) {
//     Object.keys(filterObject.logAttributes).map((key) => {
//       if (filterObject.logAttributes[key].length > 0) {
//         count++;
//         let users = "";
//         filterObject.logAttributes[key].map((value) => {
//           users = value + ", " + users;
//         });
//         myFilterTags.push({ id: uuidv4(), type: key, value: users.substring(0, users.length - 2), label: getLogAttrName(key) });
//       }
//     });
//   }
//   if (filterObject.labels) {
//     let myLabels = "";
//     filterObject.labels.map((row) => {
//       myLabels = myLabels + row.fullLabel + ", ";
//     });
//     if (filterObject.labels.length > 0) {
//       count++;
//       myFilterTags.push({ id: uuidv4(), type: "Labels", value: myLabels.substring(0, myLabels.length - 2) });
//     }
//   }

//   return { filterCount: count, filterTags: myFilterTags };
// };

// export const getEventLogs = (param) => {
//   return new Promise((resolve, reject) => {
//     const queryParam = {
//       query: param,
//     };
//     postData("/jas/entity/search" + entityPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

// export const getLogAttributeValues = (filterObj, attributeName, attributeValue) => {
//   return new Promise((resolve, reject) => {
//     const { startDate, endDate, range } = getParamFromFilter(filterObj);

//     let aggsParam = {
//       aggs: {
//         log_attributes: {
//           filter: {
//             bool: {
//               must: [
//                 {
//                   range: range,
//                 },
//                 {
//                   range: {
//                     timestamp: {
//                       gte: startDate,
//                       lte: endDate,
//                       format: "epoch_millis",
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//           aggs: {},
//         },
//       },
//     };
//     aggsParam.aggs.log_attributes.aggs[attributeName] = { terms: { field: attributeName + ".keyword", size: 1000 } };

//     if (attributeValue) {
//       aggsParam.aggs.log_attributes.filter.bool.must.push({ wildcard: { [attributeName + ".keyword"]: { value: "*" + attributeValue + "*" } } });
//     }

//     const param = {
//       size: 0,
//       aggs: aggsParam.aggs,
//     };
//     const queryParam = {
//       query: param,
//     };
//     postData("/jas/entity/search" + entityPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

// export const updateEvent = (param) => {
//   return new Promise((resolve, reject) => {
//     const queryParam = {
//       contextId: "UI - Added Labels for this event " + uuidv4(),
//       indexingRequired: true,
//       indexInSync: true,
//       ...param,
//     };
//     postData("/jas/entity/persist" + entityPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

export const getRiskHistogramForUser = (userId, riskScore, model, dateRange) => new Promise((resolve, reject) => {
  const aggsParam = {
    aggs: {
      user_event_count: {
        filter: {
          bool: {
            must: [
              {
                term: {
                  'userId.keyword': userId,
                },
              },
            ],
          },
        },
        aggs: {
          monthly: {
            date_histogram: {
              field: 'timestamp',
              calendar_interval: 'week',
            },
            aggs: {
              high_risk: {
                filter: {
                  range: {
                    [`risk.${model}_model.score`]: {
                      gte: riskScore.ensemble,
                      lte: 100,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  if (dateRange) {
    const fromDate = dayjs(dateRange.startDate).valueOf();
    const toDate = dayjs(dateRange.endDate).valueOf();
    aggsParam.aggs.user_event_count.filter.bool.must.push({
      range: {
        timestamp: {
          gte: fromDate,
          lte: toDate,
          format: 'epoch_millis',
        },
      },
    });
  }
  const param = {
    size: 0,
    aggs: aggsParam.aggs,
  };
  const queryParam = {
    query: param,
  };
  // eslint-disable-next-line no-undef
  postData(`/jas/entity/search${entityPath}`, queryParam)
    .then((data) => {
      resolve(data);
    })
    .catch((e) => {
      reject(e);
    });
});

// export const getEventForTimeAndRisk = (userId, time, risk, model) => {
//   return new Promise((resolve, reject) => {
//     const param = {
//       size: 1000,
//       query: {
//         bool: {
//           must: [
//             {
//               range: {
//                 timestamp: time,
//               },
//             },
//             {
//               term: {
//                 "userId.keyword": {
//                   value: userId,
//                 },
//               },
//             },
//             {
//               range: {
//                 ["risk." + model + "_model.score"]: risk,
//               },
//             },
//           ],
//         },
//       },
//     };
//     const queryParam = {
//       query: param,
//     };
//     postData("/jas/entity/search" + entityPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

// export const getCauseFrequency = (userId, causes, model, dateRange) => {
//   return new Promise((resolve, reject) => {
//     const param = {
//       size: 0,
//       query: {
//         bool: {
//           must: [
//             {
//               term: {
//                 "userId.keyword": userId,
//               },
//             },
//           ],
//         },
//       },
//       aggs: {},
//     };

//     causes.map((cause) => {
//       param.query.bool.must.push({
//         exists: {
//           field: elasticMap[cause.key],
//         },
//       });
//     });

//     if (dateRange) {
//       const fromDate = dayjs(dateRange.startDate).valueOf();
//       const toDate = dayjs(dateRange.endDate).valueOf();
//       param.query.bool.must.push({
//         range: {
//           timestamp: {
//             gte: fromDate,
//             lte: toDate,
//             format: "epoch_millis",
//           },
//         },
//       });
//     }

//     if (causes.length > 0) {
//       param.aggs[causes[0].key] = {
//         terms: {
//           field: elasticMap[causes[0].key] + ".keyword",
//           size: 1000,
//         },
//       };

//       param.aggs[causes[0].key]["aggs"] = {
//         [causes[1].key]: {
//           terms: {
//             field: elasticMap[causes[1].key] + ".keyword",
//             size: 1000,
//           },
//         },
//       };
//     }

//     const queryParam = {
//       query: param,
//     };
//     postData("/jas/entity/search" + entityPath, queryParam)
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// };

export const getLogAttributesForUser = (userId, dateRange) => new Promise((resolve, reject) => {
  const aggsParam = {
    aggs: {
      log_attributes: {
        filter: {
          bool: {
            must: [
              {
                term: {
                  'userId.keyword': userId,
                },
              },
            ],
          },
        },
        aggs: {},
      },
    },
  };
  if (dateRange) {
    const fromDate = dayjs(dateRange.startDate).valueOf();
    const toDate = dayjs(dateRange.endDate).valueOf();
    aggsParam.aggs.log_attributes.filter.bool.must.push({
      range: {
        timestamp: {
          gte: fromDate,
          lte: toDate,
          format: 'epoch_millis',
        },
      },
    });
  }
  /* eslint-disable no-undef */
  const myLogAttributes = [...logAttributes];
  myLogAttributes.push({ label: 'Component', id: 'component' });
  myLogAttributes.forEach((attr) => {
    aggsParam.aggs.log_attributes.aggs[attr.id] = { terms: { field: `${attr.id}.keyword`, size: 1000 } };
  });
  const param = {
    size: 0,
    aggs: aggsParam.aggs,
  };
  const queryParam = {
    query: param,
  };
  postData(`/jas/entity/search${entityPath}`, queryParam)
    .then((data) => {
      resolve(data);
    })
    .catch((e) => {
      reject(e);
    });
});
