# gongwen-ai — A Rulebook for Chinese Official Documents

[中文](README.md) | **English**

> A 4B model can write a passable *gongwen* — not because the model is big, but because the **rules are written down**.
>
> A fully offline knowledge layer for Chinese official documents: **20 genre cards + automatic genre detection + 11 deterministic proofreading rules + GB/T 9704 layout specs**. No network, no external API, and it plugs into any local model (llama.cpp / Ollama) or a hosted one.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E14-green)](cli/cli.js)
[![Offline](https://img.shields.io/badge/network-none-success)](#)
[![Model](https://img.shields.io/badge/model-not%20included-orange)](#the-model-is-not-in-this-repo)

**This repository contains no model weights.** Models are large and carry their own licenses, so they don't belong in Git. Download one yourself — a **4B-class** model is enough, and it runs on an ordinary office PC with no GPU.

---

## What it is, and who it's for

In one line: **a writing assistant for people in Chinese government agencies, public institutions and state-owned enterprises who write official documents and fill in reports every day** — installed on their own machine, working with the network cable unplugged.

| | |
|---|---|
| **How it runs** | Fully local. The model is on your disk, the genre cards are on your disk, and nothing you write is sent anywhere. |
| **Platforms** | Windows / macOS / Kylin / UOS. Installs on an ordinary office PC; no discrete GPU needed. |
| **Network** | Pull the cable and keep working. No telemetry, no license check, no calls to any domain. |
| **Model** | Not included. Drop in any 4B quantized GGUF model — see the next section. |

### Scope and safety boundary (please read this part)

Being offline solves "**content does not leak**". It does **not** solve "**am I allowed to install this**".

- **Ordinary office PC** — fine for personal daily use. Still, follow your organisation's IT policy and register it rather than installing quietly.
- **Classified computers / fully air-gapped private machines** — **not recommended, even though it is offline.** Such machines run software whitelists and audit trails; installing any unapproved third-party program is a violation in itself. "But it's offline" is not an exemption.
- **Lawful use** — the output is a draft. Do not use it to fabricate official documents, invent data, or bypass approval workflows. Formal issuance still goes through your organisation's drafting, review and signing process.

> To be blunt: offline mode stops "content from being sent out". It does not stop "someone who is determined to get in". Real security comes from management process and physical isolation, not from a piece of software. Don't treat this as a shield.

## Why open source this

Whether a *gongwen* reads right is not a matter of model size. It is a matter of rules, and the rules come in three kinds:

| Kind | Example | Approach |
|---|---|---|
| Genre rules | Each of the 15 statutory genres has its own structure, required elements and closing formula | **Enumerable → inject as a knowledge card** |
| Layout rules | GB/T 9704-2012 fonts, sizes, margins | **Enumerable → apply deterministically on export** |
| Policy-citation rules | Wording has a shelf life | **Human review only; the machine stays out of it** |

The first two are enumerable, searchable and checkable. Keeping them as an **external knowledge base** beats baking them into a model:

- Only the card for the current genre is injected (**≤450 characters**), so even a 4B model can hold it;
- Proofreading runs on **deterministic rules** — milliseconds, 100% reproducible, no tokens burned, no hallucination.

This approach has been validated in a real product: a small model plus this knowledge base produces notices, requests and reports that veteran government writers accept, and the checker catches hard errors such as "请示报告" (a non-existent hybrid genre), skipped heading levels, mismatched closing formulas, and wrong bracket types in document numbers.

## Will it run on your machine

Two very different things, with very different requirements:

| Form | What you need | Barrier to entry |
|---|---|---|
| **A. Knowledge layer only** (genre cards / detection / proofreading) | A browser, or Node ≥14 | **Almost none.** Works offline, works on old machines, works on Chinese domestic OSes, LoongArch, even SW64 |
| **B. Drafting with a local model** | Plus an inference engine and a model file | 4-core CPU / 8 GB RAM / 5 GB disk, **no discrete GPU** |

The table below is about **Form B**. Form A does not care about your OS or CPU architecture — if it can open a browser, it runs.

### Chinese domestic operating systems

That ecosystem is fragmented, so here is an honest split between "actually tested" and "not yet":

| OS | Arch | Status | Notes |
|---|---|---|---|
| Windows 10 / 11 | x64 | **Verified** | Primary platform; day-to-day testing happens here |
| Windows 10 / 11 | ARM64 | **Verified** (static) | Runs on Snapdragon laptops; no long-run stress test |
| Kylin OS V10 Desktop (银河麒麟) | x64 | **Verified** | Tested on real hardware |
| Kylin OS V10 Desktop (银河麒麟) | arm64 | **Verified** | Phytium / Kunpeng platforms |
| UnionTech UOS 20 (统信 UOS) | x64 | **Verified** | Tested on real hardware |
| UnionTech UOS 20 (统信 UOS) | arm64 | **Verified** (qemu) | VM only, not on real hardware |
| macOS 13+ | Intel / Apple Silicon | **Verified** (static) | |
| Deepin 20 / 23 | x64 | **Unverified** | Same lineage as UOS, expected to work, but **I have not tested it** |
| openKylin | x64 | **Unverified** | Same as above |
| Zhongke Fangde / Kylinsec | x64 | **Unverified** | Not tested |
| Loongson LoongArch | loongarch64 | **Not supported** | No prebuilt engine; compile llama.cpp yourself |
| Sunway | sw_64 | **Not supported** | No upstream support, no community port |

**How to read this table**: "Verified" means I actually ran it. "Unverified" means it should work but there is **no evidence** — if it fails on your machine, that is expected; please open an Issue with your result and I will update the table. "Not supported" means there is genuinely no path; don't waste your time.

> On Kylin/UOS, a `GLIBC_2.xx not found` error means your system libraries are older than the prebuilt engine expects. Compile llama.cpp from source. The knowledge layer (Form A) is unaffected.

## The model is not in this repo

**Why not**

- A 4B GGUF model is 2–3 GB; Git is the wrong place for it;
- Model licenses differ (Apache-2.0 / community licenses / commercial restrictions) and shipping them inside a code repo creates licensing trouble;
- Models iterate faster than code, so pinning one version ages badly.

**Recommended setup (this is where "low barrier" comes from)**

| Item | Suggestion | Notes |
|---|---|---|
| Model | **Qwen3-4B-Instruct**, GGUF Q4_K_M | ~2.5 GB. Strong Chinese corpus, reliable instruction following; 4B is the sweet spot for this task |
| Alternatives | Qwen2.5-3B-Instruct / Gemma-3-4B | 3B if you only have 4 GB RAM; Gemma if you mix in more English |
| Hardware | 4-core CPU / 8 GB RAM / 5 GB free disk | Old office laptops, integrated graphics, no dGPU |
| Engine | llama.cpp (`llama-server`) or Ollama | Ollama is the easiest |

**Download**

```bash
# Option 1: Hugging Face (use hf-mirror.com if you are in mainland China)
# Search for Qwen3-4B-Instruct-GGUF and download the file with Q4_K_M in its name (~2.5 GB)

# Option 2: Ollama (handles paths for you)
ollama pull qwen3:4b
```

**Where to put it** (the layout is up to you — **this repo contains neither `engine/` nor `models/`**; you create them)

```
your-workdir/
├── models/
│   └── Qwen3-4B-Instruct-Q4_K_M.gguf    ← the model
└── engine/
    └── llama-server                      ← the engine
```

With llama.cpp, a 4096-token context is plenty (a genre card is 450 characters, so a long context only slows you down):

```bash
./llama-server -m models/Qwen3-4B-Instruct-Q4_K_M.gguf \
  -c 4096 -t 4 --host 127.0.0.1 --port 8080
```

**Why 4B is enough — the work was moved off the model**

Two things usually go wrong when a 4B model writes on an ordinary PC: it can't sustain length, and it drifts off topic. This project takes both away from the model:

1. **The model doesn't have to remember structure** — the genre card fixes how many sections there are, what each contains and how to close, so the model only fills in content;
2. **The model doesn't have to judge compliance** — proofreading is 11 deterministic rules that run in milliseconds; a 4B and a 70B find exactly the same issues;
3. **Context isn't wasted** — only the current 450-character card is injected, so 4096 tokens is ample and you don't trade speed for prompt space.

The result: **4B + this knowledge base ≈ what a large model produces unaided**, at a hardware cost of one ordinary office laptop. Actual speed depends on your CPU core count — measure it on your own machine — but interactive drafting is comfortable.

> **On "optimisation and training"**: the companion product includes CPU inference tuning for llama.cpp and tuning on Chinese official-document corpora. **Neither the weights nor the engine are in this repo** — only the rules layer is open sourced. The reasoning is practical: you can download off-the-shelf weights, but the rules (genre cards, proofreading logic, layout specs) are the part that is readable, editable, auditable and worth improving together.

## Quick start

### 1. Try it in a browser (zero dependencies)

Open [`web/demo.html`](web/demo.html) — a single file, pure front end, no network:

- **Genre cards**: browse structure, required elements and common pitfalls for all 20 genres
- **Detect + proofread**: paste a draft, get the detected genre and a proofreading report

### 2. Command line (Node ≥14)

```bash
git clone https://github.com/Xuxu9527-tommmm/gongwen-ai.git
cd gongwen-ai

node cli/cli.js list                             # list all genres
node cli/cli.js card tongzhi                     # print the "notice" card
node cli/cli.js detect examples/请示-有硬伤.txt   # → qingShi (request for instructions)
node cli/cli.js check examples/请示-有硬伤.txt    # deterministic proofreading
```

Output for the deliberately flawed sample (all 5 hard errors caught):

```
查出 5 处硬伤、1 处提醒（文种：请示）

1. 【必须改】标题
   「请示报告」不是法定文种。
   → 要批准改「请示」，只汇报改「报告」
...
```

### 3. Draft with a local model

```bash
# Start Ollama, or any OpenAI-compatible server (llama.cpp server / vLLM / LM Studio)
ollama serve

CARD=$(node cli/cli.js card qingShi)
# Inject the card into the system prompt, then send the request.
# The full working script is in examples/本地出稿-闭环.sh
```

Then feed the draft back into `node cli/cli.js check` — that closes the loop: draft, check, fix.

## Repository layout

```
gongwen-ai/
├── core/
│   ├── gongwen.js            # 20 genre cards + detection + deterministic proofreading (single file, zero deps)
│   └── prompts-gongwen.json  # 21 battle-tested prompts, usable directly as system prompts
├── cli/
│   └── cli.js                # list / card / detect / check
├── web/
│   └── demo.html             # single-file browser demo
├── examples/
│   ├── 请示-有硬伤.txt        # 5 deliberately planted errors
│   ├── 通知-合格.txt          # clean sample, 0 errors
│   └── 本地出稿-闭环.sh       # Ollama draft → proofread loop
├── prompt-templates/         # genre-grouped prompt templates in Markdown
├── docs/
│   ├── ARCHITECTURE.md
│   ├── GB9704.md             # GB/T 9704-2012 layout parameters
│   └── CHECK_RULES.md        # the 11 proofreading rules
├── LICENSE                   # Apache-2.0
└── CONTRIBUTING.md
```

*(Documentation and code comments are currently in Chinese — contributions that improve English coverage are welcome.)*

## Core concept: the genre card

Each genre gets one card with a fixed schema: `use` (when to use), `no` (when not to), `struct` (section template), `must` (required elements), `end` (closing formula), `trap` (common mistakes), `len` (length range).

When drafting, **only the current card is injected** (`GW.cardText(id)`, compressed to ≤450 characters). This is the key to small models following structure: feed all 20 cards and a 4B model mixes genres up; feed one and it follows it reliably.

`GW.detect(text)` scores keyword matches — weight 6 in the title area, 2 in the body, +10 for a genre name at the end. When the score is too low it returns `null` and hands the decision back to the user: **better to ask than to guess**.

## Deterministic proofreading (11 rules)

| # | Check | Level |
|---|---|---|
| 1 | Title: trailing period, over-length, "请示报告" pseudo-genre, "关于" without a genre | err/warn |
| 2 | Addressee: missing colon, a request addressed to multiple superiors | warn/err |
| 3 | Closing formula matches the genre (notice ↔ "特此通知", request ↔ "妥否，请批示"…) | err |
| 4 | A request carrying a report / a report carrying a request / one document, one matter | err/warn |
| 5 | Skipped heading levels (一、→（一）→1.), mixed "1." and "1、" | err/warn |
| 6 | Date: Chinese numerals, leading zeros, recycled templates from earlier years | err/warn |
| 7 | Document number must use 〔〕; half-width punctuation | err/warn |
| 8 | Tone: exclamation marks, downward tone in a letter to peers | warn |
| 9 | Empty-phrase density ("高度重视" ×3, "狠抓落实"…) | warn |
| 10 | "××" placeholder count | warn |
| 11 | Length beyond 1.8× the genre range | warn |

Design rule: **report only what is certain, never cite article numbers.** Models and humans both misremember "Article X of GB/T 9704", and a wrong citation is worse than none. See [`docs/CHECK_RULES.md`](docs/CHECK_RULES.md).

## Using it in your app

```html
<script src="core/gongwen.js"></script>
<script>
  GW.detect(text)            // → 'qingShi' | null
  GW.cardText('qingShi')     // → card text, to inject into the system prompt
  GW.check(text, 'qingShi')  // → [{lv:'err', at:'标题', msg:'…', fix:'…'}]
  GW.checkText(list, gid)    // → human-readable report
  GW.groups() / GW.get(id)   // → groups and genre details
</script>
```

Zero dependencies, single file, works in browsers and Node (under Node, set `global.window = {}` before `require`).

## Capability boundary

Open source projects suffer most from "it seems to do everything". Here it is stated plainly — **if any line below fails your expectation, this project is not for you.**

### Reliable

| Capability | Notes |
|---|---|
| Genre detection | Given a draft, decide whether it should be a request, report, notice, letter…; returns `null` when unsure, **never guesses** |
| Structural skeleton | Sections, elements and closing formula from the genre card — the output looks like an official document, not an essay |
| Format errors | Trailing period in titles, "请示报告" hybrids, multiple addressees, mismatched closings, skipped levels, date formats, bracket types — **deterministic, no misses, no false alarms** |
| Tone and padding | Exclamation marks, a superior tone in a peer letter, density of empty phrases |
| Layout parameters | GB/T 9704-2012 fonts, sizes and margins, ready to apply on export |

### Weak — a human must take over

| Scenario | Reality |
|---|---|
| Long drafts (>2000 characters) | Structure drifts in the second half; **write section by section and assemble** |
| Numbers, amounts, names, places, organisations, document IDs | A 4B model will invent them. **The rule is: anything the user didn't supply becomes ××**, to be filled in by a human |
| Policy citations, references to superior documents | Out of scope. Such content has a shelf life and a hierarchy; whatever the machine produces will be wrong or stale |
| Regional writing conventions | The cards hold the general form; provincial and municipal conventions must be adjusted in `core/gongwen.js` |
| Meeting-minutes boilerplate | Phrases like "会议认为" / "会议指出" are only partially covered |

### Explicitly out of scope

- **No classification marking, no security review** — that belongs to your security office;
- **No substitute for signing** — this produces drafts; accountability stays with people;
- **No guarantee of policy currency** — what was correct yesterday may have changed today;
- **No fact checking** — it does not know whether your data is real.

### One-line test

> Suitable if: **format compliance, structural completeness and appropriate tone** eat a large part of your day, and you are willing to spend five minutes verifying facts and figures.
>
> Not suitable if: you want an AI to produce the final version, to find the policy basis for you, or to pass a security review on your behalf.

**Disclaimer**: this tool performs deterministic checks on format and structure only. Policy wording, figures and classified content must be reviewed by your organisation's document reviewer. Responsibility for the truthfulness and compliance of any document produced with this tool lies with the user.

## Roadmap

- [ ] More regional genre cards (e.g. provincial implementation rules) — PRs welcome, follow the card schema in `core/gongwen.js`
- [ ] Python port of the proofreading engine (rule-for-rule parity with the JS version, for backend integration)
- [ ] Reference GB/T 9704 exporter (docx)
- [ ] Discussion: English and minority-language adaptation

## Credits and license

Code is released under **Apache-2.0**. The design drew on methodology from the following open source projects (no code or restricted content was copied):

- [linhut/gongwen-skill](https://github.com/linhut/gongwen-skill) (MIT) — approach to format and language style
- [lieflat-gongwen](https://github.com/lispking/lieflat-gongwen) (PolyForm NC) — the idea that writing style can be quantified

Knowledge sources: *Regulations on the Handling of Official Documents by Party and Government Organs* (中办发〔2012〕14 号) and GB/T 9704-2012 *Format for Official Documents of Party and Government Organs* (public national standards).

## Background

This project didn't start from technology. It started from being told I didn't know how to talk.

I have been starting businesses since university — internet, commercial real estate, retail, restaurants. In 2024 I stopped to rest and let things settle; the pace of commercial work and how fast I had been growing made me want to slow down. Then I joined a state-owned enterprise in a middle-management role, and shortly after was seconded to a prefecture-level city to work on township investment promotion.

For someone who had spent his life in markets, the hardest part wasn't the work — it was that **the way I thought was normal to speak was judged abnormal here**. So I learned while writing, starting from zero on official documents.

By July 2026 I had visited more than a hundred townships. Two things stuck: local grassroots staff work genuinely hard; and **their channels for information from the outside world are genuinely narrow** — never mind how connected the internet is, everyone lives in a filter bubble, theirs is just thicker.

So I took the feedback I had collected, added my own experience, and spent three evenings building this. It tested well for me, so I am opening it up, hoping it gives some ideas to others stuck in the same pile of documents and forms.

I am not an expert, and I had never spent time on GitHub before — this is my first time. I had no reference point while building it; if something better exists, all the better. This project supports Chinese domestic operating systems and runs fully offline, which at least avoids some risk of data leakage and security exposure. That said, for someone determined enough, no door stays shut — so I would never call it "absolutely secure".

First time doing open source, and honestly I'm a bit nervous. Here's to peace in the world, and to steady, ordinary lives.

— Xuxu9527-tommmm, November 2026

---

> Entirely offline. No network access, nothing uploaded.
