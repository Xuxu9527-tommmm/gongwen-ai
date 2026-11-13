# gongwen-ai 公文 AI 核心能力库

> 让 4B 的小模型也能写出"像样"的公文——靠的不是模型大小，是**规矩**。
>
> 一套完全离线的公文知识工程：**20 个文种知识卡 + 自动判文种 + 11 类确定性核稿 + GB/T 9704 版式参数**。不联网、不调外部 API、可嫁接到任何本地模型（Ollama / llama.cpp）或在线模型。

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E14-green)](cli/cli.js)
[![Offline](https://img.shields.io/badge/network-none-success)](#)

---

## 为什么开源这个

公文写得像不像，靠的不是模型大小，是「规矩」。规矩分三类：

| 类别 | 例子 | 处理方式 |
|---|---|---|
| ① 文种规矩 | 15 种法定文种各有结构、要素、结语 | **可枚举 → 做成知识卡注入** |
| ② 版式规矩 | GB/T 9704-2012 字体字号页边距 | **可枚举 → 导出时确定性落地** |
| ③ 提法规矩 | 政策表述有时效性 | **只能人核，机器不碰** |

①②是可以枚举、可检索、可校验的。做成**外挂知识库**比"训进模型"更准：

- 每次只注入当前文种那一张卡（**≤450 字**），4B 模型也吃得透；
- 核稿走**确定性规则**：毫秒级、100% 可复现、不烧 token、不会胡说。

这套思路已在真实产品中验证：一个小模型 + 本知识库，写出的通知、请示、报告被机关老笔杆认可，核稿能抓住"请示报告"混用、序号跳级、结语错配、发文字号括号错误等硬伤。

## 快速开始

### ① 双击体验（零依赖）

用浏览器打开 [`web/demo.html`](web/demo.html)——单文件、纯前端、不联网：

- **文种卡**：浏览 20 个文种的结构、必备要素、易错点
- **判文种 + 核稿**：粘一段稿子，自动判文种并出核稿报告

### ② 命令行（需 Node ≥14）

```bash
git clone https://github.com/Xuxu9527-tommmm/gongwen-ai.git
cd gongwen-ai

node cli/cli.js list                          # 列出全部文种
node cli/cli.js card tongzhi                  # 打印「通知」文种卡
node cli/cli.js detect examples/请示-有硬伤.txt # 判文种 → qingShi（请示）
node cli/cli.js check examples/请示-有硬伤.txt  # 确定性核稿
```

核稿输出示例（对 `examples/请示-有硬伤.txt`，5 处硬伤全部命中）：

```
查出 5 处硬伤、1 处提醒（文种：请示）

1. 【必须改】标题
   「请示报告」不是法定文种。
   → 要批准改「请示」，只汇报改「报告」

2. 【必须改】主送机关
   请示只能主送一个上级机关，不能多头主送。
   → 只保留一个主送机关，其他放抄送
   ...
```

### ③ 接到本地模型上出稿

```bash
# 启动 Ollama（或任何 OpenAI 兼容服务：llama.cpp server / vLLM / LM Studio）
ollama serve

# 文种卡注入 + 出稿：先取卡，再当 system prompt 的一部分
CARD=$(node cli/cli.js card qingShi)
curl -s http://127.0.0.1:11434/v1/chat/completions -H "Content-Type: application/json" -d "$(node -e "
const card = process.argv[1];
const user = '帮各单位培训基地写一份请示：下半年想办一期基层业务培训班，预算大概8万，培训对象是全体基层人员。';
console.log(JSON.stringify({
  model: 'qwen3:4b',
  messages: [
    { role: 'system', content: '你是机关公文写作专家。严格按下面文种卡的结构写，小标题一字不改；用户没给的信息一律写「××」，绝不编造。\n' + card },
    { role: 'user', content: user }
  ]
}))" "$CARD")" | jq -r '.choices[0].message.content'
```

写完把稿子喂回 `node cli/cli.js check` 就是自动核稿闭环。完整脚本见 [`examples/本地出稿-闭环.sh`](examples/本地出稿-闭环.sh)。

## 目录结构

```
gongwen-ai/
├── core/
│   ├── gongwen.js            # 核心：20 文种卡 + 判文种 + 确定性核稿（单文件、零依赖）
│   └── prompts-gongwen.json  # 21 条实测打磨过的公文技能提示词（可直接当 system prompt）
├── cli/
│   └── cli.js                # 命令行：list / card / detect / check
├── web/
│   └── demo.html             # 纯前端单文件 Demo，双击即用
├── examples/
│   ├── 请示-有硬伤.txt        # 核稿演示样例（故意埋了 5 处硬伤）
│   ├── 通知-合格.txt          # 合格样例（0 硬伤）
│   └── 本地出稿-闭环.sh       # Ollama 出稿 → 核稿 的完整闭环脚本
├── prompt-templates/         # 按文种分类的提示词模板（Markdown，人能直接读改）
├── docs/
│   ├── ARCHITECTURE.md       # 架构与设计决策
│   ├── GB9704.md             # GB/T 9704-2012 版式参数速查（导出 Word/PDF 用）
│   └── CHECK_RULES.md        # 确定性核稿的 11 类规则说明
├── LICENSE                   # Apache-2.0
└── CONTRIBUTING.md
```

## 核心概念：文种卡（Genre Card）

每个文种一张卡，字段固定：`use`（适用）/ `no`（不适用）/ `struct`（结构模板）/ `must`（必备要素）/ `end`（规范结语）/ `trap`（易错点）/ `len`（篇幅区间）。

写稿时**只注入当前那张**（`GW.cardText(id)`，压到 ≤450 字）——这是小模型能跟住结构的关键：全量塞 20 张卡，4B 模型会串文种；只给一张，结构跟得很稳。

判文种（`GW.detect(text)`）用关键词加权打分：标题区命中权重 6、正文 2、文种名收尾再 +10；分数过低返回 `null` 交还用户，**宁可问也不猜**。

## 确定性核稿（11 类规则）

| # | 检查项 | 级别 |
|---|---|---|
| 1 | 标题：句号、超长、"请示报告"伪文种、有"关于"无文种 | err/warn |
| 2 | 主送机关：缺冒号、请示多头主送 | warn/err |
| 3 | 结语与文种匹配（通知↔特此通知，请示↔妥否请批示…） | err |
| 4 | 请示夹带报告 / 报告夹带请示 / 一文一事 | err/warn |
| 5 | 层次序号跳级（一、→（一）→1.）、「1.」与「1、」混用 | err/warn |
| 6 | 成文日期：汉字数字、前导零、套往年模板 | err/warn |
| 7 | 发文字号必须六角括号〔〕；半角标点 | err/warn |
| 8 | 语气：感叹号、函用下行口气 | warn |
| 9 | 空话密度（高度重视×3、狠抓落实…） | warn |
| 10 | 「××」占位符统计 | warn |
| 11 | 篇幅超文种区间 1.8 倍 | warn |

规则设计原则：**只报确定的问题，不写条款号**（模型和人一样记不准"GB/T 9704 第几条"，写了反而误导）。详见 [`docs/CHECK_RULES.md`](docs/CHECK_RULES.md)。

## 接入你的应用

```html
<script src="core/gongwen.js"></script>
<script>
  GW.detect(text)            // → 'qingShi' | null
  GW.cardText('qingShi')     // → 文种卡文本（注入 system prompt）
  GW.check(text, 'qingShi')  // → [{lv:'err', at:'标题', msg:'…', fix:'…'}]
  GW.checkText(list, gid)    // → 给人看的核稿报告
  GW.groups() / GW.get(id)   // → 分组与文种详情
</script>
```

零依赖、单文件、浏览器 / Node 通用（Node 下先 `global.window = {}` 再 require）。

## 路线图

- [ ] 更多地方文种卡（如××省党政机关公文细则）——欢迎按 `core/gongwen.js` 的卡格式提 PR
- [ ] Python 版核稿（与 JS 版规则一一对应，供后端集成）
- [ ] GB/T 9704 导出器（docx）参考实现
- [ ] 英文 / 少数民族文字公文的适配讨论

## 致谢与许可

本项目代码以 **Apache-2.0** 开源。设计过程中参考过以下开源项目的方法论（未引入其代码或受限制内容）：

- [linhut/gongwen-skill](https://github.com/linhut/gongwen-skill)（MIT）—— 公文格式与语言风格思路
- [lieflat-gongwen](https://github.com/lispking/lieflat-gongwen)（PolyForm NC）—— "文风可量化"的思路

知识来源：[《党政机关公文处理工作条例》（中办发〔2012〕14 号）](http://www.gov.cn/zhengce/2012-04/16/content_1813830.htm)、[GB/T 9704-2012《党政机关公文格式》](https://openstd.samr.gov.cn)（公开国家标准）。

**免责声明**：本工具只做格式与结构层面的确定性检查。政策提法、数字口径、涉密内容必须由本单位核稿人终审。

---

> 全部离线。不联网，不上传任何内容。
