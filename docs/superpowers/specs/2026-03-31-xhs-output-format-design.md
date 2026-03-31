# XHS Spider 输出格式增强设计

## 需求

为 CLI 工具增加 `--format/-f` 参数，支持多种输出格式。

## 设计概述

新增 `utils/formatters/` 目录，包含四个格式化器文件，统一接口输出字符串。

## 详细设计

### 1. 格式化器接口

```typescript
// utils/formatters/index.ts
export interface Formatter {
  format(data: any[]): string;
}
```

### 2. 格式化器实现

| 文件 | 格式 | 说明 |
|------|------|------|
| `json.ts` | JSON | 美化缩进2格 |
| `table.ts` | Table | 控制台表格，用 `console.table` 或自定义 |
| `csv.ts` | CSV | 带表头，逗号分隔 |
| `md.ts` | Markdown | Markdown 表格语法 |

### 3. CLI 集成

**全局参数：**
```typescript
.option('-f, --format <format>', '输出格式: json(默认), table, csv, md', 'json')
```

**格式化器注册：**
```typescript
const formatters: Record<string, Formatter> = {
  json: new JsonFormatter(),
  table: new TableFormatter(),
  csv: new CsvFormatter(),
  md: new MdFormatter(),
};
```

**输出逻辑：**
```typescript
const formatter = formatters[options.format || 'json'];
console.log(formatter.format(noteList));
```

### 4. 固定字段

输出以下字段：`title`, `desc`, `user`, `time`, `likes`, `comments`, `collects`, `shares`, `tags`, `url`

### 5. 数据为空处理

- JSON: `[]`
- Table/CSV/MD: 输出表头但无数据行

## 文件结构

```
utils/formatters/
├── index.ts        # 接口和导出
├── json.ts
├── table.ts
├── csv.ts
└── md.ts
```

## 影响范围

仅修改 `index.ts`，添加 formatter 相关导入和调用逻辑。
