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

import { clone } from 'lodash';
import React, { useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { EuiDraggable, EuiIconTip, EuiSpacer, EuiAccordion, EuiToolTip, EuiButtonIcon, EuiButtonIconProps } from '@elastic/eui';

import { SelectOption } from '../../../../src/plugins/charts/public';
import { SwitchOption } from './switch';
import { TextInputOption } from './text_input';


export interface ComputedColumn {
  label: string;
  formula: string;
  computeTotalUsingFormula: boolean;
  format: string;
  pattern: string;
  datePattern: string;
  alignment: string;
  applyAlignmentOnTitle: boolean;
  applyAlignmentOnTotal: boolean;
  applyTemplate: boolean;
  applyTemplateOnTotal: boolean;
  template: string;
  cellComputedCss: string;
  enabled: boolean;
  brandNew?: boolean;
}

function setComputedColumnParam(paramName: string, paramValue: any, computedColumns: ComputedColumn[], computedColumnToUpdate: ComputedColumn, setComputedColumns) {
  const newList = computedColumns.map(computedColumn => {
    if (computedColumn === computedColumnToUpdate) {
      const updatedComputedColumn = clone(computedColumnToUpdate);
      updatedComputedColumn[paramName] = paramValue;
      return updatedComputedColumn;
    }
    else {
      return computedColumn;
    }
  });
  setComputedColumns(newList);
}

function removeComputedColumn(computedColumns: ComputedColumn[], computedColumnToRemove: ComputedColumn, setComputedColumns) {
  const newList = computedColumns.filter(computedColumn => computedColumn !== computedColumnToRemove);
  setComputedColumns(newList);
}

function renderButtons (computedColumn, computedColumns, showError, setValue, setComputedColumns, dragHandleProps) {
  const actionIcons = [];

  if (showError) {
    actionIcons.push({
      id: 'hasErrors',
      color: 'danger',
      type: 'alert',
      tooltip: i18n.translate('visTypeEnhancedTable.params.computedColumns.errorsAriaLabel', {
        defaultMessage: 'Computed column has errors',
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
      tooltip: i18n.translate('visTypeEnhancedTable.params.computedColumns.disableColumnButtonTooltip', {
        defaultMessage: 'Disable column',
      })
    });
  }
  if (!computedColumn.enabled) {
    actionIcons.push({
      id: 'enableComputedColumn',
      color: 'text',
      type: 'eyeClosed',
      onClick: () => setValue('enabled', true),
      tooltip: i18n.translate('visTypeEnhancedTable.params.computedColumns.enableColumnButtonTooltip', {
        defaultMessage: 'Enable column',
      })
    });
  }
  if (computedColumns.length > 1) {
    actionIcons.push({
      id: 'dragHandle',
      type: 'grab',
      tooltip: i18n.translate('visTypeEnhancedTable.params.computedColumns.modifyPriorityButtonTooltip', {
        defaultMessage: 'Modify order by dragging',
      })
    });
  }
  actionIcons.push({
    id: 'removeComputedColumn',
    color: 'danger',
    type: 'cross',
    onClick: () => removeComputedColumn(computedColumns, computedColumn, setComputedColumns),
    tooltip: i18n.translate('visTypeEnhancedTable.params.computedColumns.removeColumnButtonTooltip', {
      defaultMessage: 'Remove column',
    })
  });

  return (
    <div {...dragHandleProps}>
      {actionIcons.map(icon => {
        if (icon.id === 'dragHandle') {
          return (
            <EuiIconTip
              key={icon.id}
              type={icon.type}
              content={icon.tooltip}
              iconProps={{
                ['aria-label']: icon.tooltip
              }}
              position="bottom"
            />
          );
        }

        return (
          <EuiToolTip key={icon.id} position="bottom" content={icon.tooltip}>
            <EuiButtonIcon
              disabled={icon.disabled}
              iconType={icon.type}
              color={icon.color as EuiButtonIconProps['color']}
              onClick={icon.onClick}
              aria-label={icon.tooltip}
            />
          </EuiToolTip>
        );
      })}
    </div>
  );
}

function formatOptions() {
  return [
    {
      value: 'number',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.formatOptions.number', {
        defaultMessage: 'Number',
      }),
    },
    {
      value: 'string',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.formatOptions.string', {
        defaultMessage: 'String',
      }),
    },
    {
      value: 'date',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.formatOptions.date', {
        defaultMessage: 'Date',
      }),
    }
  ];
}

