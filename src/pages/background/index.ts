import { Page } from '../../constants/enums';
import { initReport } from '../../helpers/report';
import { State, store } from '../../redux';
import { fetchConfAction } from '../../redux/conf';

store.dispatch(fetchConfAction()).then((res) => {
  initReport(Page.BACKGROUND, res.payload as State['conf']['conf']);
});
