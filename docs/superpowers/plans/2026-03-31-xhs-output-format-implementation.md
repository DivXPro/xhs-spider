# XHS Spider 输出格式增强实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 CLI 增加 `--format/-f` 参数，支持 json/table/csv/md 四种输出格式

**Architecture:** 新增 `utils/formatters/` 目录，包含四个格式化器实现，通过统一接口调用。CLI层注入格式化器，根据参数选择输出格式。

**Tech Stack:** TypeScript, 原生字符串处理（无额外依赖）

---

## 文件结构

```
utils/formatters/
├── index.ts        # 接口定义、导出、字段映射
├── json.ts         # JSON 格式化器
├── table.ts        # Table 格式化器
├── csv.ts          # CSV 格式化器
└── md.ts           # Markdown 格式化器
```

**Modify:**
- `index.ts` — 添加全局 `--format` 参数和格式化器调用逻辑

---

## 字段映射

设计文档中的字段名与 NoteInfo 实际字段对应关系：

| 设计字段 | NoteInfo 字段 |
|---------|--------------|
| title | title |
| desc | desc |
| user | nickname |
| time | upload_time |
| likes | liked_count |
| comments | comment_count |
| collects | collected_count |
| shares | share_count |
| tags | tags (数组转字符串) |
| url | note_url |

---

## Task 1: 创建格式化器目录和基础文件

**Files:**
- Create: `utils/formatters/index.ts`

- [ ] **Step 1: 创建 utils/formatters 目录**

```bash
mkdir -p utils/formatters
```

- [ ] **Step 2: 创建 utils/formatters/index.ts**

```typescript
import { NoteInfo } from '../types';

// 字段映射：设计字段名 -> NoteInfo 字段名
export const FIELD_KEYS: Record<string, keyof NoteInfo> = {
  title: 'title',
  desc: 'desc',
  user: 'nickname',
  time: 'upload_time',
  likes: 'liked_count',
  comments: 'comment_count',
  collects: 'collected_count',
  shares: 'share_count',
  tags: 'tags',
  url: 'note_url',
};

export const FIELD_LABELS: Record<string, string> = {
  title: '标题',
  desc: '描述',
  user: '用户',
  time: '时间',
  likes: '点赞',
  comments: '评论',
  collects: '收藏',
  shares: '分享',
  tags: '标签',
  url: '链接',
};

export const OUTPUT_FIELDS = Object.keys(FIELD_KEYS);

// 格式化单个字段值
export function formatFieldValue(key: string, value: any): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

// 从 NoteInfo 提取输出字段
export function extractOutputFields(note: NoteInfo): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [field, key] of Object.entries(FIELD_KEYS)) {
    result[field] = formatFieldValue(field, note[key]);
  }
  return result;
}

export interface Formatter {
  format(data: NoteInfo[]): string;
}
```

- [ ] **Step 3: 验证文件创建成功**

---

## Task 2: 实现 JSON 格式化器

**Files:**
- Create: `utils/formatters/json.ts`

- [ ] **Step 1: 创建 utils/formatters/json.ts**

```typescript
import { Formatter, extractOutputFields } from './index';
import { NoteInfo } from '../types';

export class JsonFormatter implements Formatter {
  format(data: NoteInfo[]): string {
    const output = data.map(note => extractOutputFields(note));
    return JSON.stringify(output, null, 2);
  }
}
```

- [ ] **Step 2: 验证编译无错误**

```bash
npx tsc --noEmit utils/formatters/json.ts
```

---

## Task 3: 实现 Table 格式化器

**Files:**
- Create: `utils/formatters/table.ts`

- [ ] **Step 1: 创建 utils/formatters/table.ts**

```typescript
import { Formatter, extractOutputFields, OUTPUT_FIELDS, FIELD_LABELS } from './index';
import { NoteInfo } from '../types';

export class TableFormatter implements Formatter {
  format(data: NoteInfo[]): string {
    if (data.length === 0) {
      // 只有表头
      return FIELD_LABELS.title + '\t' + FIELD_LABELS.desc + '\t' + FIELD_LABELS.user + '\t' +
             FIELD_LABELS.time + '\t' + FIELD_LABELS.likes + '\t' + FIELD_LABELS.comments + '\t' +
             FIELD_LABELS.collects + '\t' + FIELD_LABELS.shares + '\t' + FIELD_LABELS.tags + '\t' +
             FIELD_LABELS.url;
    }

    const lines: string[] = [];

    // 表头
    const headers = OUTPUT_FIELDS.map(f => FIELD_LABELS[f]).join('\t');
    lines.push(headers);

    // 数据行
    for (const note of data) {
      const row = extractOutputFields(note);
      const values = OUTPUT_FIELDS.map(f => row[f] || '');
      lines.push(values.join('\t'));
    }

    return lines.join('\n');
  }
}
```

- [ ] **Step 2: 验证编译无错误**

---

## Task 4: 实现 CSV 格式化器

**Files:**
- Create: `utils/formatters/csv.ts`

- [ ] **Step 1: 创建 utils/formatters/csv.ts**

