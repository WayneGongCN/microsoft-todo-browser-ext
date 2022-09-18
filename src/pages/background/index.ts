import { ConfKey, getConfRequest } from "../../api/getConf";


const DEFAULT_UNINSTLL_URL = 'https://forms.gle/DcDVesncLM8aZQn26';
function setUninstall(url: string) {
  chrome.runtime.setUninstallURL(url);
};



(async () => {
  const conf = await getConfRequest()

  const uninstallUrl = conf.find(x => x.type === ConfKey.UNINSTALL_URL)?.value || DEFAULT_UNINSTLL_URL
  setUninstall(uninstallUrl)
})();
