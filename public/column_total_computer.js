/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';

function sum(tableRows, columnIndex) {
  return _.reduce(tableRows, function (prev, curr) {
  // some metrics return undefined for some of the values
  // derivative is an example of this as it returns undefined in the first row
    if (curr[columnIndex].value === undefined) return prev;
    return prev + curr[columnIndex].value;
  }, 0);
}

/**
 * Compute and return one column total, given its column index and total function
 */
export function computeColumnTotal(columnIndex, totalFunc, table) {
  let total = undefined;
  let isFieldNumeric = false;
  let isFieldDate = false;
  const column = table.columns[columnIndex];
  const agg = column.aggConfig;
  const aggType = agg.type;
  const field = agg.params.field;

  if (aggType && aggType.type === 'metrics') {
    if (aggType.name === 'top_hits') {
      if (agg.params.aggregate.value !== 'concat') {
      // all other aggregate types for top_hits output numbers
      // so treat this field as numeric
        isFieldNumeric = true;
      }
    } else if(aggType.name === 'cardinality') {
      // Unique count aggregations always produce a numeric value
      isFieldNumeric = true;
    } else if (field) {
    // if the metric has a field, check if it is either number or date
      isFieldNumeric = field.type === 'number';
      isFieldDate = field.type === 'date';
    } else {
    // if there is no field, then it is count or similar so just say number
      isFieldNumeric = true;
    }
  } else if (field) {
    isFieldNumeric = field.type === 'number';
    isFieldDate = field.type === 'date';
  }

  if (isFieldNumeric || isFieldDate || totalFunc === 'count') {
    switch (totalFunc) {
    case 'sum':
      if (!isFieldDate) {
        total = sum(table.rows, columnIndex);
      }
      break;
    case 'avg':
      if (!isFieldDate) {
        total = sum(table.rows, columnIndex) / table.rows.length;
      }
      break;
    case 'min':
      total = _.chain(table.rows).map(columnIndex).map('value').min().value();
      break;
    case 'max':
      total = _.chain(table.rows).map(columnIndex).map('value').max().value();
      break;
    case 'count':
      total = table.rows.length;
      break;
    default:
      break;
    }
  }

  return total;
}
