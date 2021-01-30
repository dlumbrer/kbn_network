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
import { IndexPatternField } from '../../../../src/plugins/data/public';
import { EuiDraggable, EuiIconTip, EuiSpacer, EuiAccordion, EuiToolTip, EuiButtonIcon, EuiButtonIconProps } from '@elastic/eui';

import { TextInputOption } from './text_input';
import { FieldParamEditor } from './field';


export interface FieldColumn {
  label: string;
  field: IndexPatternField;
  enabled: boolean;
  brandNew?: boolean;
}

function setFieldColumnParam(paramName: string, paramValue: any, fieldColumns: FieldColumn[], fieldColumnToUpdate: FieldColumn, setFieldColumns) {
  const newList = fieldColumns.map(fieldColumn => {
    if (fieldColumn === fieldColumnToUpdate) {
      const updatedFieldColumn = clone(fieldColumnToUpdate);
      updatedFieldColumn[paramName] = paramValue;
      return updatedFieldColumn;
    }
    else {
      return fieldColumn;
    }
  });
  setFieldColumns(newList);
}

function removeFieldColumn(fieldColumns: FieldColumn[], fieldColumnToRemove: FieldColumn, setFieldColumns) {
  const newList = fieldColumns.filter(fieldColumn => fieldColumn !== fieldColumnToRemove);
  setFieldColumns(newList);
}

function renderButtons (fieldColumn, fieldColumns, showError, setValue, setFieldColumns, dragHandleProps) {
  const actionIcons = [];

  if (showError) {
    actionIcons.push({
      id: 'hasErrors',
      color: 'danger',
      type: 'alert',
      tooltip: i18n.translate('visTypeDocumentTable.params.fieldColumns.errorsAriaLabel', {
        defaultMessage: 'Field column has errors',
      })
    });
  }

  if (fieldColumns.length > 1 && fieldColumn.enabled) {
    actionIcons.push({
      id: 'disableFieldColumn',
      color: 'text',
      disabled: false,
      type: 'eye',
      onClick: () => setValue('enabled', false),
      tooltip: i18n.translate('visTypeDocumentTable.params.fieldColumns.disableColumnButtonTooltip', {
        defaultMessage: 'Disable column',
      })
    });
  }
  if (!fieldColumn.enabled) {
    actionIcons.push({
      id: 'enableFieldColumn',
      color: 'text',
      type: 'eyeClosed',
      onClick: () => setValue('enabled', true),
      tooltip: i18n.translate('visTypeDocumentTable.params.fieldColumns.enableColumnButtonTooltip', {
        defaultMessage: 'Enable column',
      })
    });
  }
  if (fieldColumns.length > 1) {
    actionIcons.push({
      id: 'dragHandle',
      type: 'grab',
      tooltip: i18n.translate('visTypeDocumentTable.params.fieldColumns.modifyPriorityButtonTooltip', {
        defaultMessage: 'Modify order by dragging',
      })
    });
  }
  if (fieldColumns.length > 1) {
    actionIcons.push({
      id: 'removeFieldColumn',
      color: 'danger',
      type: 'cross',
      onClick: () => removeFieldColumn(fieldColumns, fieldColumn, setFieldColumns),
      tooltip: i18n.translate('visTypeDocumentTable.params.fieldColumns.removeColumnButtonTooltip', {
        defaultMessage: 'Remove column',
      })
    });
  }

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

function FieldColumnEditor({
  fieldColumns,
  fieldColumn,
  index,
  setFieldColumns,
  aggs,
  setValidity
}) {

  const setValue = (paramName, paramValue) => setFieldColumnParam(paramName, paramValue, fieldColumns, fieldColumn, setFieldColumns);
  const [isEditorOpen, setIsEditorOpen] = React.useState(fieldColumn.brandNew);
  const [validState, setValidState] = React.useState(true);
  const [showValidation, setShowValidation] = React.useState(false);
  const showDescription = !isEditorOpen && validState;
  const showError = !isEditorOpen && !validState;
  const isFieldValid = fieldColumn.field !== undefined;

  if (fieldColumn.brandNew) {
    fieldColumn.brandNew = undefined;
  }

  const buttonContent = (
    <>
      Field col {showDescription && <span>{fieldColumn.label || fieldColumn.field.name}</span>}
    </>
  );

  const onToggle = React.useCallback(
    (isOpen: boolean) => {
      setIsEditorOpen(isOpen);
      setShowValidation(true);
    },
    []
  );

  useEffect(() => {
    setValidity(isFieldValid);
    setValidState(isFieldValid);
  }, [isFieldValid, setValidity, setValidState]);

  return (
    <>
      <EuiDraggable
        key={index}
        index={index}
        draggableId={`document_table_field_columns_draggable_${index}`}
        customDragHandle={true}
      >
        {provided => (
          <EuiAccordion
            id={`document_table_field_columns_accordion_${index}`}
            initialIsOpen={isEditorOpen}
            buttonContent={buttonContent}
            buttonClassName="eui-textTruncate"
            buttonContentClassName="visEditorSidebar__aggGroupAccordionButtonContent eui-textTruncate"
            className="visEditorSidebar__section visEditorSidebar__collapsible visEditorSidebar__collapsible--marginBottom"
            aria-label={i18n.translate('visTypeDocumentTable.params.fieldColumns.toggleEditorButtonAriaLabel', {
              defaultMessage: 'Toggle field column editor'
            })}
            extraAction={renderButtons(fieldColumn, fieldColumns, showError, setValue, setFieldColumns, provided.dragHandleProps)}
            onToggle={onToggle}
          >
            <>
              <EuiSpacer size="m" />

              <FieldParamEditor
                indexPatternFields = {aggs.indexPattern.fields}
                showValidation = { showValidation }
                value={fieldColumn.field}
                setValue={ value => setValue('field', value)}
              />

              <TextInputOption
                label={i18n.translate('visTypeDocumentTable.params.fieldColumns.label', {
                  defaultMessage: 'Label',
                })}
                paramName="label"
                value={fieldColumn.label}
                setValue={setValue}
              />

            </>
          </EuiAccordion>
        )}
      </EuiDraggable>
    </>
  );
}

export { FieldColumnEditor };
