import { Page } from '../../constants/enums';
import { initReport } from '../../helpers/report';
import { State, store } from '../../redux';
import { fetchConf } from '../../redux/conf';

store.dispatch(fetchConf()).then((res) => {
  initReport(Page.BACKGROUND, res.payload as State['conf']['conf']);
});
