import React from 'react';
import PropTypes from 'prop-types';
import { editForm } from 'ducks/user';
import FormModal from 'components/FormModal';
import { getTranslation } from 'api/i18n';

const EDIT_FIELDS = [
  {
    name: 'email',
    type: 'email',
    label: getTranslation('Email'),
  },
  {
    name: 'name',
    type: 'text',
    label: getTranslation('Full name'),
  },
  {
    name: 'old_password',
    type: 'password',
    label: getTranslation('Old password'),
  },
  {
    name: 'new_password',
    type: 'password',
    label: getTranslation('New password')
  },
];

function validate({ name, email }) {
  const errors = {};
  if (!name) {
    errors.name = getTranslation('Login is required');
  }
  if (!email) {
    errors.email = getTranslation('Email is required');
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = getTranslation('Invalid email address');
  }
  return errors;
}

const EditUserModal = props =>
  <FormModal
    form="edit"
    header={getTranslation("Edit profile")}
    actions={editForm}
    fields={EDIT_FIELDS}
    initialValues={props.user}
    validate={validate}
    {...props}
  />;

EditUserModal.propTypes = {
  user: PropTypes.object.isRequired,
};

export default EditUserModal;
