---
name: xhs-comment-analysis
description: 小红书评论商业价值分析技能 - 通过 Agent 编排实现评论数据分析
---

# xhs-comment-analysis

小红书评论商业价值分析技能

---

## Skill Metadata

**Name:** xhs-comment-analysis
**Type:** Analysis Skill (Agent-Driven)
**Input:** `datas/media_datas/{笔记ID}/comments.yaml`
**Output:**
- `comment_analysis.yaml` - 每条评论分析结果
- `comment_summary.md` - 量化汇总报告

---

## Triggers

Invoke this skill when:
- 用户请求分析小红书评论数据
- 用户提到评论分析、商业价值、口碑分析
- 评论数据已下载到本地 (`comments.yaml`)

---

## Prerequisites

评论数据已下载到本地：
```bash
xhs comment "url" --download
```

文件位置：`datas/media_datas/{笔记ID}/comments.yaml`

---

## Analysis Approach

**本技能由 Agent 自主编排整个分析过程，而非代码驱动。**

Agent 需要：
1. 读取本地评论数据
2. 自主决定分批策略（考虑 token 限制）
3. 调用 LLM 逐步分析每批数据
4. 汇总所有分析结果
5. 生成量化汇总报告

---

## Agent Workflow

### Step 1: 读取评论数据

读取 `datas/media_datas/{笔记ID}/comments.yaml`，了解评论总数和内容。

### Step 2: 规划分批策略

根据评论数量和 LLM 上下文限制，自主决定：
- 每批评论数量（建议每批 20-50 条）
- 总批次数
- 分析顺序

### Step 3: 分批调用 LLM 分析

对于每批评论，使用以下 Prompt 模板调用 LLM：

```markdown
## 角色
你是一名小红书数据分析师，专注于商业价值分析。

## 任务
分析以下评论数据，为每条评论生成结构化的分析结果。

## 评论数据
{comments_batch}

## 分析要求

请对每条评论进行以下维度的分析：

1. **sentiment** - 情感分析
   - label: positive | negative | neutral
   - score: 0-1 的置信度分数
   - keywords: 情感关键词列表

2. **topic** - 话题分类
   - category: 产品体验 | 购买咨询 | 竞品对比 | 售后服务 | 其他
   - tags: 相关标签列表

3. **purchase_intent** - 购买意向
   - level: none | weak | medium | strong
   - type: none | asking | purchased | recommend

4. **commercial_value** - 商业价值
   - is_value_comment: true | false
   - value_type: 口碑推荐 | 需求咨询 | 痛点反馈 | 竞品对比 | 无价值

## 输出格式
请以 YAML 格式输出分析结果，格式如下：

```yaml
analyses:
  - comment_id: "评论ID"
    original_content: "原始评论内容"
    sentiment:
      label: "positive/negative/neutral"
      score: 0.0-1.0
      keywords: ["关键词1", "关键词2"]
    topic:
      category: "分类名称"
      tags: ["标签1", "标签2"]
    purchase_intent:
      level: "none/weak/medium/strong"
      type: "none/asking/purchased/recommend"
    commercial_value:
      is_value_comment: true/false
      value_type: "口碑推荐/需求咨询/痛点反馈/竞品对比/无价值"
```

请直接输出 YAML，不要包含其他内容。
```

### Step 4: 保存中间结果

将每批 LLM 返回的分析结果保存到 `comment_analysis.yaml`。

### Step 5: 生成汇总报告

基于所有分析结果，生成 `comment_summary.md`：

```markdown
# 评论分析汇总报告

**笔记ID**: xxx
**分析时间**: xxxx-xx-xx
**评论总数**: xxx 条

---

## 量化分析

### 情感分布

| 情感 | 数量 | 占比 |
|------|------|------|
| 正面 | xx | xx% |
| 中性 | xx | xx% |
| 负面 | xx | xx% |

### 话题分布

| 话题 | 数量 | 占比 |
|------|------|------|
| 产品体验 | xx | xx% |
| 购买咨询 | xx | xx% |
| 竞品对比 | xx | xx% |
| 售后服务 | xx | xx% |
| 其他 | xx | xx% |

### 购买意向

| 意向等级 | 数量 | 占比 |
|----------|------|------|
| 强 | xx | xx% |
| 中 | xx | xx% |
| 弱 | xx | xx% |
| 无 | xx | xx% |

### 商业价值分类

| 类型 | 数量 | 占比 |
|------|------|------|
| 口碑推荐 | xx | xx% |
| 需求咨询 | xx | xx% |
| 痛点反馈 | xx | xx% |
| 竞品对比 | xx | xx% |
| 无价值 | xx | xx% |

---

## 核心洞察

### 关键发现

1. ...
2. ...
3. ...

### 营销建议

1. ...
2. ...
3. ...

---

*本报告由 AI 自动生成*
```

---

## Output Files

### comment_analysis.yaml

```yaml
note_id: "abc123"
analyzed_at: "2026-04-09T10:30:00"
total_comments: 100

analyses:
  - comment_id: "c1"
    original_content: "这款产品真的很好用，强烈推荐！"
    sentiment:
      label: "positive"
      score: 0.95
      keywords: ["好用", "推荐", "强烈"]
    topic:
      category: "产品体验"
      tags: ["效果", "品质"]
    purchase_intent:
      level: "strong"
      type: "recommend"
    commercial_value:
      is_value_comment: true
      value_type: "口碑推荐"
```

### comment_summary.md

量化汇总报告，包含：
- 情感分布统计
- 话题分布统计
- 购买意向统计
- 商业价值分类统计
- 核心洞察与营销建议

---

## Notes

- Agent 应自主管理分批策略，避免单次请求过长
- 评论量大时（>100条）建议每批 30-50 条
- 保持分析结果的一致性，使用相同的分类标准
- 最终报告应基于所有评论的综合分析
