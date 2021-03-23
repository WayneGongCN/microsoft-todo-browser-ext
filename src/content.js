import './content.css';

const CURSOR_LOADING_CLASS = 'cursor--loading';


const callbackMap = {
  CURSOR_LOADING: () => document.body.classList.add(CURSOR_LOADING_CLASS),
  CURSOR_RESET: () => document.body.classList.remove(CURSOR_LOADING_CLASS),
};


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, value } = message;
  try {
    const result = callbackMap[type](value);
    sendResponse({ type: 'SUCCESS', payload: result });
  } catch (e) {
    sendResponse({ type: 'ERROR', payload: e });
  }
});
