import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs';
import dotenv from 'dotenv';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pjson = require('../package.json')

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.production') });

const options = {
  extensionId: process.env.CHROME_STORE_UPLOADER_EXTENSION_ID,
  clientId: process.env.CHROME_STORE_UPLOADER_CLIENT_ID,
  refreshToken: process.env.CHROME_STORE_UPLOADER_REFRESH_TOKEN,
};

const myZipFile = fs.createReadStream(resolve(join(__dirname, `../dist_${pjson.version}_chrome.zip`)));
const store = chromeWebstoreUpload(options);

store
  .uploadExisting(myZipFile)
  .then((res) => {
    if (res && res.uploadState === 'SUCCESS') {
      console.log(res);
      process.exit(0);
    } else {
      return Promise.reject(res);
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
