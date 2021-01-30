(window["enhancedTable_bundle_jsonpfunction"] = window["enhancedTable_bundle_jsonpfunction"] || []).push([[0],{

/***/ "./public/components/computed_column.tsx":
/*!***********************************************!*\
  !*** ./public/components/computed_column.tsx ***!
  \***********************************************/
/*! exports provided: ComputedColumnEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComputedColumnEditor", function() { return ComputedColumnEditor; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @kbn/i18n */ "@kbn/i18n");
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @kbn/i18n/react */ "@kbn/i18n/react");
/* harmony import */ var _kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../src/plugins/charts/public */ "plugin/charts/public");
/* harmony import */ var _src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _switch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./switch */ "./public/components/switch.tsx");
/* harmony import */ var _text_input__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./text_input */ "./public/components/text_input.tsx");
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









function setComputedColumnParam(paramName, paramValue, computedColumns, computedColumnToUpdate, setComputedColumns) {
  const newList = computedColumns.map(computedColumn => {
    if (computedColumn === computedColumnToUpdate) {
      const updatedComputedColumn = Object(lodash__WEBPACK_IMPORTED_MODULE_0__["clone"])(computedColumnToUpdate);
      updatedComputedColumn[paramName] = paramValue;
      return updatedComputedColumn;
    } else {
      return computedColumn;
    }
  });
  setComputedColumns(newList);
}

function removeComputedColumn(computedColumns, computedColumnToRemove, setComputedColumns) {
  const newList = computedColumns.filter(computedColumn => computedColumn !== computedColumnToRemove);
  setComputedColumns(newList);
}

function renderButtons(computedColumn, computedColumns, showError, setValue, setComputedColumns, dragHandleProps) {
  const actionIcons = [];

  if (showError) {
    actionIcons.push({
      id: 'hasErrors',
      color: 'danger',
      type: 'alert',
      tooltip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.errorsAriaLabel', {
        defaultMessage: 'Computed column has errors'
      })
    });
  }

  if (computedColumn.enabled) {
    actionIcons.push({
      id: 'disableComputedColumn',
      color: 'text',
      disabled: false,
      type: 'eye',
      onClick: () => setValue('enabled', false),
      tooltip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.disableColumnButtonTooltip', {
        defaultMessage: 'Disable column'
      })
    });
  }

  if (!computedColumn.enabled) {
    actionIcons.push({
      id: 'enableComputedColumn',
      color: 'text',
      type: 'eyeClosed',
      onClick: () => setValue('enabled', true),
      tooltip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.enableColumnButtonTooltip', {
        defaultMessage: 'Enable column'
      })
    });
  }

  if (computedColumns.length > 1) {
    actionIcons.push({
      id: 'dragHandle',
      type: 'grab',
      tooltip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.modifyPriorityButtonTooltip', {
        defaultMessage: 'Modify order by dragging'
      })
    });
  }

  actionIcons.push({
    id: 'removeComputedColumn',
    color: 'danger',
    type: 'cross',
    onClick: () => removeComputedColumn(computedColumns, computedColumn, setComputedColumns),
    tooltip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.removeColumnButtonTooltip', {
      defaultMessage: 'Remove column'
    })
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", dragHandleProps, actionIcons.map(icon => {
    if (icon.id === 'dragHandle') {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiIconTip"], {
        key: icon.id,
        type: icon.type,
        content: icon.tooltip,
        iconProps: {
          ['aria-label']: icon.tooltip
        },
        position: "bottom"
      });
    }

    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiToolTip"], {
      key: icon.id,
      position: "bottom",
      content: icon.tooltip
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiButtonIcon"], {
      disabled: icon.disabled,
      iconType: icon.type,
      color: icon.color,
      onClick: icon.onClick,
      "aria-label": icon.tooltip
    }));
  }));
}

function formatOptions() {
  return [{
    value: 'number',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.formatOptions.number', {
      defaultMessage: 'Number'
    })
  }, {
    value: 'string',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.formatOptions.string', {
      defaultMessage: 'String'
    })
  }, {
    value: 'date',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.formatOptions.date', {
      defaultMessage: 'Date'
    })
  }];
}

function alignmentOptions() {
  return [{
    value: 'left',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.left', {
      defaultMessage: 'left'
    })
  }, {
    value: 'right',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.right', {
      defaultMessage: 'right'
    })
  }, {
    value: 'center',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.center', {
      defaultMessage: 'center'
    })
  }, {
    value: 'justify',
    text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.justify', {
      defaultMessage: 'justify'
    })
  }];
}

