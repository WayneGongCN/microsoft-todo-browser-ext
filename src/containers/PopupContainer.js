import { connect } from 'react-redux';
import { addTodo } from '../actions/popup';
import Popup from '../components/Popup';

const mapStateToProps = (state) => ({
  nums: state.nums,
});

const mapDispatchToProps = (dispatch) => ({
  addTodo: dispatch(addTodo()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Popup);
