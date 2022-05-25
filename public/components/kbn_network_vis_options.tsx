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

import { some } from 'lodash';
import React, { useEffect } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage } from '@osd/i18n/react';
import {
  EuiButtonEmpty,
  EuiDragDropContext,
  euiDragDropReorder,
  EuiDroppable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormErrorText,
  EuiIconTip,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiSelect,
  EuiFormRow,
  EuiColorPicker,
  EuiFieldNumber
} from '@elastic/eui';

import { IAggConfigs } from '../../../../src/plugins/data/public';
import { VisOptionsProps } from '../../../../src/plugins/vis_default_editor/public';
import { NumberInputOption } from './number_input';
import { SwitchOption } from './switch';
import { TextInputOption } from './text_input';
import { totalAggregations, AggTypes } from './utils';


export interface KbnNetworkVisParams {
  type: 'table';
  showLabels: boolean;
  showPopup: boolean;
  showColorLegend: boolean;
  nodePhysics: boolean;
  firstNodeColor: string;
  secondNodeColor: string;
  shapeFirstNode: string;
  shapeSecondNode: string;
  displayArrow: boolean;
  posArrow: string;
  shapeArrow: string;
  smoothType: string;
  scaleArrow: number | '';
  minCutMetricSizeNode: number | '';
  maxNodeSize: number | '';
  minNodeSize: number | '';
  maxEdgeSize: number | '';
  minEdgeSize: number | '';
  springConstant: number | '';
  gravitationalConstant: number | '';
  labelColor: string;
}

