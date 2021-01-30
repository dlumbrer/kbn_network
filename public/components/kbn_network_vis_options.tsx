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
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { EuiButtonEmpty, EuiDragDropContext, euiDragDropReorder, EuiDroppable, EuiFlexGroup, EuiFlexItem, EuiFormErrorText, EuiIconTip, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';

import { IAggConfigs } from '../../../../src/plugins/data/public';
import { VisOptionsProps } from '../../../../src/plugins/vis_default_editor/public';
import { NumberInputOption, SelectOption } from '../../../../src/plugins/charts/public';
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

        <SwitchOption
          label={i18n.translate('visTypeKbnNetwork.params.displayArrow', {
            defaultMessage: 'Display arrows',
          })}
          paramName="displayArrow"
          value={stateParams.displayArrow}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.firstNodeColor"
                defaultMessage="First node color"
              />
              &nbsp;
            </>
          }
          placeholder="#000000"
          paramName="firstNodeColor"
          value={stateParams.firstNodeColor}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.secondNodeColor"
                defaultMessage="Second node color"
              />
              &nbsp;
            </>
          }
          placeholder="#000000"
          paramName="secondNodeColor"
          value={stateParams.secondNodeColor}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.shapeFirstNode"
                defaultMessage="Shape of first node"
              />
              &nbsp;
            </>
          }
          placeholder="dot"
          paramName="shapeFirstNode"
          value={stateParams.shapeFirstNode}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.shapeSecondNode"
                defaultMessage="Shape of second node"
              />
              &nbsp;
            </>
          }
          placeholder="dot"
          paramName="shapeSecondNode"
          value={stateParams.shapeSecondNode}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.posArrow"
                defaultMessage="Arrow position"
              />
              &nbsp;
            </>
          }
          placeholder="to"
          paramName="posArrow"
          value={stateParams.posArrow}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.shapeArrow"
                defaultMessage="Shape of the arrow"
              />
              &nbsp;
            </>
          }
          placeholder="arrow"
          paramName="shapeArrow"
          value={stateParams.shapeArrow}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.smoothType"
                defaultMessage="Smooth Type"
              />
              &nbsp;
            </>
          }
          placeholder="continous"
          paramName="smoothType"
          value={stateParams.smoothType}
          setValue={setValue}
        />

        <TextInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeKbnNetwork.params.labelColor"
                defaultMessage="Label color"
              />
              &nbsp;
            </>
          }
          placeholder="#000000"
          paramName="labelColor"
          value={stateParams.labelColor}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.scaleArrow"
                defaultMessage="Arrow scale"
              />{' '}
            </>
          }
          paramName="scaleArrow"
          value={stateParams.scaleArrow}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.minCutMetricSizeNode"
                defaultMessage="Don't show nodes below this value:"
              />{' '}
            </>
          }
          paramName="minCutMetricSizeNode"
          value={stateParams.minCutMetricSizeNode}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.maxNodeSize"
                defaultMessage="Max node size"
              />{' '}
            </>
          }
          paramName="maxNodeSize"
          value={stateParams.maxNodeSize}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.minNodeSize"
                defaultMessage="Min node size"
              />{' '}
            </>
          }
          paramName="minNodeSize"
          value={stateParams.minNodeSize}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.maxEdgeSize"
                defaultMessage="Max edge size"
              />{' '}
            </>
          }
          paramName="maxEdgeSize"
          value={stateParams.maxEdgeSize}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.minEdgeSize"
                defaultMessage="Min edge size"
              />{' '}
            </>
          }
          paramName="minEdgeSize"
          value={stateParams.minEdgeSize}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.springConstant"
                defaultMessage="Spring Force"
              />{' '}
            </>
          }
          paramName="springConstant"
          value={stateParams.springConstant}
          setValue={setValue}
        />

        <NumberInputOption
          label={
            <>
              <FormattedMessage
                id="visTypeTable.params.gravitationalConstant"
                defaultMessage="Attraction Force"
              />{' '}
            </>
          }
          paramName="gravitationalConstant"
          value={stateParams.gravitationalConstant}
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