function ComputedColumnEditor({
  computedColumns,
  computedColumn,
  index,
  setComputedColumns,
  setValidity
}) {
  const setValue = (paramName, paramValue) => setComputedColumnParam(paramName, paramValue, computedColumns, computedColumn, setComputedColumns);

  const [isEditorOpen, setIsEditorOpen] = react__WEBPACK_IMPORTED_MODULE_1___default.a.useState(computedColumn.brandNew);
  const [validState, setValidState] = react__WEBPACK_IMPORTED_MODULE_1___default.a.useState(true);
  const showDescription = !isEditorOpen && validState;
  const showError = !isEditorOpen && !validState;
  const isFormulaValid = computedColumn.formula !== '';

  if (computedColumn.brandNew) {
    computedColumn.brandNew = undefined;
  }

  const buttonContent = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, "Computed col ", showDescription && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("span", null, computedColumn.label || computedColumn.formula));
  const onToggle = react__WEBPACK_IMPORTED_MODULE_1___default.a.useCallback(isOpen => {
    setIsEditorOpen(isOpen);
  }, []);
  Object(react__WEBPACK_IMPORTED_MODULE_1__["useEffect"])(() => {
    setValidity(isFormulaValid);
    setValidState(isFormulaValid);
  }, [isFormulaValid, setValidity, setValidState]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiDraggable"], {
    key: index,
    index: index,
    draggableId: `enhanced_table_computed_columns_draggable_${index}`,
    customDragHandle: true
  }, provided => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiAccordion"], {
    id: `enhanced_table_computed_columns_accordion_${index}`,
    initialIsOpen: isEditorOpen,
    buttonContent: buttonContent,
    buttonClassName: "eui-textTruncate",
    buttonContentClassName: "visEditorSidebar__aggGroupAccordionButtonContent eui-textTruncate",
    className: "visEditorSidebar__section visEditorSidebar__collapsible visEditorSidebar__collapsible--marginBottom",
    "aria-label": _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.toggleEditorButtonAriaLabel', {
      defaultMessage: 'Toggle computed column editor'
    }),
    extraAction: renderButtons(computedColumn, computedColumns, showError, setValue, setComputedColumns, provided.dragHandleProps),
    onToggle: onToggle
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.label', {
      defaultMessage: 'Label'
    }),
    paramName: "label",
    value: computedColumn.label,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.computedColumns.formula",
      defaultMessage: "Formula"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      href: "https://github.com/fbaligand/kibana-enhanced-table/blob/master/README.md#computed-settings-documentation",
      target: "_blank"
    }, "documentation"), ")"),
    isInvalid: !isFormulaValid,
    paramName: "formula",
    value: computedColumn.formula,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.computeTotalUsingFormula', {
      defaultMessage: 'Compute total using formula'
    }),
    paramName: "computeTotalUsingFormula",
    value: computedColumn.computeTotalUsingFormula,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["SelectOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.computedColumns.format', {
      defaultMessage: 'Format'
    }),
    options: formatOptions(),
    paramName: "format",
    value: computedColumn.format,
    setValue: setValue
  }), computedColumn.format === 'number' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.computedColumns.pattern",
      defaultMessage: "Pattern"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      href: "http://numeraljs.com/#format",
      target: "_blank"
    }, "Numeral.js"), "\xA0syntax)"),
    paramName: "pattern",
    value: computedColumn.pattern,
    setValue: setValue
  }), computedColumn.format === 'date' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.computedColumns.datePattern",
      defaultMessage: "Pattern"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      href: "http://momentjs.com/docs/#/displaying/format/",
      target: "_blank"
    }, "Moment.js"), "\xA0syntax)"),
    paramName: "datePattern",
    value: computedColumn.datePattern,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["SelectOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.computedColumns.alignment', {
      defaultMessage: 'Alignment'
    }),
    options: alignmentOptions(),
    paramName: "alignment",
    value: computedColumn.alignment,
    setValue: setValue
  }), computedColumn.alignment !== 'left' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.applyAlignmentOnTitle', {
      defaultMessage: 'Apply alignment on title'
    }),
    paramName: "applyAlignmentOnTitle",
    value: computedColumn.applyAlignmentOnTitle,
    setValue: setValue
  }), computedColumn.alignment !== 'left' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.applyAlignmentOnTotal', {
      defaultMessage: 'Apply alignment on total'
    }),
    paramName: "applyAlignmentOnTotal",
    value: computedColumn.applyAlignmentOnTotal,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.applyTemplate', {
      defaultMessage: 'Apply template'
    }),
    paramName: "applyTemplate",
    value: computedColumn.applyTemplate,
    setValue: setValue
  }), computedColumn.applyTemplate && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColumns.applyTemplateOnTotal', {
      defaultMessage: 'Apply template on total'
    }),
    paramName: "applyTemplateOnTotal",
    value: computedColumn.applyTemplateOnTotal,
    setValue: setValue
  }), computedColumn.applyTemplate && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.computedColumns.template",
      defaultMessage: "Template"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      "ng-href": "https://handlebarsjs.com/guide/expressions.html",
      target: "_blank"
    }, "Handlebars"), "\xA0syntax)"),
    paramName: "template",
    value: computedColumn.template,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.computedColumns.cellComputedCss",
      defaultMessage: "Cell computed CSS"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      href: "https://github.com/fbaligand/kibana-enhanced-table/blob/master/README.md#computed-settings-documentation",
      target: "_blank"
    }, "documentation"), ")\xA0", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiIconTip"], {
      content: "This option lets to define dynamically table cell CSS (like background-color CSS property), based on this column value and previous column values",
      position: "right"
    })),
    placeholder: "value < 0 ? \"background-color: red\" : \"\"",
    paramName: "cellComputedCss",
    value: computedColumn.cellComputedCss,
    setValue: setValue
  })))));
}



