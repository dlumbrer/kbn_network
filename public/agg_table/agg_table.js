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
import { CSV_SEPARATOR_SETTING, CSV_QUOTE_VALUES_SETTING } from '../../../../src/plugins/share/public';
import aggTableTemplate from './agg_table.html';
import { getFormatService } from '../services';
import { fieldFormatter } from '../field_formatter';

export function KbnNetworkAggTable(config, RecursionHelper) {
  const fieldFormats = getFormatService();
  const numberFormatter = fieldFormats.getDefaultInstance('number').getConverterFor('text');

  return {
    restrict: 'E',
    template: aggTableTemplate,
    scope: {
      table: '=',
      perPage: '=?',
      sort: '=?',
      exportTitle: '=?',
      showTotal: '=',
      totalFunc: '=',
      filter: '=',
    },
    controllerAs: 'aggTable',
    compile: function ($el) {
    // Use the compile function from the RecursionHelper,
    // And return the linking function(s) which it returns
      return RecursionHelper.compile($el);
    },
    controller: function ($scope) {
      const self = this;

      self._saveAs = require('@elastic/filesaver').saveAs;
      self.csv = {
        separator: config.get(CSV_SEPARATOR_SETTING),
        quoteValues: config.get(CSV_QUOTE_VALUES_SETTING)
      };

      self.exportAsCsv = function (formatted) {
        const csv = new Blob([self.toCsv(formatted)], { type: 'text/plain;charset=utf-8' });
        self._saveAs(csv, self.csv.filename);
      };

      self.toCsv = function (formatted) {
        const rows = $scope.table.rows;
        const columns = formatted ? $scope.formattedColumns : $scope.table.columns;
        const nonAlphaNumRE = /[^a-zA-Z0-9]/;
        const allDoubleQuoteRE = /"/g;

        function escape(val) {
          if (!formatted && _.isObject(val)) val = val.valueOf();
          val = String(val);
          if (self.csv.quoteValues && nonAlphaNumRE.test(val)) {
            val = '"' + val.replace(allDoubleQuoteRE, '""') + '"';
          }
          return val;
        }

        // escape each cell in each row
        const csvRows = rows.map(function (row) {
          return row.map(escape);
        });

        // add the columns to the rows
        csvRows.unshift(columns.map(function (col) {
          return escape(col.title);
        }));

        return csvRows.map(function (row) {
          return row.join(self.csv.separator) + '\r\n';
        }).join('');
      };

      $scope.$watch('table', function () {
        const table = $scope.table;

        if (!table) {
          $scope.rows = null;
          $scope.formattedColumns = null;
          return;
        }

        self.csv.filename = ($scope.exportTitle || table.title || 'unsaved') + '.csv';
        $scope.rows = table.rows;
        $scope.formattedColumns = table.columns.map(function (col, i) {
          const agg = col.aggConfig;
          const field = agg.getField();
          const formattedColumn = {
            title: col.title,
            filterable: field && field.filterable && agg.type.type === 'buckets',
            titleAlignmentClass: col.titleAlignmentClass,
            totalAlignmentClass: col.totalAlignmentClass
          };

          const last = i === (table.columns.length - 1);

          if (last || (agg.type.type === 'metrics')) {
            formattedColumn.class = 'visualize-table-right';
          }

          let isFieldNumeric = false;
          let isFieldDate = false;
          const aggType = agg.type;
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

          if (isFieldNumeric || isFieldDate || $scope.totalFunc === 'count') {
            const sum = function (tableRows) {
              return _.reduce(tableRows, function (prev, curr) {
              // some metrics return undefined for some of the values
              // derivative is an example of this as it returns undefined in the first row
                if (curr[i].value === undefined) return prev;
                return prev + curr[i].value;
              }, 0);
            };
            const formatter = col.totalFormatter ? col.totalFormatter('text') : fieldFormatter(agg, 'text');

            if (col.totalFormula !== undefined) {
              formattedColumn.total = formatter(col.total);
            }
            else {
              switch ($scope.totalFunc) {
              case 'sum':
                if (!isFieldDate) {
                  formattedColumn.total = formatter(sum(table.rows));
                }
                break;
              case 'avg':
                if (!isFieldDate) {
                  formattedColumn.total = formatter(sum(table.rows) / table.rows.length);
                }
                break;
              case 'min':
                formattedColumn.total = formatter(_.chain(table.rows).map(i).map('value').min().value());
                break;
              case 'max':
                formattedColumn.total = formatter(_.chain(table.rows).map(i).map('value').max().value());
                break;
              case 'count':
                formattedColumn.total = numberFormatter(table.rows.length);
                break;
              default:
                break;
              }
            }
          }

          if (i === 0 && table.totalLabel !== undefined && table.columns.length > 0 && formattedColumn.total === undefined) {
            formattedColumn.total = table.totalLabel;
          }

          return formattedColumn;
        });
      });
    }
  };
}
