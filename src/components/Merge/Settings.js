import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys, branch, renderNothing, pure, withReducer, withProps } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { gql, graphql, withApollo } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { isEqual, find, take, drop, flow, groupBy, sortBy, reverse } from 'lodash';
import {
  Table,
  Dimmer,
  Header,
  Icon,
  Dropdown,
  List,
  Input,
  Button,
  Checkbox,
  Container,
  Segment,
  Divider,
} from 'semantic-ui-react';
import styled from 'styled-components';

import { compositeIdToString } from 'utils/compositeId';
import { queryPerspective, LexicalEntryView } from 'components/PerspectiveView';

const FieldBlock = styled(Segment)`
  .delete-button {
    box-shadow: none !important;
    position: absolute !important;
    padding: 10px !important;
    margin: 0;
    right: 0;
    top: 0;
  }
`;

const mergeSuggestionsQuery = gql`
  query mergeSuggestions(
    $id: LingvodocID!
    $algorithm: String!
    $field_selection_list: [ObjectVal]!
    $levenshtein: Int!
    $threshold: Float!
  ) {
    merge_suggestions(
      perspective_id: $id
      algorithm: $algorithm
      field_selection_list: $field_selection_list
      levenshtein: $levenshtein
      threshold: $threshold
    ) {
      match_result
    }
  }
`;

class MergeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.getSuggestions = this.getSuggestions.bind(this);
    this.state = {
      groups: [],
    };
  }

  async getSuggestions() {
    const {
      id, settings, client, data: { perspective: { lexical_entries: entries } },
    } = this.props;

    const algorithm = settings.get('mode');
    const threshold = settings.get('threshold');
    const fields = settings.get('field_selection_list');

    const { data } = await client.query({
      query: mergeSuggestionsQuery,
      variables: {
        id,
        algorithm,
        field_selection_list: fields,
        threshold,
        levenshtein: 1,
      },
    });

    if (data) {
      const { merge_suggestions: { match_result } } = data;
      const groups = match_result.map(({ lexical_entries: ids, confidence }) => ({
        lexical_entries: ids.map(eid => entries.find(e => isEqual(e.id, eid))),
        confidence,
      }));
      this.setState({
        groups,
      });
    }
  }

  render() {
    const {
      id, entitiesMode, settings, dispatch, data,
    } = this.props;
    const mode = settings.get('mode');
    const threshold = settings.get('threshold');
    const fields = settings.get('field_selection_list');
    const { all_fields: allFields, perspective: { columns } } = data;

    const fieldOptions = columns.map((c) => {
      const field = allFields.find(f => isEqual(c.field_id, f.id));
      return {
        text: field.translation,
        value: JSON.stringify(field.id),
      };
    });

    return (
      <div>
        <Segment>
          <Header>Entity matching algorithm</Header>

          <List>
            <List.Item>
              <Checkbox
                radio
                name="mode"
                value="simple"
                label="Simple"
                checked={mode === 'simple'}
                onChange={(e, { value }) => dispatch({ type: 'SET_MODE', payload: value })}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                radio
                name="mode"
                value="fields"
                label="With field selection"
                checked={mode === 'fields'}
                onChange={(e, { value }) => dispatch({ type: 'SET_MODE', payload: value })}
              />
            </List.Item>
          </List>

          {mode === 'fields' && (
            <Container>
              {fields.map((e, i) => (
                <FieldBlock key={i}>
                  <Button
                    className="delete-button"
                    compact
                    basic
                    icon="delete"
                    onClick={() => dispatch({ type: 'REMOVE_FIELD', payload: i })}
                  />
                  <List>
                    <List.Item>
                      <Dropdown
                        selection
                        options={fieldOptions}
                        defaultValue={JSON.stringify(e.field_id)}
                        onChange={(_e, { value }) =>
                          dispatch({ type: 'CHANGE_FIELD_ID', payload: { id: JSON.parse(value), index: i } })}
                      />
                    </List.Item>
                    <List.Item>
                      <Input
                        label="Levenshtein distance limit for entity content matching"
                        value={e.levenshtein}
                        onChange={(ev, { value }) =>
                          dispatch({ type: 'SET_LEVENSHTEIN', payload: { index: i, levenshtein: value } })}
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        label="Split contents of the field on whitespace before matching."
                        checked={e.split_space}
                        onChange={(_e, { checked }) =>
                          dispatch({ type: 'SET_WHITESPACE_FLAG', payload: { index: i, checked } })}
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        label="Split contents of the field on punctuation before matching"
                        checked={e.split_punctuation}
                        onChange={(_e, { checked }) =>
                          dispatch({ type: 'SET_PUNCTUATION_FLAG', payload: { index: i, checked } })}
                      />
                    </List.Item>
                  </List>
                </FieldBlock>
              ))}

              <Button basic content="Add field" onClick={() => dispatch({ type: 'ADD_FIELD' })} />
            </Container>
          )}

          <Input
            label="Entity matching threshold"
            value={threshold}
            onChange={(e, { value }) => dispatch({ type: 'SET_THRESHOLD', payload: value })}
          />

          <Container textAlign="center">
            <Button positive content="View suggestions" onClick={this.getSuggestions} />
          </Container>
        </Segment>
        <Segment>
          {this.state.groups.map((group, i) => (
            <div>
              <LexicalEntryView
                key={i}
                perspectiveId={id}
                entries={group.lexical_entries}
                mode="view"
                entitiesMode={entitiesMode}
                selectEntries={true}
              />
              <Container textAlign="center">
                <Button positive content="Merge group" />
              </Container>
              <Divider />
            </div>
          ))}
        </Segment>
      </div>
    );
  }
}

// perspectiveId: PropTypes.array.isRequired,
// entries: PropTypes.array.isRequired,
// mode: PropTypes.string.isRequired,
// entitiesMode: PropTypes.string.isRequired,

MergeSettings.propTypes = {
  id: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  settings: PropTypes.instanceOf(Immutable.Map).isRequired,
  dispatch: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
};

const fieldListEntry = {
  field_id: null,
  split_punctuation: true,
  split_space: true,
  levenshtein: 0,
  type: 'text',
};

function reducer(state, { type, payload }) {
  switch (type) {
    case 'SET_MODE':
      return state.set('mode', payload);
    case 'SET_THRESHOLD':
      return state.set('threshold', parseFloat(payload) || 0.1);
    case 'ADD_FIELD':
      return state.update('field_selection_list', list => list.push(fieldListEntry));
    case 'REMOVE_FIELD':
      return state.update('field_selection_list', list => list.delete(payload));
    case 'CHANGE_FIELD_ID':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, field_id: payload.id })));
    case 'SET_WHITESPACE_FLAG':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, split_space: payload.checked })));
    case 'SET_PUNCTUATION_FLAG':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, split_punctuation: payload.checked })));
    case 'SET_LEVENSHTEIN':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, levenshtein: parseFloat(payload.levenshtein) || 0.1 })));
    default:
      return state;
  }
}

const initialState = {
  mode: 'simple',
  threshold: 0.1,
  field_selection_list: [],
};

export default compose(
  withProps(p => ({ ...p, entitiesMode: 'all' })),
  withReducer('settings', 'dispatch', reducer, fromJS(initialState)),
  graphql(queryPerspective),
  branch(({ data }) => data.loading, renderNothing),
  withApollo,
  pure
)(MergeSettings);