/***/ }),

/***/ "./public/components/enhanced_table_vis_options.tsx":
/*!**********************************************************!*\
  !*** ./public/components/enhanced_table_vis_options.tsx ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return EnhancedTableOptions; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @kbn/i18n */ "@kbn/i18n");
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @kbn/i18n/react */ "@kbn/i18n/react");
/* harmony import */ var _kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../src/plugins/charts/public */ "plugin/charts/public");
/* harmony import */ var _src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _switch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./switch */ "./public/components/switch.tsx");
/* harmony import */ var _text_input__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./text_input */ "./public/components/text_input.tsx");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils */ "./public/components/utils.ts");
/* harmony import */ var _computed_column__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./computed_column */ "./public/components/computed_column.tsx");
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











function addComputedColumn(computedColumns, setComputedColumns) {
  const newComputedColumn = {
    label: 'Value squared',
    formula: 'col0 * col0',
    computeTotalUsingFormula: false,
    format: 'number',
    pattern: '0,0',
    datePattern: 'MMMM Do YYYY, HH:mm:ss.SSS',
    alignment: 'left',
    applyAlignmentOnTitle: true,
    applyAlignmentOnTotal: true,
    applyTemplate: false,
    applyTemplateOnTotal: true,
    template: '{{value}}',
    cellComputedCss: '',
    enabled: true,
    brandNew: true
  };
  setComputedColumns(computedColumns.concat(newComputedColumn));
}

function onDragEnd(source, destination, computedColumns, setComputedColumns) {
  if (source && destination) {
    const newComputedColumns = Object(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["euiDragDropReorder"])(computedColumns, source.index, destination.index);
    setComputedColumns(newComputedColumns);
  }
}

function hasSplitColsBucket(aggs) {
  return Object(lodash__WEBPACK_IMPORTED_MODULE_0__["some"])(aggs.aggs, function (agg) {
    return agg.schema === 'splitcols' && agg.enabled;
  });
}

;

