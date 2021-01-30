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

import $ from 'jquery';
import _ from 'lodash';
import AggConfigResult from '../data_load/agg_config_result';
import tableCellFilterHtml from './table_cell_filter.html';

export function KbnNetworkRows($compile) {
  return {
    restrict: 'A',
    link: function ($scope, $el, attr) {
      function addCell($tr, contents, iColumn, row) {
        function createCell() {
          return $(document.createElement('td'));
        }

        function createFilterableCell(aggConfigResult) {
          const $template = $(tableCellFilterHtml);
          $template.addClass('kbnKbnNetworkCellFilter__hover');

          const scope = $scope.$new();

          scope.onFilterClick = (event, negate) => {
            // Don't add filter if a link was clicked.
            if ($(event.target).is('a')) {
              return;
            }

            $scope.filter({ data: [{
              table: $scope.table,
              row: $scope.rows.findIndex(r => r === row),
              column: iColumn,
              value: aggConfigResult.value
            }], negate });
          };

          return $compile($template)(scope);
        }

        let $cell;
        let $cellContent;

        if (contents instanceof AggConfigResult) {
          const field = contents.aggConfig.getField();
          const isCellContentFilterable =
            contents.aggConfig.isFilterable()
            && (!field || field.filterable);

          if (isCellContentFilterable) {
            $cell = createFilterableCell(contents);
            $cellContent = $cell.find('[data-cell-content]');
          } else {
            $cell = $cellContent = createCell();
          }

          if (row.cssStyle !== undefined || contents.cssStyle  !== undefined) {
            let cssStyle = (row.cssStyle !== undefined) ? row.cssStyle : '';
            if (contents.cssStyle  !== undefined) {
              cssStyle += '; ' + contents.cssStyle;
            }
            $cell.attr('style', cssStyle);
            if (cssStyle.indexOf('background') !== -1) {
              $cell.addClass('cell-custom-background-hover');
            }
          }

          // An AggConfigResult can "enrich" cell contents by applying a field formatter,
          // which we want to do if possible.
          contents = contents.toString('html');
        } else {
          $cell = $cellContent = createCell();
        }

        if (_.isObject(contents)) {

          if (contents.class) {
            $cellContent.addClass(contents.class);
          }

          if (contents.scope) {
            $cellContent = $compile($cellContent.prepend(contents.markup))(contents.scope);
          } else {
            $cellContent.prepend(contents.markup);
          }

          if (contents.attr) {
            $cellContent.attr(contents.attr);
          }
        } else {
          if (contents === '') {
            $cellContent.prepend('&nbsp;');
          } else {
            $cellContent.prepend(contents);
          }
        }

        $tr.append($cell);
      }

      function maxRowSize(max, row) {
        return Math.max(max, row.length);
      }

      $scope.$watchMulti([
        attr.kbnNetworkRows,
        attr.kbnNetworkRowsMin
      ], function (vals) {
        let rows = vals[0];
        const min = vals[1];

        $el.empty();

        if (!Array.isArray(rows)) rows = [];
        const width = rows.reduce(maxRowSize, 0);

        if (isFinite(min) && rows.length < min) {
          // clone the rows so that we can add elements to it without upsetting the original
          rows = _.clone(rows);
          // crate the empty row which will be pushed into the row list over and over
          const emptyRow = new Array(width);
          // fill the empty row with values
          _.times(width, function (i) { emptyRow[i] = ''; });
          // push as many empty rows into the row array as needed
          _.times(min - rows.length, function () { rows.push(emptyRow); });
        }

        rows.forEach(function (row) {
          const $tr = $(document.createElement('tr')).appendTo($el);
          $scope.columns.forEach(function (column, iColumn) {
            const value = row[iColumn];
            addCell($tr, value, iColumn, row);
          });
        });
      });
    }
  };
}
