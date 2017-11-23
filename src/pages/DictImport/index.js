import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';

import { Button, Step, Transition } from 'semantic-ui-react';

import { setBlobs, nextStep, goToStep, linkingSelect, updateColumn, toggleAddColumn, selectors } from 'ducks/dictImport';

import Linker from './Linker';
import ColumnMapper from './ColumnMapper';

import './styles.scss';

const BLOBS = fromJS(require('./blobs.json')).map(v => v.set('values', new Map()));
const FIELD_TYPES = fromJS(require('./field_types.json'));

class Info extends React.Component {
  static propTypes = {
    step: PropTypes.string.isRequired,
    isNextStep: PropTypes.bool.isRequired,
    blobs: PropTypes.any.isRequired,
    linking: PropTypes.any.isRequired,
    spreads: PropTypes.any.isRequired,
    setBlobs: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    goToStep: PropTypes.func.isRequired,
    linkingSelect: PropTypes.func.isRequired,
    updateColumn: PropTypes.func.isRequired,
    toggleAddColumn: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onStepClick = this.onStepClick.bind(this);
    this.onUpdateColumn = this.onUpdateColumn.bind(this);
    this.onToggleColumn = this.onToggleColumn.bind(this);
  }

  componentDidMount() {
    this.props.setBlobs(BLOBS);
  }

  onSelect(payload) {
    this.props.linkingSelect(payload);
  }

  onNextClick() {
    this.props.nextStep();
  }

  onStepClick(name) {
    return () => this.props.goToStep(name);
  }

  onUpdateColumn(id) {
    return (column, value, oldValue) =>
      this.props.updateColumn(id, column, value, oldValue);
  }

  onToggleColumn(id) {
    return () =>
      this.props.toggleAddColumn(id);
  }

  render() {
    const {
      step,
      isNextStep,
      blobs,
      linking,
      spreads,
    } = this.props;

    return (
      <div>
        <Step.Group widths={3}>
          <Step link active={step === 'LINKING'} onClick={this.onStepClick('LINKING')}>
            <Step.Content>
              <Step.Title>Linking</Step.Title>
              <Step.Description>Link columns from files with each other</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'COLUMNS'} onClick={this.onStepClick('COLUMNS')}>
            <Step.Content>
              <Step.Title>Columns Mapping</Step.Title>
              <Step.Description>Map linked columns to LingvoDoc types</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'LANGUAGES'} onClick={this.onStepClick('LANGUAGES')}>
            <Step.Content>
              <Step.Title>Language Selection</Step.Title>
              <Step.Description>Map dictionaries to LingvoDoc languages</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: '400px' }}>
          {
            step === 'LINKING' &&
            <Linker
              blobs={blobs}
              state={linking}
              spreads={spreads}
              onSelect={this.onSelect}
              onUpdateColumn={this.onUpdateColumn}
              onToggleColumn={this.onToggleColumn}
            />
          }
          {
            step === 'COLUMNS' &&
            <ColumnMapper
              state={linking}
              spreads={spreads}
              types={FIELD_TYPES}
            />
          }
        </div>

        { isNextStep && <Button fluid inverted color="blue" onClick={this.onNextClick}>Next Step</Button> }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state),
    isNextStep: selectors.getNextStep(state),
    blobs: selectors.getBlobs(state),
    linking: selectors.getLinking(state),
    spreads: selectors.getSpreads(state),
  };
}

const mapDispatchToProps = {
  setBlobs,
  nextStep,
  goToStep,
  linkingSelect,
  updateColumn,
  toggleAddColumn,
};

export default connect(mapStateToProps, mapDispatchToProps)(Info);
