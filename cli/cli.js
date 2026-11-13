#!/usr/bin/env node
/* 公文核心 CLI —— 不依赖任何模型，纯本地确定性能力
 *
 * 用法：
 *   node cli/cli.js detect  <文件或文本>      判断文种
 *   node cli/cli.js card    <文种id>          打印文种卡（注入提示词用，≤450字）
 *   node cli/cli.js list                      列出全部文种
 *   node cli/cli.js check   <文件或文本> [文种id]  确定性核稿（不调模型）
 *
 * 示例：
 *   node cli/cli.js check examples/请示-有硬伤.txt
 *   node cli/cli.js card tongzhi
 */
'use strict';
const fs = require('fs');
const path = require('path');

/* gongwen.js 是浏览器 IIFE（挂 window），Node 下给个 window 壳即可复用 */
global.window = {};
require(path.join(__dirname, '..', 'core', 'gongwen.js'));
const GW = global.window.GW;

function loadInput(arg) {
  if (arg && fs.existsSync(arg)) return fs.readFileSync(arg, 'utf8');
  return arg || '';
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'list') {
  const groups = GW.groups();
  for (const [g, ids] of Object.entries(groups)) {
    console.log('【' + g + '】');
    ids.forEach(id => {
      const d = GW.get(id);
      console.log('  ' + id.padEnd(10) + d.name + '  ' + d.use.slice(0, 40) + '…');
    });
  }
  process.exit(0);
}

if (cmd === 'card') {
  const t = GW.cardText(rest[0]);
  if (!t) { console.error('未知文种，用 list 查看：' + rest[0]); process.exit(1); }
  console.log(t);
  process.exit(0);
}

if (cmd === 'detect') {
  const s = loadInput(rest[0]);
  const id = GW.detect(s);
  console.log(id ? '判定文种：' + id + '（' + GW.get(id).name + '）' : '判不准（建议用户明确文种）');
  process.exit(0);
}

if (cmd === 'check') {
  const s = loadInput(rest[0]);
  if (!s.trim()) { console.error('没有输入。用法：node cli/cli.js check <文件> [文种id]'); process.exit(1); }
  const gid = rest[1] || GW.detect(s);
  const list = GW.check(s, gid);
  console.log(GW.checkText(list, gid));
  process.exit(0);
}

console.log([
  '公文核心 CLI（离线、确定性、不调模型）',
  '',
  '  node cli/cli.js list                  列出全部文种',
  '  node cli/cli.js card <文种id>          打印文种卡',
  '  node cli/cli.js detect <文件|文本>     判断文种',
  '  node cli/cli.js check <文件|文本> [文种] 确定性核稿',
  '',
  '文种 id 用 list 查看，如 tongzhi / qingShi / baogao / han …'
].join('\n'));
