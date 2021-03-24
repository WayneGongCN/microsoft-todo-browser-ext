require('dotenv').config();
const path = require('path');
const AdmZip = require('adm-zip');
const { Readable } = require('stream');
const webStoreHelper = require('chrome-webstore-upload');

// zip dist dir
// https://www.npmjs.com/package/adm-zip
let zip = new AdmZip();
zip.addLocalFolder(path.join(__dirname, '../dist/'));
zip = zip.toBuffer();

// buffer to readStream
// https://stackoverflow.com/questions/13230487/converting-a-buffer-into-a-readablestream-in-node-js
const readable = new Readable();
readable.push(zip);
readable.push(null);

// make webStore
// https://github.com/DrewML/chrome-webstore-upload
const {
  EXTENSION_ID, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN,
} = process.env;
const webStore = webStoreHelper({
  extensionId: EXTENSION_ID,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});


// fetch token and upload
webStore.fetchToken().then((token) => {
  webStore.uploadExisting(readable, token).then((res) => {
    console.log(res);
    // Response is a Resource Representation
    // https://developer.chrome.com/webstore/webstore_api/items#resource
  });
});
