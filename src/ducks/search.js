import { combineReducers } from 'redux';
import { fromJS } from 'immutable';

// Actions
export const SET_QUERY = '@search/SET_QUERY';
export const STORE_SEARCH_RESULT = '@search/STORE_SEARCH_RESULT';
export const NEW_SEARCH = '@search/NEW_SEARCH';

export const setQuery = (searchId, query, category, adopted, etymology) => ({
  type: SET_QUERY,
  payload: {
    searchId,
    query,
    category,
    adopted,
    etymology,
  },
});

export const storeSearchResult = (searchId, results) => ({
  type: STORE_SEARCH_RESULT,
  payload: { searchId, results },
});

export const newSearch = () => ({
  type: NEW_SEARCH,
});

const newBlock = {
  search_string: '',
  matching_type: 'full_string',
};

const emptyQuery = [[newBlock]];
const initialState = [
  {
    id: 1,
    query: emptyQuery,
    categoty: null,
    adopted: null,
    etymology: null,
    results: [],
  },
];
const searches = (state = initialState, action) => {
  switch (action.type) {
    case NEW_SEARCH:
      return [...state, { id: state.length + 1, query: emptyQuery, results: [] }];
    case SET_QUERY:
      return state.map(search =>
        (search.id === action.payload.searchId
          ? {
            ...search,
            query: action.payload.query,
            category: action.payload.category,
            adopted: action.payload.adopted,
            etymology: action.payload.etymology,
          }
          : search));
    case STORE_SEARCH_RESULT:
      return state.map(search => (search.id === action.payload.searchId ? { ...search, results: action.payload.results } : search));
    default:
      return state;
  }
};

export default combineReducers({
  searches,
});
