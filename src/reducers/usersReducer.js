import { ITEM_DETAILS } from '../utils/constants';
let user = ''
const usersReducer = (state = user, action) => {

    switch (action.type) {
        case ITEM_DETAILS:
            return {
                ...state,
                data: action.payload.data
            }
        default:
            return state
    }
}
export default usersReducer