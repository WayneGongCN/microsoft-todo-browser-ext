# To Do Capture

[English](README.md)

To Do Capture 是一款独立开源的 Chrome 扩展，可将网页、选中文字和链接快速保存为 Microsoft To Do 任务。

## 手动安装

1. 从 [GitHub 最新发布页](https://github.com/WayneGongCN/microsoft-todo-browser-ext/releases/latest) 下载 `microsoft-todo-capture-<版本号>-chrome-manual.zip` 并解压。
2. 在 Chrome 123 或更高版本打开 `chrome://extensions`，开启**开发者模式**，点击**加载已解压的扩展程序**，选择直接包含 `manifest.json` 的目录。
3. 从扩展程序菜单打开 **To Do Capture**，登录可使用 Microsoft To Do 的微软账号。可将图标固定到工具栏。

请保留解压目录。若已安装 Chrome 商店版，可在另一个 Chrome 用户配置中安装手动版。两者使用同一个扩展 ID 完成微软登录。

## 使用

- 点击工具栏图标，或在网页、选区和链接上使用右键菜单。检查草稿、选择清单，再确认添加任务。
- 保存前可补充备注、标记重要、设置提醒或移除来源链接。
- 草稿保存在本机。已有草稿时，可选择保留原草稿或采用新收集的内容。
- 选区最多导入 20,000 字符。超过限制时可缩短选区再收集。
- 提交结果不明时，先到 Microsoft To Do 确认再重试。已有任务可在 Microsoft To Do 中管理。
- 在设置中选择默认清单、是否附加当前网页、中英文和浅色、深色或跟随系统的外观。

## 本地开发和验收

需要 Chrome 123 或更高版本、Node.js 22.12 或更高版本和 npm。

```sh
npm ci
npm run dev
```

运行 `npm run build:acceptance` 后，加载 `.output/chrome-mv3-acceptance` 目录即可验收。该构建使用开发扩展 ID `gopiiihaachagcmaijfaphjijefgbgnk` 和独立的微软登录回调。`config/development-identity.json` 保存该扩展 ID 对应的公钥。

```sh
npm run check
npm run build:acceptance
npx playwright install chromium
npm run test:e2e
npm run package
```

打包需要系统 `zip` 命令，会在 `.output/release` 中生成商店包、验收包、校验和及源码提交记录。GitHub Release 的 `-chrome-manual.zip` 在生产清单中加入原 Chrome 商店公钥，使解压安装获得正确的扩展 ID。上传 Chrome 商店时使用 `-chrome.zip`。扩展图标来自[项目网站的 SVG](https://microsoft-todo-capture-site.vercel.app/favicon.svg)。

## 登录和隐私

扩展使用带 PKCE 的微软 OAuth 授权码流程，并验证登录的 state、nonce 和 ID Token。委托权限为 `Tasks.ReadWrite`，另使用 `openid`、`profile` 和 `offline_access`。

| 环境       | Microsoft 应用 ID                      | SPA 回调                                                    |
| ---------- | -------------------------------------- | ----------------------------------------------------------- |
| 生产       | `a5491fb2-111a-4c43-976c-280a507814dc` | `https://ffpljgmbiankjaokoefefmkoghcgoodn.chromiumapp.org/` |
| 开发和验收 | `07171723-a302-4e3c-875d-197490f956eb` | `https://gopiiihaachagcmaijfaphjijefgbgnk.chromiumapp.org/` |

工作或学校账号受组织授权策略和 To Do 服务可用性约束。登录在本次浏览器会话中有效。重启 Chrome、更新或重载扩展后，可能需要重新登录。

主动收集时，扩展读取对应网页的标题、网址或选区。确认后，任务字段直接发送到 Microsoft Graph。令牌保存在受限的浏览器会话存储中，草稿、清单缓存和少量提交回执保存在本机。退出会清除当前账号的草稿和清单缓存。从 1.x 升级会开启新的本机会话，并清理已知旧缓存。云端任务仍可在 Microsoft To Do 中查看。

扩展直接连接微软完成登录和任务收集，按 Chrome 应用商店用户数据政策处理主动收集涉及的数据。详见[隐私政策](https://microsoft-todo-capture-site.vercel.app/zh/privacy/)和 [Limited Use 要求](https://developer.chrome.com/docs/webstore/program-policies/limited-use)。反馈请使用 [GitHub Issues](https://github.com/WayneGongCN/microsoft-todo-browser-ext/issues)，并先隐去令牌、账号详情和任务内容。

## CI 和发布

扩展使用 WXT、React、TypeScript 和 CSS Modules。`src/core` 处理登录、Microsoft Graph、草稿和回执，`src/ui` 供工具栏弹窗、收集窗口和设置复用。CI 运行类型检查、代码检查、单测及独立 Chromium 测试。自动化测试使用合成账号和模拟服务。

按需运行的 Chrome 商店工作流使用官方 v2 API 查询状态、上传、送审和发布。工作流读取仓库 secret `REFRESH_TOKEN`，以及可选的变量 `CWS_CLIENT_ID` 和 secret `CWS_CLIENT_SECRET`。默认执行状态查询。送审使用暂存发布，审核通过后再发布。

## 许可证

[MIT](LICENSE)
