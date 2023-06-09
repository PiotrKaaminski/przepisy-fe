import React from 'react';

export enum FormMode {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT'
}

const FormContext = React.createContext({
  formMode: FormMode.VIEW,
  handleSubmit: null
});

export default FormContext;