function KbnNetworkOptions({
  stateParams,
  setValue,
}: VisOptionsProps<KbnNetworkVisParams>) {
  const shapeOptions = [
    { value: 'circle', text: 'Circle' },
    { value: 'dot', text: 'Dot' },
    { value: 'ellipse', text: 'Ellipse' },
    { value: 'database', text: 'Database' },
    { value: 'box', text: 'Box' },
    { value: 'text', text: 'Text only' },
    { value: 'diamond', text: 'Diamond' },
    { value: 'star', text: 'Star' },
    { value: 'triangle', text: 'Triangle' },
    { value: 'triangleDown', text: 'Triangle down' },
    { value: 'square', text: 'Square' }
  ];
  const arrowPositionOptions = [
    { value: 'from', text: 'Beginning' },
    { value: 'middle', text: 'Middle' },
    { value: 'to', text: 'End' },
  ];
  const smoothTypeOptions = [
    { value: 'dynamic', text: 'Dynamic' },
    { value: 'continuous', text: 'Continous anchor' },
    { value: 'discrete', text: 'Discrete anchor' },
    { value: 'diagonalCross', text: 'Diagonal anchor' },
    { value: 'straightCross', text: 'Straight line' },
    { value: 'horizontal', text: 'Horizontal anchor' },
    { value: 'vertical', text: 'Vertical anchor' },
    { value: 'curvedCW', text: 'Clock-wise curve' },
    { value: 'curvedCCW', text: 'Counter clock-wise curve' },
    { value: 'cubicBezier', text: 'Cubic bezier' },
  ];

  return (
    <div className="kbn-network-vis-params">

      <EuiPanel paddingSize="s">
        <EuiTitle size="xs">
          <h3>
            <FormattedMessage
              id="visTypeKbnNetwork.params.networkSettingsSection"
              defaultMessage="Network Settings"
            />
          </h3>
        </EuiTitle>
        <EuiSpacer size="m" />

        <SwitchOption
          label={i18n.translate('visTypeKbnNetwork.params.showLabels', {
            defaultMessage: 'Show labels',
          })}
          paramName="showLabels"
          value={stateParams.showLabels}
          setValue={setValue}
        />

        <SwitchOption
          label={i18n.translate('visTypeKbnNetwork.params.showPopup', {
            defaultMessage: 'Show Popup',
          })}
          paramName="showPopup"
          value={stateParams.showPopup}
          setValue={setValue}
        />

        <SwitchOption
          label={i18n.translate('visTypeKbnNetwork.params.showColorLegend', {
            defaultMessage: 'Show Color Legend',
          })}
          paramName="showColorLegend"
          value={stateParams.showColorLegend}
          setValue={setValue}
        />

        <SwitchOption
          label={i18n.translate('visTypeKbnNetwork.params.nodePhysics', {
            defaultMessage: 'Node Physics',
          })}
          paramName="nodePhysics"
          value={stateParams.nodePhysics}
          setValue={setValue}
        />
        
        <EuiSpacer />
        <EuiTitle size="xxs">
          <h6>Colors</h6>
        </EuiTitle>
        
        <EuiFormRow
          fullWidth
          label={
            <FormattedMessage
              id="visTypeKbnNetwork.params.firstNodeColor"
              defaultMessage="First node"
            />
          }
          display="columnCompressed"
        >
          <EuiColorPicker
            compressed={true}
            onChange={(e) => setValue('firstNodeColor', e)}
            color={stateParams.firstNodeColor}
            fullWidth
          />
        </EuiFormRow>
        
        <EuiFormRow
          fullWidth
          label={
            <FormattedMessage
              id="visTypeKbnNetwork.params.secondNodeColor"
              defaultMessage="Second node"
            />
          }
          display="columnCompressed"
        >
          <EuiColorPicker
            compressed={true}
            onChange={(e) => setValue('secondNodeColor', e)}
            color={stateParams.secondNodeColor}
            fullWidth
          />
        </EuiFormRow>
        
        <EuiFormRow
          fullWidth
          label={
            <FormattedMessage
              id="visTypeKbnNetwork.params.labelColor"
              defaultMessage="Label"
            />
          }
          display="columnCompressed"
        >
          <EuiColorPicker
            compressed={true}
            onChange={(e) => setValue('labelColor', e)}
            color={stateParams.labelColor}
            fullWidth
          />
        </EuiFormRow>
        
        <EuiSpacer />
        <EuiTitle size="xxs">
          <h6>Shapes</h6>
        </EuiTitle>
        
        <EuiFormRow label="Shape of first node" fullWidth display="columnCompressed">
          <EuiSelect
            fullWidth
            compressed={true}
            options={shapeOptions}
            value={stateParams.shapeFirstNode}
            onChange={(e) => setValue('shapeFirstNode', e.target.value)}
          />
        </EuiFormRow>
        
        <EuiFormRow label="Shape of second node" fullWidth display="columnCompressed">
          <EuiSelect
            fullWidth
            compressed={true}
            options={shapeOptions}
            value={stateParams.shapeSecondNode}
            onChange={(e) => setValue('shapeSecondNode', e.target.value)}
          />
        </EuiFormRow>
        
        <EuiSpacer/>
        <EuiTitle size="xxs">
          <h6>Size</h6>
        </EuiTitle>
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.maxNodeSize"
              defaultMessage="Max node size"
            />
          }
          value={stateParams.maxNodeSize}
          paramName="maxNodeSize"
          setValue={setValue}
        />
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.minNodeSize"
              defaultMessage="Min node size"
            />
          }
          value={stateParams.minNodeSize}
          paramName="minNodeSize"
          setValue={setValue}
        />
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.maxEdgeSize"
              defaultMessage="Max edge width"
            />
          }
          value={stateParams.maxEdgeSize}
          paramName="maxEdgeSize"
          setValue={setValue}
        />
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.minEdgeSize"
              defaultMessage="Min edge width"
            />
          }
          value={stateParams.minEdgeSize}
          paramName="minEdgeSize"
          setValue={setValue}
        />
        
        <EuiSpacer/>
        <EuiTitle size="xxs">
          <h6>Directional Edges</h6>
        </EuiTitle>
        <EuiSpacer size="s"/>
        
        <SwitchOption
          label={i18n.translate('visTypeKbnNetwork.params.displayArrow', {
            defaultMessage: 'Display directional edges',
          })}
          paramName="displayArrow"
          value={stateParams.displayArrow}
          setValue={setValue}
        />
        
        <EuiFormRow label="Endpoint position" fullWidth display="columnCompressed">
          <EuiSelect
            fullWidth
            compressed={true}
            options={arrowPositionOptions}
            value={stateParams.posArrow}
            onChange={(e) => setValue('posArrow', e.target.value)}
          />
        </EuiFormRow>
        
        <EuiFormRow label="Endpoint type" fullWidth display="columnCompressed">
          <EuiSelect
            fullWidth
            compressed={true}
            options={[
              { value: 'arrow', text: 'Arrow' },
              { value: 'circle', text: 'Circle' },
            ]}
            value={stateParams.shapeArrow}
            onChange={(e) => setValue('shapeArrow', e.target.value)}
          />
        </EuiFormRow>
        
        <EuiFormRow
          label={
            <FormattedMessage
              id="visTypeKbnNetwork.params.smoothType"
              defaultMessage="Smooth Type"
            />
          }
          fullWidth
          display="columnCompressed"
        >
          <EuiSelect
            fullWidth
            compressed={true}
            options={smoothTypeOptions}
            value={stateParams.smoothType}
            onChange={(e) => setValue('smoothType', e.target.value)}
          />
        </EuiFormRow>
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.scaleArrow"
              defaultMessage="Scale factor"
            />
          }
          value={stateParams.scaleArrow}
          paramName="scaleArrow"
          setValue={setValue}
        />
        
        <EuiSpacer/>
        <EuiTitle size="xxs">
          <h6>Network constants</h6>
        </EuiTitle>
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.springConstant"
              defaultMessage="Spring Force"
            />
          }
          value={stateParams.springConstant}
          paramName="springConstant"
          setValue={setValue}
        />
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.gravitationalConstant"
              defaultMessage="Attraction Force"
            />
          }
          value={stateParams.gravitationalConstant}
          paramName="gravitationalConstant"
          setValue={setValue}
        />
        
        <EuiSpacer/>
        <EuiTitle size="xxs">
          <h6>Top values</h6>
        </EuiTitle>
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.maxCutMetricSizeNode"
              defaultMessage="Node size"
            />
          }
          value={stateParams.maxCutMetricSizeNode}
          paramName="maxCutMetricSizeNode"
          setValue={setValue}
        />
        
        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.maxCutMetricSizeEdge"
              defaultMessage="Edge size"
            />
          }
          value={stateParams.maxCutMetricSizeEdge}
          paramName="maxCutMetricSizeEdge"
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <FormattedMessage
              id="visTypeTable.params.minCutMetricSizeNode"
              defaultMessage="Don't show nodes below this value"
            />
          }
          value={stateParams.minCutMetricSizeNode}
          paramName="minCutMetricSizeNode"
          setValue={setValue}
        />

      </EuiPanel>
      {/* /NETOWRK SETTINGS SECTION */}

      <EuiSpacer size="m" />

    </div>
  );
}

// default export required for React.Lazy
// eslint-disable-next-line import/no-default-export
export { KbnNetworkOptions as default };
