
import { connect } from 'react-redux';
import App from '../App';
import { userChart } from '../actions/userChartAction';
const mapStateToProps = (state) => {
    const { usersReducer } = state;
    return {
        data: usersReducer,
    }
};

const mapDispatchToProps = dispatch => {
    return {

        userChart: () => { dispatch(userChart()) }
    }

};



export default connect(mapStateToProps, mapDispatchToProps)(App);
