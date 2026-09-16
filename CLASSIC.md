# Rust 语言圣经经典阅读版

这个分支保留 `sunface/rust-course` 当前 `main` 分支的全部正文，只把渲染层固定为 mdBook 0.4.52。这样可以继续阅读上游更新的 Rust 内容，同时恢复旧站熟悉的布局：

- 左侧完整章节树，可折叠并记忆阅读位置；
- 中间为高密度、无卡片化装饰的正文；
- 右侧为当前章节目录；
- 保留全文搜索、明暗主题、打印、代码复制和前后章节导航；
- 正文中指向官方新站的章节链接，在目标属于本书目录时会自动留在经典阅读版中。

## 本地阅读

```bash
pnpm dev
```

默认在 `http://127.0.0.1:43127` 启动并打开浏览器。第一次运行会把固定版本的 mdBook 下载到被 Git 忽略的 `.tools/` 目录，之后可以离线运行。

常用命令：

```bash
pnpm dev       # 启动开发服务器并打开浏览器
pnpm start     # 启动开发服务器但不自动打开浏览器
pnpm build     # 生成静态网站到 book/
pnpm test      # 执行 mdBook 中的 Rust 代码测试
pnpm clean     # 清理 book/ 构建结果
```

## 同步上游正文

```bash
git fetch origin main
git rebase origin/main
pnpm build
```

`src/` 是正文，`theme/`、`book.toml` 和固定的 mdBook 版本共同决定外观。同步时保持这两个边界，后续上游增补 Rust 章节便会自动出现在经典站点中。

## 版权边界

正文来自 [sunface/rust-course](https://github.com/sunface/rust-course)，作者在仓库中声明为 No License，并明确说明不能私下修改后重新包装分发。本工作区适合个人阅读与主题验证；如果要以新的域名、名称或品牌公开发布，应先获得原作者授权。mdBook 本身采用 MPL-2.0 许可证。
