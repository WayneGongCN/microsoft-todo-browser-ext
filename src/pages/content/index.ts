import { EXT_ID } from '../../constants';
import { ErrorCode } from '../../constants/enums';
import { MessageType } from '../../helpers';
import AppError from '../../helpers/error';


const callbackMap: Record<string, (params: unknown) => void> = {
  [MessageType.GET_SELECTION_TEXT]: () => window.getSelection().toString(),
};


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { id } = sender;
  if (id !== EXT_ID) return;

  const { type, payload } = message;
  try {
    sendResponse({ payload: callbackMap[type](payload) });
  } catch (e) {
    const error = new AppError({ code: ErrorCode.UNKNOW, message: e?.message });
    sendResponse({ error });
  }
});
