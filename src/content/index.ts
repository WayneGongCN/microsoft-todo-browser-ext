import { IContentMessage } from '../../types';
import { EXT_ID } from '../constants';
import { EContentMessage, ErrorCode } from '../constants/enums';
import AppError from '../helpers/error';
import './content.css';

const CURSOR_LOADING_CLASS = 'cursor--loading';

const callbackMap: Record<string, (params: unknown) => void> = {
  [EContentMessage.CURSOR_LOADING]: () => document.body.classList.add(CURSOR_LOADING_CLASS),
  [EContentMessage.CURSOR_RESET]: () => document.body.classList.remove(CURSOR_LOADING_CLASS),
};

chrome.runtime.onMessage.addListener((message: IContentMessage, sender, sendResponse) => {
  const { id } = sender;
  if (id !== EXT_ID) return;

  const { type, payload } = message;
  try {
    sendResponse({ type, payload: callbackMap[type](payload) });
  } catch (e) {
    const error = new AppError({ code: ErrorCode.UNKNOW, message: e?.message });
    sendResponse({ type, error });
  }
});
