import { ITEM_DETAILS, ITEM_DETAILS_FAILURE } from '../utils/constants'
import axios from 'axios';

export const userChart = (userChart) => {
  return dispatch => {
    axios
      .post(`http://localhost:8082/users`, userChart, {

      })
      .then(res => {
        console.log('resssssssssssss', res)

        dispatch(fechSucss(res.data));

        // dispatch(fechSucss(data));
      })
      .catch(err => {
        dispatch(fechFailure(err.message));
      });
  };
};
const fechSucss = data => ({
  type: ITEM_DETAILS,
  payload: {
    ...data
  }
});

const fechFailure = error => ({
  type: ITEM_DETAILS_FAILURE,
  payload: {
    error
  }
});