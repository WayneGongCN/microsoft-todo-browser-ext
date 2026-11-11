# To Do Capture

[简体中文](README.zh-CN.md)

To Do Capture is an independent, open-source Chrome extension that saves webpages, selected text, and links as tasks in Microsoft To Do.

## Install manually

1. Download `microsoft-todo-capture-<version>-chrome-manual.zip` from the [latest GitHub release](https://github.com/WayneGongCN/microsoft-todo-browser-ext/releases/latest) and extract it.
2. Open `chrome://extensions` in Chrome 123 or later, turn on **Developer mode**, and click **Load unpacked**. Select the extracted folder containing `manifest.json`.
3. Open **To Do Capture** from the extensions menu and sign in with a Microsoft account that has access to To Do. Pin it to the toolbar for quick access.

Keep the extracted folder in place. If you already have the Chrome Web Store copy installed, use a separate Chrome profile for the manual copy. Both copies use the same extension ID for Microsoft sign-in.

## Use the extension

- Open the toolbar popup or right-click a webpage, selection, or link to open the same popup. Review the draft, choose a To Do list, and add the task. The confirmation appears in the popup. After a successful submission, reopening the popup takes you directly to the task form.
- In the confirmation, click **Open Microsoft To Do** to open the new task in its list.
- Chrome 127 or later can open the toolbar popup from the context menu. If it cannot open automatically, click the extension icon with the badge to review the capture.
- Add notes, mark a task important, set a reminder, or remove the source link before saving.
- Resume drafts on this device. If a new capture arrives while a draft is saved, choose which draft to keep.
- Selections can contain up to 20,000 characters. If a selection is too long, shorten it and capture again.
- If a submission result is uncertain, check Microsoft To Do before retrying. Manage existing tasks in Microsoft To Do.
- In Settings, choose a default list, whether to attach the current page, English or Simplified Chinese, and light, dark, or system appearance.

## Development and testing

Use Chrome 123 or later, Node.js 22.12 or later, and npm.

```sh
npm ci
npm run dev
```

To build an unpacked extension for testing, run `npm run build:acceptance` and load `.output/chrome-mv3-acceptance`. It uses the development extension ID `gopiiihaachagcmaijfaphjijefgbgnk` and its dedicated Microsoft sign-in callback. `config/development-identity.json` contains the public key for that ID.

```sh
npm run check
npm run build:acceptance
npx playwright install chromium
npm run test:e2e
npm run package
```

Packaging requires the system `zip` command and writes the store and acceptance ZIPs, checksums, and source commit to `.output/release`. The GitHub release's `-chrome-manual.zip` adds the original Chrome Web Store public key to the production manifest so an unpacked installation has the expected ID. Upload the `-chrome.zip` build when packaging for the store. The extension icons come from the [project website's SVG](https://microsoft-todo-capture-site.vercel.app/favicon.svg).

## Sign-in and privacy

The extension uses the Microsoft OAuth authorization code flow with PKCE and validates the sign-in state, nonce, and ID token. It requests the delegated `Tasks.ReadWrite` scope along with `openid`, `profile`, and `offline_access`.

| Environment                | Microsoft app ID                       | SPA redirect URI                                            |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| Chrome production          | `a5491fb2-111a-4c43-976c-280a507814dc` | `https://ffpljgmbiankjaokoefefmkoghcgoodn.chromiumapp.org/` |
| Edge production            | `ce33022f-91e6-470c-8ccb-fefba8207f1b` | `https://mhfmejfcbgojopoeakmglpgmlokpdjjg.chromiumapp.org/` |
| Development and acceptance | `07171723-a302-4e3c-875d-197490f956eb` | `https://gopiiihaachagcmaijfaphjijefgbgnk.chromiumapp.org/` |

Work or school accounts depend on organization policy and To Do availability. Sign-in lasts for the browser session. Restarting Chrome, updating the extension, or reloading it can require signing in again.

When you start a capture, the extension reads the relevant page title, URL, or selection. Microsoft Graph receives the task fields you confirm. Tokens stay in restricted session storage. Drafts, list caches, and a limited number of submission receipts stay in local extension storage. Signing out clears the account's draft and list cache. An upgrade from 1.x starts a new local session and clears known legacy caches. Tasks remain available in Microsoft To Do.

The extension connects directly to Microsoft for sign-in and tasks. Usage analytics are off by default and can be enabled or withdrawn in Settings. The extension then sends opens and successful task creations, the extension version, and a random installation ID to GA4 through the project website. Analytics exclude task contents, browsing data, and account details. It uses this data for user-initiated capture under the Chrome Web Store User Data Policy, including its Limited Use requirements. See the [privacy policy](https://microsoft-todo-capture-site.vercel.app/privacy/) and [Limited Use requirements](https://developer.chrome.com/docs/webstore/program-policies/limited-use). For support, use [GitHub Issues](https://github.com/WayneGongCN/microsoft-todo-browser-ext/issues) and redact tokens, account details, and task contents.

The support button in Settings opens the donation page in a new tab with fixed UTM tags that identify the extension as the source.

## CI and publishing

The extension uses WXT, React, TypeScript, and CSS Modules. `src/core` handles sign-in, Microsoft Graph, drafts, and receipts. `src/ui` is shared by the toolbar popup and settings. CI runs type checks, linting, unit tests, and isolated Chromium tests with synthetic accounts and mocked services.

Push a new `v<version>` tag on a commit that contains the Chrome Web Store workflow. The version must match `package.json`. Actions verifies and packages the tagged commit, then uploads the store ZIP and submits it for staged review. After the store shows `STAGED`, run the workflow with `release` on the same tag to publish it.

The manual workflow defaults to `status` and also offers `upload`, `submit`, and `release`. If Google rejects the OAuth grant, [reauthorize the Chrome Web Store publisher](https://developer.chrome.com/docs/webstore/using-api), update the repository secret `REFRESH_TOKEN` and the matching `CWS_CLIENT_ID` variable and `CWS_CLIENT_SECRET` secret as needed, and run `status` to verify access.

## License

[MIT](LICENSE)
