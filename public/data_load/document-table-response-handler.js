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

import { get } from 'lodash';
import { serializeAggConfig } from './kibana_cloned_code/utils';
import AggConfigResult from './agg_config_result';

function createColumn(fieldColumn, index, response, aggConfigs) {

  const aggConfigOptions = {
    id: `${index}`,
    enabled: true,
    type: 'terms',
    schema: 'bucket',
    params: {
      field: aggConfigs.indexPattern.fields.getByName(fieldColumn.field.name)
    }
  };

  // create new column object
  const columnTitle = fieldColumn.label ? fieldColumn.label : fieldColumn.field.name;
  const newColumn = {
    id: `col-${index}`,
    aggConfig: aggConfigs.createAggConfig(aggConfigOptions),
    name: columnTitle,
    title: columnTitle
  };
  newColumn.meta = serializeAggConfig(newColumn.aggConfig);
  newColumn.aggConfig.isFilterable = () => newColumn.aggConfig.params.field.aggregatable;

  return newColumn;
}

const createCell = function (hit, column, parent) {
  let value = get(hit._source, column.aggConfig.fieldName(), null);
  if (value === null) {
    if ((column.aggConfig.getField().readFromDocValues || column.aggConfig.getField().scripted) && hit.fields !== undefined) {
      value = get(hit.fields, column.aggConfig.fieldName(), null);
      if (value !== null && value.length === 1) {
        value = value[0];
      }
    }
    else if (column.aggConfig.fieldName().startsWith('_')) {
      value = get(hit, column.aggConfig.fieldName(), null);
    }
  }
  const newCell = new AggConfigResult(column.aggConfig, parent, value, value);
  return newCell;
};

function createRow(hit, response, columns) {
  const newRow = [];
  columns.forEach( (column, i) => {
    newRow[i] = createCell(hit, column, newRow.length > 0 && newRow[newRow.length-1]);
    newRow[column.id] = newRow[i].value;
  });
  return newRow;
}

function createTable(response) {
  const table = { columns: [], rows: [] };

  const aggConfigs = response.aggs;
  aggConfigs.aggs = [];

  response.fieldColumns.forEach( (fieldColumn, index) => {
    if (fieldColumn.enabled) {
      const newColumn = createColumn(fieldColumn, index, response, aggConfigs);
      table.columns.push(newColumn);
    }
  });

  response.hits.forEach( hit => {
    const newRow = createRow(hit, response, table.columns);
    table.rows.push(newRow);
  });

  return table;
}

export function documentTableResponseHandler(response) {
  return { tables: [ createTable(response) ], totalHits: response.totalHits, aggs: response.aggs, newResponse: true };
}