function alignmentOptions() {
  return [
    {
      value: 'left',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.left', {
        defaultMessage: 'left',
      }),
    },
    {
      value: 'right',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.right', {
        defaultMessage: 'right',
      }),
    },
    {
      value: 'center',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.center', {
        defaultMessage: 'center',
      }),
    },
    {
      value: 'justify',
      text: i18n.translate('visTypeEnhancedTable.params.computedColumns.alignmentOptions.justify', {
        defaultMessage: 'justify',
      }),
    },
  ];
}

function ComputedColumnEditor({
  computedColumns,
  computedColumn,
  index,
  setComputedColumns,
  setValidity
}) {

  const setValue = (paramName, paramValue) => setComputedColumnParam(paramName, paramValue, computedColumns, computedColumn, setComputedColumns);
  const [isEditorOpen, setIsEditorOpen] = React.useState(computedColumn.brandNew);
  const [validState, setValidState] = React.useState(true);
  const showDescription = !isEditorOpen && validState;
  const showError = !isEditorOpen && !validState;
  const isFormulaValid = computedColumn.formula !== '';

  if (computedColumn.brandNew) {
    computedColumn.brandNew = undefined;
  }

  const buttonContent = (
    <>
      Computed col {showDescription && <span>{computedColumn.label || computedColumn.formula}</span>}
    </>
  );

  const onToggle = React.useCallback(
    (isOpen: boolean) => {
      setIsEditorOpen(isOpen);
    },
    []
  );

  useEffect(() => {
    setValidity(isFormulaValid);
    setValidState(isFormulaValid);
  }, [isFormulaValid, setValidity, setValidState]);

  return (
    <>
      <EuiDraggable
        key={index}
        index={index}
        draggableId={`enhanced_table_computed_columns_draggable_${index}`}
        customDragHandle={true}
      >
        {provided => (
          <EuiAccordion
            id={`enhanced_table_computed_columns_accordion_${index}`}
            initialIsOpen={isEditorOpen}
            buttonContent={buttonContent}
            buttonClassName="eui-textTruncate"
            buttonContentClassName="visEditorSidebar__aggGroupAccordionButtonContent eui-textTruncate"
            className="visEditorSidebar__section visEditorSidebar__collapsible visEditorSidebar__collapsible--marginBottom"
            aria-label={i18n.translate('visTypeEnhancedTable.params.computedColumns.toggleEditorButtonAriaLabel', {
              defaultMessage: 'Toggle computed column editor'
            })}
            extraAction={renderButtons(computedColumn, computedColumns, showError, setValue, setComputedColumns, provided.dragHandleProps)}
            onToggle={onToggle}
          >
            <>
              <EuiSpacer size="m" />

              <TextInputOption
                label={i18n.translate('visTypeEnhancedTable.params.computedColumns.label', {
                  defaultMessage: 'Label',
                })}
                paramName="label"
                value={computedColumn.label}
                setValue={setValue}
              />

              <TextInputOption
                label={
                  <>
                    <FormattedMessage
                      id="visTypeEnhancedTable.params.computedColumns.formula"
                      defaultMessage="Formula"
                    />
                    &nbsp;(
                      <a href="https://github.com/fbaligand/kibana-enhanced-table/blob/master/README.md#computed-settings-documentation" target="_blank">documentation</a>
                    )
                  </>
                }
                isInvalid={!isFormulaValid}
                paramName="formula"
                value={computedColumn.formula}
                setValue={setValue}
              />

              <SwitchOption
                label={i18n.translate('visTypeEnhancedTable.params.computedColumns.computeTotalUsingFormula', {
                  defaultMessage: 'Compute total using formula',
                })}
                paramName="computeTotalUsingFormula"
                value={computedColumn.computeTotalUsingFormula}
                setValue={setValue}
              />

              <SelectOption
                label={i18n.translate('visTypeTable.params.computedColumns.format', {
                  defaultMessage: 'Format',
                })}
                options={formatOptions()}
                paramName="format"
                value={computedColumn.format}
                setValue={setValue}
              />

              {computedColumn.format === 'number' &&
                <TextInputOption
                  label={
                    <>
                      <FormattedMessage
                        id="visTypeEnhancedTable.params.computedColumns.pattern"
                        defaultMessage="Pattern"
                      />
                      &nbsp;(
                        <a href="http://numeraljs.com/#format" target="_blank">Numeral.js</a>
                      &nbsp;syntax)
                    </>
                  }
                  paramName="pattern"
                  value={computedColumn.pattern}
                  setValue={setValue}
                />
              }

              {computedColumn.format === 'date' &&
                <TextInputOption
                  label={
                    <>
                      <FormattedMessage
                        id="visTypeEnhancedTable.params.computedColumns.datePattern"
                        defaultMessage="Pattern"
                      />
                      &nbsp;(
                        <a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">Moment.js</a>
                      &nbsp;syntax)
                    </>
                  }
                  paramName="datePattern"
                  value={computedColumn.datePattern}
                  setValue={setValue}
                />
              }

              <SelectOption
                label={i18n.translate('visTypeTable.params.computedColumns.alignment', {
                  defaultMessage: 'Alignment',
                })}
                options={alignmentOptions()}
                paramName="alignment"
                value={computedColumn.alignment}
                setValue={setValue}
              />

              {computedColumn.alignment !== 'left' &&
                <SwitchOption
                  label={i18n.translate('visTypeEnhancedTable.params.computedColumns.applyAlignmentOnTitle', {
                    defaultMessage: 'Apply alignment on title',
                  })}
                  paramName="applyAlignmentOnTitle"
                  value={computedColumn.applyAlignmentOnTitle}
                  setValue={setValue}
                />
              }

              {computedColumn.alignment !== 'left' &&
                <SwitchOption
                  label={i18n.translate('visTypeEnhancedTable.params.computedColumns.applyAlignmentOnTotal', {
                    defaultMessage: 'Apply alignment on total',
                  })}
                  paramName="applyAlignmentOnTotal"
                  value={computedColumn.applyAlignmentOnTotal}
                  setValue={setValue}
                />
              }

              <SwitchOption
                label={i18n.translate('visTypeEnhancedTable.params.computedColumns.applyTemplate', {
                  defaultMessage: 'Apply template',
                })}
                paramName="applyTemplate"
                value={computedColumn.applyTemplate}
                setValue={setValue}
              />

              {computedColumn.applyTemplate &&
                <SwitchOption
                  label={i18n.translate('visTypeEnhancedTable.params.computedColumns.applyTemplateOnTotal', {
                    defaultMessage: 'Apply template on total',
                  })}
                  paramName="applyTemplateOnTotal"
                  value={computedColumn.applyTemplateOnTotal}
                  setValue={setValue}
                />
              }

              {computedColumn.applyTemplate &&
                <TextInputOption
                  label={
                    <>
                      <FormattedMessage
                        id="visTypeEnhancedTable.params.computedColumns.template"
                        defaultMessage="Template"
                      />
                      &nbsp;(
                        <a ng-href="https://handlebarsjs.com/guide/expressions.html" target="_blank">Handlebars</a>
                      &nbsp;syntax)
                    </>
                  }
                  paramName="template"
                  value={computedColumn.template}
                  setValue={setValue}
                />
              }

              <TextInputOption
                label={
                  <>
                    <FormattedMessage
                      id="visTypeEnhancedTable.params.computedColumns.cellComputedCss"
                      defaultMessage="Cell computed CSS"
                    />
                    &nbsp;(
                    <a href="https://github.com/fbaligand/kibana-enhanced-table/blob/master/README.md#computed-settings-documentation" target="_blank">documentation</a>
                    )&nbsp;
                    <EuiIconTip
                      content="This option lets to define dynamically table cell CSS (like background-color CSS property), based on this column value and previous column values"
                      position="right"
                    />
                  </>
                }
                placeholder="value < 0 ? &quot;background-color: red&quot; : &quot;&quot;"
                paramName="cellComputedCss"
                value={computedColumn.cellComputedCss}
                setValue={setValue}
              />

            </>
          </EuiAccordion>
        )}
      </EuiDraggable>
    </>
  );
}

export { ComputedColumnEditor };
