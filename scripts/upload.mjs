
import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config({path: '/Users/waynegong/project/microsoft-todo-browser-ext/.env.production'});

const options = {
  extensionId: process.env.EXTENSION_ID,
  clientId: process.env.CLIENT_ID,
  refreshToken: process.env.REFRESH_TOKEN,
}

const myZipFile = fs.createReadStream('./dist.zip');
const store = chromeWebstoreUpload(options);

store.uploadExisting(myZipFile)
  .then(console.log)