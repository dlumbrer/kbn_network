import React from 'react';
import { EuiFormRow, EuiFieldNumber} from '@elastic/eui';

interface NumberInputOptionProps<ParamName extends string> {
  disabled?: boolean;
  helpText?: React.ReactNode;
  error?: React.ReactNode;
  isInvalid?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  paramName: ParamName;
  value?: string;
  'data-test-subj'?: string;
  setValue: (paramName: ParamName, value: string) => void;
}

function NumberInputOption<ParamName extends string>({
  'data-test-subj': dataTestSubj,
  disabled,
  helpText,
  error,
  isInvalid,
  label,
  placeholder,
  paramName,
  value = '',
  setValue,
}: NumberInputOptionProps<ParamName>) {
  const setNumber = (paramName, value) => {
    if (value) {
      setValue(paramName, Number(value));
    } else {
      setValue(paramName, '');
    }
  };
  
  return (
    <EuiFormRow
      helpText={helpText}
      label={label}
      error={error}
      isInvalid={isInvalid}
      fullWidth
      display="columnCompressed"
    >
      <EuiFieldNumber
        compressed={true}
        fullWidth
        isInvalid={isInvalid}
        placeholder={placeholder}
        data-test-subj={dataTestSubj}
        disabled={disabled}
        value={value}
        onChange={ev => setNumber(paramName, ev.target.value)}
      />
    </EuiFormRow>
  );
}

export { NumberInputOption };