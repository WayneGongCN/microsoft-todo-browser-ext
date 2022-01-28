import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.production') });

const options = {
  extensionId: process.env.EXTENSION_ID,
  clientId: process.env.CLIENT_ID,
  refreshToken: process.env.REFRESH_TOKEN,
};

const myZipFile = fs.createReadStream('./dist.zip');
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
