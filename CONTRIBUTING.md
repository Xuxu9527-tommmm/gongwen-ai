# 贡献指南

欢迎 PR。这个项目的核心资产是**文种卡**和**核稿规则**，两者都是可枚举的，
改动小、好验证。

## 提交什么

### 1. 新文种卡 / 修文种卡

- 在 `core/gongwen.js` 的 `GENRES` 加一条或修改（字段说明见 `docs/ARCHITECTURE.md`）
- 同步更新 `SIGNAL`（判文种关键词）、`ENDING`（结语表）、`groups()`
- 卡片总长保持 ≤450 字（压缩原则：结构行比解释行优先保留）

### 2. 新核稿规则

- 先在 issue 里讨论：这条规则要**确定性**（同一输入永远同一输出）、
  **零误报**（拿不准的不报）；
- 实现放 `check()` 里对应的小节，遵守 `docs/CHECK_RULES.md` 的设计原则
  （不写条款号、err/warn 分级）；
- 跑回归基线：`examples/` 两个样例的结果不能退化。

### 3. 提示词模板

- `prompt-templates/` 下的 Markdown，人能直接读改；
- 模板里禁止写具体单位名、人名、真实文号，占位一律「××」。

## 怎么验证改动

```bash
node cli/cli.js check examples/请示-有硬伤.txt   # 期望：5 err + 1 warn
node cli/cli.js check examples/通知-合格.txt     # 期望：0 err
node cli/cli.js detect examples/请示-有硬伤.txt  # 期望：qingShi
```

有 Node 测试更好，但不强制——样例基线是最低门槛。

## 风格

- 代码注释讲**为什么**，不讲是什么（是什么看代码就知道）；
- 中文标点用全角；占位符一律「××」；
- 提交信息一句话说清改了什么、为什么。
