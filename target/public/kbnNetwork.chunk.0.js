(window["kbnNetwork_bundle_jsonpfunction"] = window["kbnNetwork_bundle_jsonpfunction"] || []).push([[0],{

/***/ "./public/components/kbn_network_vis_options.tsx":
/*!*******************************************************!*\
  !*** ./public/components/kbn_network_vis_options.tsx ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return KbnNetworkOptions; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @kbn/i18n */ "@kbn/i18n");
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @kbn/i18n/react */ "@kbn/i18n/react");
/* harmony import */ var _kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../src/plugins/charts/public */ "plugin/charts/public");
/* harmony import */ var _src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _switch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./switch */ "./public/components/switch.tsx");
/* harmony import */ var _text_input__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./text_input */ "./public/components/text_input.tsx");
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








function KbnNetworkOptions({
  stateParams,
  setValue
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "kbn-network-vis-params"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_3__["EuiPanel"], {
    paddingSize: "s"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_3__["EuiTitle"], {
    size: "xs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
    id: "visTypeKbnNetwork.params.networkSettingsSection",
    defaultMessage: "Network Settings"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_3__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_5__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_1__["i18n"].translate('visTypeKbnNetwork.params.showLabels', {
      defaultMessage: 'Show labels'
    }),
    paramName: "showLabels",
    value: stateParams.showLabels,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_5__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_1__["i18n"].translate('visTypeKbnNetwork.params.showPopup', {
      defaultMessage: 'Show Popup'
    }),
    paramName: "showPopup",
    value: stateParams.showPopup,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_5__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_1__["i18n"].translate('visTypeKbnNetwork.params.showColorLegend', {
      defaultMessage: 'Show Color Legend'
    }),
    paramName: "showColorLegend",
    value: stateParams.showColorLegend,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_5__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_1__["i18n"].translate('visTypeKbnNetwork.params.nodePhysics', {
      defaultMessage: 'Node Physics'
    }),
    paramName: "nodePhysics",
    value: stateParams.nodePhysics,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_5__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_1__["i18n"].translate('visTypeKbnNetwork.params.displayArrow', {
      defaultMessage: 'Display arrows'
    }),
    paramName: "displayArrow",
    value: stateParams.displayArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.firstNodeColor",
      defaultMessage: "First node color"
    }), "\xA0"),
    placeholder: "#000000",
    paramName: "firstNodeColor",
    value: stateParams.firstNodeColor,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.secondNodeColor",
      defaultMessage: "Second node color"
    }), "\xA0"),
    placeholder: "#000000",
    paramName: "secondNodeColor",
    value: stateParams.secondNodeColor,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.shapeFirstNode",
      defaultMessage: "Shape of first node"
    }), "\xA0"),
    placeholder: "dot",
    paramName: "shapeFirstNode",
    value: stateParams.shapeFirstNode,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.shapeSecondNode",
      defaultMessage: "Shape of second node"
    }), "\xA0"),
    placeholder: "dot",
    paramName: "shapeSecondNode",
    value: stateParams.shapeSecondNode,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.posArrow",
      defaultMessage: "Arrow position"
    }), "\xA0"),
    placeholder: "to",
    paramName: "posArrow",
    value: stateParams.posArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.shapeArrow",
      defaultMessage: "Shape of the arrow"
    }), "\xA0"),
    placeholder: "arrow",
    paramName: "shapeArrow",
    value: stateParams.shapeArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.smoothType",
      defaultMessage: "Smooth Type"
    }), "\xA0"),
    placeholder: "continous",
    paramName: "smoothType",
    value: stateParams.smoothType,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_6__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeKbnNetwork.params.labelColor",
      defaultMessage: "Label color"
    }), "\xA0"),
    placeholder: "#000000",
    paramName: "labelColor",
    value: stateParams.labelColor,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.scaleArrow",
      defaultMessage: "Arrow scale"
    }), ' '),
    paramName: "scaleArrow",
    value: stateParams.scaleArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.minCutMetricSizeNode",
      defaultMessage: "Don't show nodes below this value:"
    }), ' '),
    paramName: "minCutMetricSizeNode",
    value: stateParams.minCutMetricSizeNode,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.maxNodeSize",
      defaultMessage: "Max node size"
    }), ' '),
    paramName: "maxNodeSize",
    value: stateParams.maxNodeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.minNodeSize",
      defaultMessage: "Min node size"
    }), ' '),
    paramName: "minNodeSize",
    value: stateParams.minNodeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.maxEdgeSize",
      defaultMessage: "Max edge size"
    }), ' '),
    paramName: "maxEdgeSize",
    value: stateParams.maxEdgeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.minEdgeSize",
      defaultMessage: "Min edge size"
    }), ' '),
    paramName: "minEdgeSize",
    value: stateParams.minEdgeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.springConstant",
      defaultMessage: "Spring Force"
    }), ' '),
    paramName: "springConstant",
    value: stateParams.springConstant,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_4__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "visTypeTable.params.gravitationalConstant",
      defaultMessage: "Attraction Force"
    }), ' '),
    paramName: "gravitationalConstant",
    value: stateParams.gravitationalConstant,
    setValue: setValue
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_3__["EuiSpacer"], {
    size: "m"
  }));
} // default export required for React.Lazy
// eslint-disable-next-line import/no-default-export




/***/ }),

/***/ "./public/components/switch.tsx":
/*!**************************************!*\
  !*** ./public/components/switch.tsx ***!
  \**************************************/
/*! exports provided: SwitchOption */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SwitchOption", function() { return SwitchOption; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__);
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



function SwitchOption({
  'data-test-subj': dataTestSubj,
  icontip,
  label,
  disabled,
  paramName,
  value = false,
  setValue
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
    fullWidth: true,
    compressed: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiSwitch"], {
    compressed: true,
    label: label,
    checked: value,
    disabled: disabled,
    "data-test-subj": dataTestSubj,
    onChange: ev => setValue(paramName, ev.target.checked)
  }), icontip && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", null, "\xA0"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiIconTip"], {
    content: icontip,
    position: "right"
  }))));
}



/***/ }),

/***/ "./public/components/text_input.tsx":
/*!******************************************!*\
  !*** ./public/components/text_input.tsx ***!
  \******************************************/
/*! exports provided: TextInputOption */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextInputOption", function() { return TextInputOption; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__);
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



function TextInputOption({
  'data-test-subj': dataTestSubj,
  disabled,
  helpText,
  error,
  isInvalid,
  label,
  placeholder,
  paramName,
  value = '',
  setValue
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
    helpText: helpText,
    label: label,
    error: error,
    isInvalid: isInvalid,
    fullWidth: true,
    compressed: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFieldText"], {
    compressed: true,
    fullWidth: true,
    isInvalid: isInvalid,
    placeholder: placeholder,
    "data-test-subj": dataTestSubj,
    disabled: disabled,
    value: value,
    onChange: ev => setValue(paramName, ev.target.value)
  }));
}



/***/ })

}]);
//# sourceMappingURL=kbnNetwork.chunk.0.js.map