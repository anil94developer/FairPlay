import React from 'react';
import './InputTemplate.scss';

type Props = {
  label: string;
  value: any;
  placeholder: string;
  onChange?: Function;
  type?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  customInputClassName?: string;
  customInputCtnClassName?: string;
};

const InputTemplate = (props: Props) => {
  const {
    label,
    value,
    placeholder,
    onChange,
    disabled,
    type,
    name,
    required,
    customInputClassName,
    customInputCtnClassName,
  } = props;

  const handleChange = (e) => {
    onChange && onChange(e.target.value);
  };

  return (
    <div
      className={`input-template ${
        customInputCtnClassName ? customInputCtnClassName : ''
      }`}
    >
      <div className={disabled ? 'it-label it-disabled' : 'it-label'}>
        {label}
      </div>
      <input
        name={name}
        className={`it-input  ${
          customInputClassName ? customInputClassName : ''
        } ${disabled ? 'it-input-diabled' : ''}`}
        type={type ? type : 'text'}
        onInput={(e) => {
          if (type === 'number') {
            e.currentTarget.value = e.currentTarget.value.replace(
              /[^0-9]/g,
              ''
            ); // Allow only positive digits
          }
        }}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};

export default InputTemplate;
