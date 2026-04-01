# xhs-spider

小红书（XHS）数据采集 CLI 工具，支持笔记详情获取、用户笔记采集、关键词搜索与媒体下载。

## 功能

- 获取单篇笔记详情：`note`
- 采集用户笔记列表：`user`
- 按关键词搜索笔记：`search`
- 获取创作者发布笔记：`creator`
- 多格式输出：`json` / `table` / `csv` / `md`
- 可选下载媒体文件：`--download`

## 安装

```bash
npm install -g xhs-spider
xhs --help
```

## 快速开始

```bash
export XHS_COOKIES="你的小红书cookies"
xhs note "https://www.xiaohongshu.com/explore/xxx"
```

## 常用命令

```bash
# 获取笔记详情
xhs note "https://www.xiaohongshu.com/explore/xxx"

# 搜索笔记
xhs search "美食" -n 20 -f table

# 获取用户笔记
xhs user "https://www.xiaohongshu.com/user/profile/xxx" -n 50

# 下载媒体文件
xhs note "https://www.xiaohongshu.com/explore/xxx" --download
```

## 参数说明

- 全局参数：
  - `-f, --format <format>` 输出格式：`json`（默认）/ `table` / `csv` / `md`
- `note` / `user` / `search`：
  - `-c, --cookies <cookies>` 自定义 cookies
  - `--download` 下载媒体文件
- `user`：
  - `-n, --num <number>` 获取数量（默认 `100`）
- `search`：
  - `-n, --num <number>` 搜索数量（默认 `10`）
  - `--sort <0|1|2|3|4>` 排序方式
  - `--type <0|1|2>` 笔记类型
  - `--time <0|1|2|3>` 时间范围

## Cookies 配置优先级

1. 命令行参数 `-c`
2. 环境变量 `XHS_COOKIES`
3. `.env` 文件中的 `XHS_COOKIES`

## 数据输出

- 默认通过标准输出（stdio）返回数据，不自动创建落盘目录
- 使用 `--download` 时，媒体文件保存到：
  - `datas/media_datas/{note_id}/`
- 目录内包含：
  - `info.json`
  - `detail.txt`
  - 图片文件（如 `image_0.jpg`）
  - 视频文件（如 `video.mp4`）
