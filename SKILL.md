# SKILL.md

This file defines how Claude Code uses this tool as a Skill.

---

## Skill Metadata

**Name:** xhs-spider
**Type:** CLI Tool
**Language:** TypeScript/Node.js

---

## Triggers

Invoke this skill when:
- 用户请求获取小红书笔记数据
- 用户请求搜索小红书内容
- 用户请求采集小红书用户笔记
- 用户提到 xhs、小红书、数据采集、笔记爬虫

---

## Commands

```bash
xhs note <url>                     # 获取单个笔记详情
xhs user <url>                     # 获取用户所有笔记
xhs search <query>                  # 搜索笔记
xhs creator                          # 获取创作者笔记
```

### search 命令参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-n, --num <数量>` | 搜索数量 | 10 |
| `--sort <0-4>` | 排序方式：0=综合, 1=最新, 2=最多点赞, 3=最多评论, 4=最多收藏 | 0 |
| `--type <0-2>` | 笔记类型：0=不限, 1=视频笔记, 2=普通笔记 | 0 |
| `--time <0-3>` | 笔记时间：0=不限, 1=一天内, 2=一周内, 3=半年内 | 0 |

### user 命令参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-n, --num <数量>` | 获取笔记数量 | 100 |

### 全局参数

| 参数 | 说明 |
|------|------|
| `-c, --cookies <cookies>` | XHS cookies |
| `-f, --format <format>` | 输出格式：json/table/csv/md |
| `--download` | 下载笔记媒体文件 |

**全局参数：**
- `-c, --cookies <cookies>` — XHS cookies（必填）
- `-f, --format <format>` — 输出格式：json/table/csv/md
- `--download` — 下载笔记媒体文件

---

## Setup Requirements

1. Node.js 环境
2. 小红书 cookies（从浏览器获取）
3. 可选配置（优先级从高到低）：
   - 命令行 `-c` 参数
   - 环境变量 `XHS_COOKIES`
   - `.env` 文件中设置 `XHS_COOKIES=...`

---

## Usage Notes

- Cookies 是必需的，优先级：命令行 `-c` > 环境变量 `XHS_COOKIES` > `.env`
- 搜索结果默认返回 10 条，可通过 `-n` 参数调整
- 下载的媒体文件保存在 `datas/media_datas/` 目录
- 支持四种输出格式，默认 JSON

## Environment Variables

| 变量名 | 说明 |
|--------|------|
| `XHS_COOKIES` | 小红书 cookies（生产环境推荐） |

```bash
# 生产环境使用
export XHS_COOKIES="你的cookies"
xhs note "https://..."
```

---

## Examples

```bash
# 获取笔记详情
xhs note "https://www.xiaohongshu.com/explore/xxx"

# 搜索笔记（最新排序）
xhs search "榴莲" -n 20 --sort 1 -f table

# 搜索视频笔记（最多点赞）
xhs search "美食" -n 50 --type 1 --sort 2 -f csv

# 搜索一周内的笔记
xhs search "旅游" --time 2 -f md

# 获取用户笔记
xhs user "https://www.xiaohongshu.com/user/profile/xxx" -n 50

# 下载笔记媒体
xhs note "https://www.xiaohongshu.com/explore/xxx" --download
```
