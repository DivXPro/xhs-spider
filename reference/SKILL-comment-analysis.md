---
name: xhs-comment-analysis
description: 小红书评论商业价值分析技能 - 批量分析评论数据并生成量化报告
---

# xhs-comment-analysis

小红书评论商业价值分析技能

---

## Skill Metadata

**Name:** xhs-comment-analysis
**Type:** Analysis Skill
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

---

## Analysis Flow

```
读取 comments.yaml
       ↓
提取评论列表（批量处理）
       ↓
组装分析 Prompt
       ↓
提交给 LLM
       ↓
解析返回结果
       ↓
保存 comment_analysis.yaml
       ↓
生成 comment_summary.md
       ↓
输出分析完成
```

---

## Batch Processing

评论量大时（>50条）自动分批：

- **批量大小**：每批 30 条评论
- **批次间隔**：无间隔，连续处理
- **分批规则**：按顺序均分，避免打断上下文

---

## Output Files

### comment_analysis.yaml

```yaml
note_id: "abc123"
analyzed_at: "2026-04-09T10:30:00"
total_comments: 100
batch_count: 4

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

  - comment_id: "c2"
    original_content: "多少钱？在哪里买？"
    sentiment:
      label: "neutral"
      score: 0.5
      keywords: []
    topic:
      category: "购买咨询"
      tags: ["价格", "渠道"]
    purchase_intent:
      level: "strong"
      type: "asking"
    commercial_value:
      is_value_comment: true
      value_type: "需求咨询"
```

### comment_summary.md

```markdown
# 评论分析汇总报告

**笔记ID**: abc123
**分析时间**: 2026-04-09
**评论总数**: 100 条

---

## 量化分析

### 情感分布

| 情感 | 数量 | 占比 |
|------|------|------|
| 正面 | 68 | 68% |
| 中性 | 20 | 20% |
| 负面 | 12 | 12% |

### 话题分布

| 话题 | 数量 | 占比 |
|------|------|------|
| 产品体验 | 45 | 45% |
| 购买咨询 | 23 | 23% |
| 竞品对比 | 15 | 15% |
| 售后服务 | 12 | 12% |
| 其他 | 5 | 5% |

### 购买意向

| 意向等级 | 数量 | 占比 |
|----------|------|------|
| 强 | 34 | 34% |
| 中 | 28 | 28% |
| 弱 | 23 | 23% |
| 无 | 15 | 15% |

### 商业价值分类

| 类型 | 数量 | 占比 |
|------|------|------|
| 口碑推荐 | 45 | 45% |
| 需求咨询 | 23 | 23% |
| 痛点反馈 | 18 | 18% |
| 竞品对比 | 9 | 9% |
| 无价值 | 5 | 5% |

---

## 核心洞察

### 关键发现

1. **正面评价占主导**，用户对产品效果普遍满意
2. **购买意向明显**，约 34% 评论带有强购买信号
3. **主要痛点**：价格偏高、功能复杂是主要负面因素

### 营销建议

1. 强化"效果显著"的核心卖点宣传
2. 考虑推出性价比款降低购买门槛
3. 优化新手引导降低使用复杂度

---

*本报告由 AI 自动生成*
```

---

## LLM Prompt Template

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
  - comment_id: "评论的唯一ID"
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

---

## Error Handling

- **无 comments.yaml**：提示先执行 `xhs comment <url> --download`
- **评论为空**：生成空报告，提示无评论数据