function EnhancedTableOptions({
  aggs,
  stateParams,
  setValidity,
  setValue
}) {
  const isPerPageValid = stateParams.perPage === '' || stateParams.perPage > 0;
  const computedColumnsError = undefined;

  const setComputedColumns = newComputedColumns => setValue('computedColumns', newComputedColumns);

  Object(react__WEBPACK_IMPORTED_MODULE_1__["useEffect"])(() => {
    setValidity(isPerPageValid);
  }, [isPerPageValid, setValidity]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", {
    className: "enhanced-table-vis-params"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiPanel"], {
    paddingSize: "s"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiTitle"], {
    size: "xs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
    id: "visTypeEnhancedTable.params.networkSettingsSection",
    defaultMessage: "Network Settings"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.showLabels', {
      defaultMessage: 'Show labels'
    }),
    paramName: "showLabels",
    value: stateParams.showLabels,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.showPopup', {
      defaultMessage: 'Show Popup'
    }),
    paramName: "showPopup",
    value: stateParams.showPopup,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.showColorLegend', {
      defaultMessage: 'Show Color Legend'
    }),
    paramName: "showColorLegend",
    value: stateParams.showColorLegend,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.nodePhysics', {
      defaultMessage: 'Node Physics'
    }),
    paramName: "nodePhysics",
    value: stateParams.nodePhysics,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.displayArrow', {
      defaultMessage: 'Display arrows'
    }),
    paramName: "displayArrow",
    value: stateParams.displayArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.firstNodeColor",
      defaultMessage: "First node color"
    }), "\xA0"),
    placeholder: "#000000",
    paramName: "firstNodeColor",
    value: stateParams.firstNodeColor,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.secondNodeColor",
      defaultMessage: "Second node color"
    }), "\xA0"),
    placeholder: "#000000",
    paramName: "secondNodeColor",
    value: stateParams.secondNodeColor,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.shapeFirstNode",
      defaultMessage: "Shape of first node"
    }), "\xA0"),
    placeholder: "dot",
    paramName: "shapeFirstNode",
    value: stateParams.shapeFirstNode,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.shapeSecondNode",
      defaultMessage: "Shape of second node"
    }), "\xA0"),
    placeholder: "dot",
    paramName: "shapeSecondNode",
    value: stateParams.shapeSecondNode,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.posArrow",
      defaultMessage: "Arrow position"
    }), "\xA0"),
    placeholder: "to",
    paramName: "posArrow",
    value: stateParams.posArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.shapeArrow",
      defaultMessage: "Shape of the arrow"
    }), "\xA0"),
    placeholder: "arrow",
    paramName: "shapeArrow",
    value: stateParams.shapeArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.smoothType",
      defaultMessage: "Smooth Type"
    }), "\xA0"),
    placeholder: "continous",
    paramName: "smoothType",
    value: stateParams.smoothType,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.labelColor",
      defaultMessage: "Label color"
    }), "\xA0"),
    placeholder: "#000000",
    paramName: "labelColor",
    value: stateParams.labelColor,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.scaleArrow",
      defaultMessage: "Arrow scale"
    }), ' '),
    paramName: "scaleArrow",
    value: stateParams.scaleArrow,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.minCutMetricSizeNode",
      defaultMessage: "Don't show nodes below this value:"
    }), ' '),
    paramName: "minCutMetricSizeNode",
    value: stateParams.minCutMetricSizeNode,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.maxNodeSize",
      defaultMessage: "Max node size"
    }), ' '),
    paramName: "maxNodeSize",
    value: stateParams.maxNodeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.minNodeSize",
      defaultMessage: "Min node size"
    }), ' '),
    paramName: "minNodeSize",
    value: stateParams.minNodeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.maxEdgeSize",
      defaultMessage: "Max edge size"
    }), ' '),
    paramName: "maxEdgeSize",
    value: stateParams.maxEdgeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.minEdgeSize",
      defaultMessage: "Min edge size"
    }), ' '),
    paramName: "minEdgeSize",
    value: stateParams.minEdgeSize,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.springConstant",
      defaultMessage: "Spring Force"
    }), ' '),
    paramName: "springConstant",
    value: stateParams.springConstant,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.gravitationalConstant",
      defaultMessage: "Attraction Force"
    }), ' '),
    paramName: "gravitationalConstant",
    value: stateParams.gravitationalConstant,
    setValue: setValue
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiDragDropContext"], {
    onDragEnd: ({
      source,
      destination
    }) => onDragEnd(source, destination, stateParams.computedColumns, setComputedColumns)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiPanel"], {
    paddingSize: "s"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiTitle"], {
    size: "xs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
    id: "visTypeEnhancedTable.params.computedColumnsSection",
    defaultMessage: "Computed Columns"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "s"
  }), computedColumnsError && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiFormErrorText"], null, computedColumnsError), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "s"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiDroppable"], {
    droppableId: "enhanced_table_computed_columns"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, stateParams.computedColumns.map((computedColumn, index) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_computed_column__WEBPACK_IMPORTED_MODULE_9__["ComputedColumnEditor"], {
    key: index,
    computedColumns: stateParams.computedColumns,
    computedColumn: computedColumn,
    index: index,
    setComputedColumns: setComputedColumns,
    setValidity: setValidity
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiFlexGroup"], {
    justifyContent: "center",
    responsive: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiFlexItem"], {
    grow: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiButtonEmpty"], {
    size: "xs",
    iconType: "plusInCircleFilled",
    onClick: () => addComputedColumn(stateParams.computedColumns, setComputedColumns)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
    id: "visTypeEnhancedTable.params.computedColumns.addComputedColumnLabel",
    defaultMessage: "Add computed column"
  })))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiPanel"], {
    paddingSize: "s"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiTitle"], {
    size: "xs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
    id: "visTypeEnhancedTable.params.enhancedSettingsSection",
    defaultMessage: "Enhanced Settings"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.linesComputedFilter",
      defaultMessage: "Rows computed filter"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      href: "https://github.com/fbaligand/kibana-enhanced-table/blob/master/README.md#computed-settings-documentation",
      target: "_blank"
    }, "documentation"), ")\xA0", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiIconTip"], {
      content: "Example: when 'col0 > 10', only table rows having first column value greater than 10 are displayed",
      position: "right"
    })),
    placeholder: "col0 > 10",
    paramName: "linesComputedFilter",
    value: stateParams.linesComputedFilter,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.rowsComputedCss",
      defaultMessage: "Rows computed CSS"
    }), "\xA0(", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
      href: "https://github.com/fbaligand/kibana-enhanced-table/blob/master/README.md#computed-settings-documentation",
      target: "_blank"
    }, "documentation"), ")\xA0", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiIconTip"], {
      content: "This option lets to define dynamically table row CSS (like background-color CSS property), based on its column values",
      position: "right"
    })),
    placeholder: "col1 < 0 ? \"background-color: red\" : \"\"",
    paramName: "rowsComputedCss",
    value: stateParams.rowsComputedCss,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeEnhancedTable.params.hiddenColumns",
      defaultMessage: "Hidden columns"
    }), "\xA0", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiIconTip"], {
      content: "Reference a column by its index (1,2,3), by its label (Example Column) or both (1,2,column_3). Write the column label as is (no surrounding quotes) and separate them using a comma. It is recommended to reference a column by its label.",
      position: "right"
    })),
    placeholder: "0,1,Col2 Label,...",
    paramName: "hiddenColumns",
    value: stateParams.hiddenColumns,
    setValue: setValue
  }), hasSplitColsBucket(aggs) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColsPerSplitCol', {
      defaultMessage: 'Computed/Hidden cols per split col'
    }),
    icontip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.computedColsPerSplitColIconTip', {
      defaultMessage: 'Example: when enabled, if there is one \'Split cols\' bucket that implies two columns (term1 and term2), one Count metric, and one computed column configured, then in the result table, there will be a computed column for term1 and another computed column for term2 (each displayed after count column)'
    }),
    paramName: "computedColsPerSplitCol",
    value: stateParams.computedColsPerSplitCol,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.hideExportLinks', {
      defaultMessage: 'Hide export links'
    }),
    paramName: "hideExportLinks",
    value: stateParams.hideExportLinks,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.stripedRows', {
      defaultMessage: 'Striped rows'
    }),
    paramName: "stripedRows",
    value: stateParams.stripedRows,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.addRowNumberColumn', {
      defaultMessage: 'Add row number column'
    }),
    paramName: "addRowNumberColumn",
    value: stateParams.addRowNumberColumn,
    setValue: setValue
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "s"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiPanel"], {
    paddingSize: "s"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiTitle"], {
    size: "xs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
    id: "visTypeEnhancedTable.params.basicSettingsSection",
    defaultMessage: "Basic Settings"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["NumberInputOption"], {
    label: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
      id: "visTypeTable.params.perPageLabel",
      defaultMessage: "Max rows per page"
    }), ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiIconTip"], {
      content: "Leaving this field empty means it will use number of buckets from the response.",
      position: "right"
    })),
    isInvalid: !isPerPageValid,
    min: 1,
    paramName: "perPage",
    value: stateParams.perPage,
    setValue: setValue
  }), !stateParams.fieldColumns && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.showMetricsLabel', {
      defaultMessage: 'Show metrics for every bucket/level'
    }),
    paramName: "showMetricsAtAllLevels",
    value: stateParams.showMetricsAtAllLevels,
    setValue: setValue,
    "data-test-subj": "showMetricsAtAllLevels"
  }), !stateParams.fieldColumns && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.showPartialRowsLabel', {
      defaultMessage: 'Show partial rows'
    }),
    icontip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.showPartialRowsTip', {
      defaultMessage: 'Show rows that have partial data. This will still calculate metrics for every bucket/level, even if they are not displayed.'
    }),
    paramName: "showPartialRows",
    value: stateParams.showPartialRows,
    setValue: setValue,
    "data-test-subj": "showPartialRows"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.showTotalLabel', {
      defaultMessage: 'Show total'
    }),
    paramName: "showTotal",
    value: stateParams.showTotal,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_src_plugins_charts_public__WEBPACK_IMPORTED_MODULE_5__["SelectOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeTable.params.totalFunctionLabel', {
      defaultMessage: 'Total function'
    }),
    disabled: !stateParams.showTotal,
    options: _utils__WEBPACK_IMPORTED_MODULE_8__["totalAggregations"],
    paramName: "totalFunc",
    value: stateParams.totalFunc,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.totalLabel', {
      defaultMessage: 'Total label'
    }),
    disabled: !stateParams.showTotal,
    paramName: "totalLabel",
    value: stateParams.totalLabel,
    setValue: setValue
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "s"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiPanel"], {
    paddingSize: "s"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiTitle"], {
    size: "xs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_kbn_i18n_react__WEBPACK_IMPORTED_MODULE_3__["FormattedMessage"], {
    id: "visTypeEnhancedTable.params.filterBarSection",
    defaultMessage: "Filter Bar"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_4__["EuiSpacer"], {
    size: "m"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.showFilterBar', {
      defaultMessage: 'Show filter bar'
    }),
    paramName: "showFilterBar",
    value: stateParams.showFilterBar,
    setValue: setValue
  }), stateParams.showFilterBar && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterCaseSensitive', {
      defaultMessage: 'Case sensitive filter'
    }),
    paramName: "filterCaseSensitive",
    value: stateParams.filterCaseSensitive,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterBarHideable', {
      defaultMessage: 'Filter bar hideable'
    }),
    paramName: "filterBarHideable",
    value: stateParams.filterBarHideable,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterAsYouType', {
      defaultMessage: 'Filter as you type'
    }),
    paramName: "filterAsYouType",
    value: stateParams.filterAsYouType,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterTermsSeparately', {
      defaultMessage: 'Filter each term separately'
    }),
    icontip: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterTermsSeparatelyTooltip', {
      defaultMessage: 'Example with filter set to \'term1 term2\': when this option is enabled, rows with one column containing \'term1\' and another column containing \'term2\' will be displayed. If disabled, only rows with one column containing \'term1 term2\' will be displayed.'
    }),
    paramName: "filterTermsSeparately",
    value: stateParams.filterTermsSeparately,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_switch__WEBPACK_IMPORTED_MODULE_6__["SwitchOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterHighlightResults', {
      defaultMessage: 'Highlight results'
    }),
    paramName: "filterHighlightResults",
    value: stateParams.filterHighlightResults,
    setValue: setValue
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_text_input__WEBPACK_IMPORTED_MODULE_7__["TextInputOption"], {
    label: _kbn_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].translate('visTypeEnhancedTable.params.filterBarWidth', {
      defaultMessage: 'Total label'
    }),
    paramName: "filterBarWidth",
    value: stateParams.filterBarWidth,
    setValue: setValue
  }))));
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

