# To Do Capture

一个独立开源的 Chrome 扩展，将网页、选中文字和链接快速收集到 Microsoft To Do。支持选择清单、备注、重要标记、提醒、中英文和浅深色。与微软公司无关联。

## 使用

- 点击工具栏图标，编辑任务并选择目标清单。
- 在网页、选区或链接上打开右键菜单，确认内容后保存。
- 已有草稿不会被新的网页内容自动覆盖。
- 选区最多导入 20,000 字符；超出时明确提示缩短选区，并保留当前草稿供继续编辑。
- 创建失败保留草稿；创建结果不明时，先到 Microsoft To Do 确认，再选择后续操作。
- 设置中可选择默认清单、是否附加网页、语言和外观。

只实现快速收集，不提供完整的任务浏览和管理功能。管理已有任务请打开 Microsoft To Do。

## 本地开发和验收

需要 Chrome 123+、Node.js 22.12+，推荐当前 Node 22 LTS 补丁版和 npm。

```sh
npm ci
npm run dev
```

生成可在 Chrome“加载未打包的扩展程序”中安装的验收版本：

```sh
npm run build:acceptance
```

选择 `.output/chrome-mv3-acceptance`。该版本的固定扩展 ID 为 `gopiiihaachagcmaijfaphjijefgbgnk`，使用已有的微软开发应用及其独立 SPA 回调。`config/development-identity.json` 仅包含公开的扩展公钥，没有私钥或凭据。

生产构建使用原微软应用和原商店扩展身份，上传到原商店条目 `ffpljgmbiankjaokoefefmkoghcgoodn`，不能把任意路径加载的生产目录当成同一个商店 ID。

```sh
npm run check
npm run build:acceptance
npx playwright install chromium
npm run test:e2e
npm run package
```

最后在 `.output/release` 生成商店 ZIP、验收 ZIP、SHA-256 和对应源码提交信息。打包需要系统 `zip` 命令。正式上传使用相同验证流水线生成的产物。

商店与工具栏图标由[项目网站的 SVG](https://microsoft-todo-capture-site.vercel.app/favicon.svg)导出。

## 认证与数据

采用 Microsoft 公共客户端授权码 + PKCE。后台校验 state、nonce、ID Token 受众、发行方和签名；不使用 client secret，不请求 User.Read。

| 环境       | Microsoft 应用 ID                      | SPA 回调                                                    |
| ---------- | -------------------------------------- | ----------------------------------------------------------- |
| 生产       | `a5491fb2-111a-4c43-976c-280a507814dc` | `https://ffpljgmbiankjaokoefefmkoghcgoodn.chromiumapp.org/` |
| 开发、验收 | `07171723-a302-4e3c-875d-197490f956eb` | `https://gopiiihaachagcmaijfaphjijefgbgnk.chromiumapp.org/` |

登录入口允许选择个人及工作/学校账号；企业账号还受组织授权策略和 Microsoft To Do 服务可用性约束。最小业务委托权限为 `Tasks.ReadWrite`，另使用 OIDC 的 `openid`、`profile` 和 `offline_access`。

令牌仅存于本次浏览器会话的扩展受限存储，可跨后台休眠恢复；重启浏览器、更新或重载扩展后可能需要重新登录。退出清理该账号本机草稿和清单缓存。后台按稳定账号标识隔离业务数据，并核对草稿版本防止多窗口覆盖。

升级会清理已知旧版认证及 Redux 同步缓存，旧登录态和旧草稿不迁移；微软云端任务不受影响。

## 隐私政策

- 只有用户主动采集并确认提交时，任务标题、备注、来源网页及选定字段才发送给 Microsoft Graph。
- 网页选区仅在用户触发时读取，没有常驻全站脚本，不读取浏览历史。
- 未提交草稿、清单缓存和少量提交回执保存在本机扩展存储，不使用 Chrome Sync，不经过自建服务器。
- 没有广告、分析统计或第三方错误上报。网络业务请求仅访问 Microsoft 身份和 Graph 端点。
- 退出会清除对应账号本机草稿及清单缓存；卸载扩展会移除其浏览器存储。已经创建的任务需在 Microsoft To Do 中管理。
- 令牌仅保留于浏览器会话，不上传至本项目或开发者。系统或扩展被攻破时，本地数据并不具有独立加密保险库的保护。

隐私和问题反馈请使用本仓库的 [Issues](https://github.com/WayneGongCN/microsoft-todo-browser-ext/issues)。请勿附上令牌、完整任务内容或账号隐私。

扩展仅为用户主动收集 Microsoft To Do 任务处理上述数据，并遵守 Chrome 应用商店用户数据政策的 [Limited Use 要求](https://developer.chrome.com/docs/webstore/program-policies/limited-use)。

### Extension privacy

When you sign in, the extension uses Microsoft Identity to establish a session and Microsoft Graph to read your To Do lists. When you initiate capture, it reads the relevant page title, URL or selection. Confirming a task sends its title, notes, source link, importance and optional reminder directly to Microsoft Graph. Session tokens stay in restricted browser session storage. Drafts, list caches and submission receipts stay in local extension storage. Signing out clears the current account’s draft and list cache. You can manage submitted tasks in Microsoft To Do.

To Do Capture uses this data for user-initiated task capture and follows the Chrome Web Store User Data Policy, including its [Limited Use requirements](https://developer.chrome.com/docs/webstore/program-policies/limited-use). The extension has no ads, analytics or developer-operated backend. For privacy questions, use the repository’s [Issues](https://github.com/WayneGongCN/microsoft-todo-browser-ext/issues).

## 工程与发布

WXT / Vite、React、TypeScript strict、CSS Modules、原生 fetch。`src/core` 管理认证、Graph、草稿、版本核验和提交回执；`src/ui` 供 popup、右键编辑窗口及设置页面复用。

`minimatch` 的开发依赖覆盖用于修复 GHSA-g3hv-75wg-m249，不进入扩展运行包。

CI 执行类型检查、ESLint、格式检查、协议与业务测试、MV3 构建及独立 Chromium 扩展测试。自动化测试只使用合成账号和模拟服务，真实微软联调必须另外执行。

Chrome Web Store workflow 使用官方 v2 API，支持分别查询状态、上传、提交审核、发布已审核版本。默认只查询，不会因普通 push 或 tag 自动发布。使用仓库 `REFRESH_TOKEN` secret；更换 Google OAuth 客户端时设置仓库变量 `CWS_CLIENT_ID`，必要时设置 `CWS_CLIENT_SECRET` secret。变量为空时沿用原客户端 ID。凭据不会写入仓库、构建包或日志。

审核提交采用 staged publish；审核通过后可发布。任何阶段都必须根据平台响应核对状态，不能把上传成功视作已发布。

## License

[MIT](LICENSE)
