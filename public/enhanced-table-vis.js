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

import { i18n } from '@kbn/i18n';
import { AggGroupNames } from '../../../src/plugins/data/public';
import { Schemas } from '../../../src/plugins/vis_default_editor/public';

import tableVisTemplate from './enhanced-table-vis.html';
import { getEnhancedTableVisualizationController } from './vis_controller';
import { enhancedTableRequestHandler } from './data_load/enhanced-table-request-handler';
import { enhancedTableResponseHandler } from './data_load/enhanced-table-response-handler';
import { EnhancedTableOptions } from './components/enhanced_table_vis_options_lazy';
import { VIS_EVENT_TO_TRIGGER } from '../../../src/plugins/visualizations/public';
import './enhanced-table-vis.scss'


// define the visType object, which kibana will use to display and configure new Vis object of this type.
export function enhancedTableVisTypeDefinition(core, context) {
  return {
    type: 'table',
    name: 'enhanced-table',
    title: i18n.translate('visTypeEnhancedTable.visTitle', {
      defaultMessage: 'Enhanced Table'
    }),
    icon: 'visTable',
    description: i18n.translate('visTypeEnhancedTable.visDescription', {
      defaultMessage: 'Same functionality than Data Table, but with enhanced features like computed columns, filter bar and pivot table.'
    }),
    visualization: getEnhancedTableVisualizationController(core, context),
    getSupportedTriggers: () => {
      return [VIS_EVENT_TO_TRIGGER.filter];
    },
    visConfig: {
      defaults: {
        perPage: 10,
        showPartialRows: false,
        showMetricsAtAllLevels: false,
        sort: {
          columnIndex: null,
          direction: null
        },
        showTotal: false,
        totalFunc: 'sum',
        computedColumns: [],
        computedColsPerSplitCol: false,
        hideExportLinks: false,
        stripedRows: false,
        addRowNumberColumn: false,
        showFilterBar: false,
        filterCaseSensitive: false,
        filterBarHideable: false,
        filterAsYouType: false,
        filterTermsSeparately: false,
        filterHighlightResults: false,
        filterBarWidth: '25%',



        showLabels: true,
        showPopup: true,
        showColorLegend: true,
        nodePhysics: true,
        firstNodeColor: '#6F86D7',
        secondNodeColor: '#DAA05D',
        shapeFirstNode: 'dot',
        shapeSecondNode: 'box',
        displayArrow: false,
        posArrow: 'to',
        shapeArrow: 'arrow',
        smoothType: 'continuous',
        scaleArrow: 1,
        minCutMetricSizeNode: 0,
        maxNodeSize: 80,
        minNodeSize: 8,
        maxEdgeSize: 20,
        minEdgeSize: 0.1,
        springConstant: 0.001,
        gravitationalConstant: -35000,
        labelColor: '#000000',
      },
      template: tableVisTemplate
    },
    editorConfig: {
      optionsTemplate: EnhancedTableOptions,
      schemas: new Schemas([
        {
          group: AggGroupNames.Metrics,
          name: 'size_node',
          title: 'Node Size',
          aggFilter: ['!geo_centroid', '!geo_bounds'],
          aggSettings: {
            top_hits: {
              allowStrings: false
            }
          },
          mustBeFirst: 'true',
          min: 1,
          max: 1,
          defaults: [{ type: 'count', schema: 'size_node' }]
        },
        {
          group: AggGroupNames.Metrics,
          name: 'size_edge',
          title: 'Edge Size',
          aggFilter: ['!geo_centroid', '!geo_bounds'],
          aggSettings: {
            top_hits: {
              allowStrings: false
            }
          },
          max: 1,
          defaults: [{ type: 'count', schema: 'size_edge' }]
        },
        {
          group: AggGroupNames.Buckets,
          name: 'first',
          title: "Node",
          mustBeFirst: 'true',
          min: 1,
          max: 2,
          aggFilter: ['terms']
        },
        {
          group: AggGroupNames.Buckets,
          name: 'second',
          title: "Relation",
          max: 1,
          aggFilter: ['terms']
        },
        {
          group: AggGroupNames.Buckets,
          name: 'colornode',
          title: "Node Color",
          mustBeFirst: 'true',
          max: 1,
          aggFilter: ['terms']
        }
      ])
    },
    requestHandler: enhancedTableRequestHandler,
    responseHandler: enhancedTableResponseHandler,
    hierarchicalData: (vis) => {
      return true;
    }
  };
}