/***/ "./public/components/utils.ts":
/*!************************************!*\
  !*** ./public/components/utils.ts ***!
  \************************************/
/*! exports provided: AggTypes, totalAggregations */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AggTypes", function() { return AggTypes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "totalAggregations", function() { return totalAggregations; });
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @kbn/i18n */ "@kbn/i18n");
/* harmony import */ var _kbn_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_kbn_i18n__WEBPACK_IMPORTED_MODULE_0__);
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

let AggTypes;

(function (AggTypes) {
  AggTypes["SUM"] = "sum";
  AggTypes["AVG"] = "avg";
  AggTypes["MIN"] = "min";
  AggTypes["MAX"] = "max";
  AggTypes["COUNT"] = "count";
})(AggTypes || (AggTypes = {}));

const totalAggregations = [{
  value: AggTypes.SUM,
  text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].translate('visTypeTable.totalAggregations.sumText', {
    defaultMessage: 'Sum'
  })
}, {
  value: AggTypes.AVG,
  text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].translate('visTypeTable.totalAggregations.averageText', {
    defaultMessage: 'Average'
  })
}, {
  value: AggTypes.MIN,
  text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].translate('visTypeTable.totalAggregations.minText', {
    defaultMessage: 'Min'
  })
}, {
  value: AggTypes.MAX,
  text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].translate('visTypeTable.totalAggregations.maxText', {
    defaultMessage: 'Max'
  })
}, {
  value: AggTypes.COUNT,
  text: _kbn_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].translate('visTypeTable.totalAggregations.countText', {
    defaultMessage: 'Count'
  })
}];

/***/ })

}]);
//# sourceMappingURL=enhancedTable.chunk.0.js.map