```typescript
import { Formatter, extractOutputFields, OUTPUT_FIELDS, FIELD_LABELS } from './index';
import { NoteInfo } from '../types';

// 转义 CSV 字段值
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export class CsvFormatter implements Formatter {
  format(data: NoteInfo[]): string {
    const lines: string[] = [];

    // 表头
    const headers = OUTPUT_FIELDS.map(f => FIELD_LABELS[f]);
    lines.push(headers.map(escapeCsvValue).join(','));

    // 数据行
    for (const note of data) {
      const row = extractOutputFields(note);
      const values = OUTPUT_FIELDS.map(f => escapeCsvValue(row[f] || ''));
      lines.push(values.join(','));
    }

    return lines.join('\n');
  }
}
```

- [ ] **Step 2: 验证编译无错误**

---

## Task 5: 实现 Markdown 格式化器

**Files:**
- Create: `utils/formatters/md.ts`

- [ ] **Step 1: 创建 utils/formatters/md.ts**

```typescript
import { Formatter, extractOutputFields, OUTPUT_FIELDS, FIELD_LABELS } from './index';
import { NoteInfo } from '../types';

export class MdFormatter implements Formatter {
  format(data: NoteInfo[]): string {
    const lines: string[] = [];

    // 表头
    const headers = OUTPUT_FIELDS.map(f => FIELD_LABELS[f]);
    lines.push('| ' + headers.join(' | ') + ' |');

    // 分隔行
    lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');

    // 数据行
    for (const note of data) {
      const row = extractOutputFields(note);
      const values = OUTPUT_FIELDS.map(f => row[f] || '');
      lines.push('| ' + values.join(' | ') + ' |');
    }

    return lines.join('\n');
  }
}
```

- [ ] **Step 2: 验证编译无错误**

---

## Task 6: 集成到 CLI

**Files:**
- Modify: `index.ts:1-204`

- [ ] **Step 1: 添加导入**

在 `index.ts` 顶部添加：

```typescript
import { JsonFormatter } from './utils/formatters/json';
import { TableFormatter } from './utils/formatters/table';
import { CsvFormatter } from './utils/formatters/csv';
import { MdFormatter } from './utils/formatters/md';
import type { Formatter } from './utils/formatters';
```

- [ ] **Step 2: 添加格式化器注册和全局参数**

在 `program.version('1.0.0');` 之后添加：

```typescript
const formatters: Record<string, Formatter> = {
  json: new JsonFormatter(),
  table: new TableFormatter(),
  csv: new CsvFormatter(),
  md: new MdFormatter(),
};
```

- [ ] **Step 3: 修改全局参数**

找到 `.version('1.0.0')` 所在行，改为：

```typescript
  .version('1.0.0')
  .option('-f, --format <format>', '输出格式: json(默认), table, csv, md', 'json');
```

- [ ] **Step 4: 添加输出辅助函数**

在格式化器注册之后添加：

```typescript
function getFormatter(format?: string): Formatter {
  return formatters[format || 'json'] || formatters.json;
}
```

- [ ] **Step 5: 修改 note 命令**

在 `note` 命令的 `.action()` 末尾，将：
```typescript
console.log(JSON.stringify(noteInfo, null, 2));
```
改为：
```typescript
const noteList = [noteInfo];
console.log(getFormatter(options.format).format(noteList));
```

同时在 `.action()` 中添加 `format` 参数：
```typescript
.action(async (url: string, options: { cookies?: string; download?: boolean; format?: string }) => {
```

并在 `.option()` 中添加格式参数：
```typescript
.option('-f, --format <format>', '输出格式: json, table, csv, md', 'json')
```

- [ ] **Step 6: 修改 user 命令**

同样添加 `--format` option 并修改 `.action()` 签名和输出逻辑。

将 `console.log(JSON.stringify(noteList, null, 2));` 改为：
```typescript
console.log(getFormatter(options.format).format(noteList));
```

- [ ] **Step 7: 修改 search 命令**

同样添加 `--format` option 并修改输出逻辑。

- [ ] **Step 8: 修改 creator 命令**

同样添加 `--format` option 并修改输出逻辑。

- [ ] **Step 9: 编译验证**

```bash
npx tsc
```

- [ ] **Step 10: 测试**

```bash
# 测试 JSON 格式 (默认)
node dist/index.js note "https://www.xiaohongshu.com/explore/xxx" -c "testcookies" -f json

# 测试 Table 格式
node dist/index.js note "https://www.xiaohongshu.com/explore/xxx" -c "testcookies" -f table

# 测试 CSV 格式
node dist/index.js note "https://www.xiaohongshu.com/explore/xxx" -c "testcookies" -f csv

# 测试 MD 格式
node dist/index.js note "https://www.xiaohongshu.com/explore/xxx" -c "testcookies" -f md
```

---

## 自检清单

- [ ] Spec 覆盖检查：所有输出格式(json/table/csv/md)都有对应 Task
- [ ] 占位符扫描：无 TBD/TODO/不完整内容
- [ ] 类型一致性：NoteInfo 字段名与 FIELD_KEYS 映射正确
- [ ] 影响范围：仅修改 index.ts 和新增 formatters 目录
