# 更新日志（Changelog）

本项目的所有重要变更都记录在这里。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循语义化版本。

## [1.1.0] - 2026-11-25

### 新增

- **CHANGELOG.md**：从本版本起正式记录更新日志。
- **配套产品指引**：README 新增「相关项目」一节——想要**开箱即用的完整产品**（含引擎、界面、安装包），前往 [local-office-assistant](https://github.com/Xuxu9527-tommmm/local-office-assistant) 的 Releases 下载；本仓库开源的是可以被你**自己修改、审计、替换**的知识层（文种卡、核稿规则、版式参数）。

### 文档

- README 补充：国产系统兼容性对照、模型获取与放置说明、能力边界、发起背景。
- 新增英文版 README（`README.en.md`）与语言切换入口。

### 修复

- **Skill 包 v1.0.1**：修复 Skill 商店解析失败问题——补齐 `description_zh` 字段；`display_name`「公文专家」与已有 Skill 重名，改为「简单易用公文专家」。

### 配套产品同步（在 local-office-assistant v1.6.0 中修复，与本仓库知识层无关）

- 统信 UOS / 银河麒麟启动报 `no backends are loaded`（引擎加载器路径错位）
- 启动判定依赖 curl 导致的误报
- 老浏览器（Firefox 60+）页面按钮失效的语法兼容

详见 [local-office-assistant CHANGELOG](https://github.com/Xuxu9527-tommmm/local-office-assistant/blob/main/CHANGELOG.md)。

## [1.0.0] - 2026-11

- 首个公开版本：完全离线的公文知识工程
- 20 个文种知识卡 + 自动判文种 + 11 类确定性核稿 + GB/T 9704-2012 版式参数
- CLI（Node ≥14）与 Web 两套形态，可嫁接 Ollama / llama.cpp 等本地模型
- 本仓库不含模型，模型由使用者自行下载（推荐 4B 量化模型）

[1.1.0]: https://github.com/Xuxu9527-tommmm/gongwen-ai/releases
[1.0.0]: https://github.com/Xuxu9527-tommmm/gongwen-ai/releases
