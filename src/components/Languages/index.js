import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, shouldUpdate } from 'recompose';
import Immutable from 'immutable';
import EditModal from 'components/EditLanguageModal';
import CreateModal from 'components/CreateLanguageModal';
import { openModalEdit, openModalCreate } from 'ducks/language';
import { languagesQuery, moveLanguageMutation, deleteLanguageMutation } from 'graphql/language';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import LanguagesTree from './LanguagesTree';

const dictionariesQuery = gql`
  query getAllDictionaries {
    dictionaries(mode: 1) {
      parent_id
      category
    }
  }
`;

const Languages = (props) => {
  const { dictionariesData, languagesData, deleteLanguage, moveLanguage, actions, height, selected, onSelect, expanded } = props;
  if (dictionariesData.error || dictionariesData.loading || languagesData.error || languagesData.loading) {
    return null;
  }

  const { language_tree: languages, is_authenticated: isAuthenticated } = languagesData;
  const languagesTree = buildLanguageTree(Immutable.fromJS(languages));
  let heightStyle = height ? { height: height } : { height: '100%' };
  return (
    <div style={heightStyle}>
      <LanguagesTree
        dictionaries={dictionariesData.dictionaries}
        languagesTree={languagesTree}
        edit={isAuthenticated}
        editLanguage={actions.openModalEdit}
        createLanguage={actions.openModalCreate}
        moveLanguage={moveLanguage}
        deleteLanguage={deleteLanguage}
        selected={selected}
        onSelect={onSelect}
        expanded={expanded}
      />
      <CreateModal />
      <EditModal />
    </div>
  );
};

Languages.propTypes = {
  dictionariesData: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    dictionaries: PropTypes.array,
  }).isRequired,
  languagesData: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    language_tree: PropTypes.array,
  }).isRequired,
  actions: PropTypes.shape({
    openModalEdit: PropTypes.func,
    openModalCreate: PropTypes.func,
  }).isRequired,
  moveLanguage: PropTypes.func.isRequired,
  deleteLanguage: PropTypes.func.isRequired,
  height: PropTypes.string,
  selected: PropTypes.object,
  onSelect: PropTypes.func,
  expanded: PropTypes.bool
};

export default compose(
  graphql(dictionariesQuery, { name: 'dictionariesData' }),
  graphql(languagesQuery, { name: 'languagesData' }),
  graphql(deleteLanguageMutation, { name: 'deleteLanguage' }),
  graphql(moveLanguageMutation, { name: 'moveLanguage' }),
  connect(
    state => state.language,
    dispatch => ({
      actions: bindActionCreators({ openModalEdit, openModalCreate }, dispatch),
    })
  ),
  shouldUpdate(() => true),
)(Languages);
