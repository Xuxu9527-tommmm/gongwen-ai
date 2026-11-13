#!/usr/bin/env bash
# 本地出稿 → 自动核稿 的完整闭环示例
# 依赖：Ollama（或任何 OpenAI 兼容服务），jq
# 用法：./examples/本地出稿-闭环.sh "下半年想办一期基层业务培训班，预算8万，对象是全体基层人员"
set -e
cd "$(dirname "$0")/.."

REQUIREMENT="${1:?用法：$0 \"你的需求一句话\"}"
MODEL="${MODEL:-qwen3:4b}"
API="${API:-http://127.0.0.1:11434/v1/chat/completions}"

# 1) 判文种（用户没说文种，先用关键词判；判不出默认请示，用户可改）
GENRE=$(node cli/cli.js detect "$REQUIREMENT" | grep -o '[a-zA-Z]*' | head -1)
GENRE="${GENRE:-qingShi}"
echo "==> 判定文种：$GENRE"

# 2) 取文种卡，注入 system prompt 出稿
CARD=$(node cli/cli.js card "$GENRE")
DRAFT=$(curl -s "$API" -H "Content-Type: application/json" -d "$(REQ="$REQUIREMENT" CARD="$CARD" MODEL="$MODEL" node -e '
const body = {
  model: process.env.MODEL,
  messages: [
    { role: "system", content:
      "你是机关公文写作专家。严格按下面文种卡的结构写，小标题一字不改；" +
      "用户没给的信息一律写「××」，绝不编造；第一行必须是标题。\n" +
      process.env.CARD },
    { role: "user", content: process.env.REQ }
  ]
};
console.log(JSON.stringify(body));') | jq -r '.choices[0].message.content')"

echo "==> 出稿完成，保存到 /tmp/draft.txt"
printf '%s\n' "$DRAFT" > /tmp/draft.txt

# 3) 确定性核稿（不调模型）
echo "==> 确定性核稿结果："
node cli/cli.js check /tmp/draft.txt "$GENRE"

echo
echo "==> 按核稿改完，就是一份结构合规的稿子了。政策提法和数字请人工终审。"
