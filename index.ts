#!/usr/bin/env node

import { Command } from 'commander';
import { XHSApis } from './apis/xhs-pc-apis';
import { XHSCreatorApis } from './apis/xhs-creator-apis';
import { init } from './utils/common-util';
import { handleNoteInfo, downloadNote } from './utils/data-util';
import { JsonFormatter } from './utils/formatters/json';
import { TableFormatter } from './utils/formatters/table';
import { CsvFormatter } from './utils/formatters/csv';
import { MdFormatter } from './utils/formatters/md';
import type { Formatter } from './utils/formatters';

const program = new Command();

program
  .name('xhs')
  .description('小红书数据采集CLI工具')
  .version('1.0.0')
  .option('-f, --format <format>', '输出格式: json(默认), table, csv, md', 'json');

const formatters: Record<string, Formatter> = {
  json: new JsonFormatter(),
  table: new TableFormatter(),
  csv: new CsvFormatter(),
  md: new MdFormatter(),
};

function getFormatter(format?: string): Formatter {
  return formatters[format || 'json'] || formatters.json;
}

// Initialize
const { cookiesStr, basePath } = init();
const xhsApis = new XHSApis();

// Note command
program
  .command('note')
  .description('获取单个笔记详情')
  .argument('<url>', '笔记URL')
  .option('-c, --cookies <cookies>', 'XHS cookies字符串')
  .option('--download', '是否下载笔记媒体文件')
  .option('-f, --format <format>', '输出格式: json, table, csv, md', 'json')
  .action(async (url: string, options: { cookies?: string; download?: boolean; format?: string }) => {
    const cookies = options.cookies || cookiesStr;
    if (!cookies) {
      console.error(JSON.stringify({ error: true, message: '未提供cookies' }));
      process.exit(1);
    }

    const result = await xhsApis.getNoteInfo(url, cookies);
    if (!result.success) {
      console.error(JSON.stringify({ error: true, message: `获取笔记失败: ${result.msg}` }));
      process.exit(1);
    }

    try {
      const noteData = result.data?.data?.items?.[0];
      if (!noteData) {
        console.error(JSON.stringify({ error: true, message: '笔记数据为空' }));
        process.exit(1);
      }

      noteData.url = url;
      const noteInfo = handleNoteInfo(noteData);

      if (options.download) {
        await downloadNote(noteInfo, basePath.media, 'all');
      }

      const noteList = [noteInfo];
      console.log(getFormatter(options.format).format(noteList));
    } catch (e: any) {
      console.error(JSON.stringify({ error: true, message: `处理笔记数据失败: ${e.message}` }));
      process.exit(1);
    }
  });

// User command
program
  .command('user')
  .description('获取用户的所有笔记')
  .argument('<url>', '用户URL')
  .option('-c, --cookies <cookies>', 'XHS cookies字符串')
  .option('-n, --num <number>', '获取笔记数量', '100')
  .option('--download', '是否下载笔记媒体文件')
  .option('-f, --format <format>', '输出格式: json, table, csv, md', 'json')
  .action(async (url: string, options: { cookies?: string; num?: string; download?: boolean; format?: string }) => {
    const cookies = options.cookies || cookiesStr;
    if (!cookies) {
      console.error(JSON.stringify({ error: true, message: '未提供cookies' }));
      process.exit(1);
    }

    const num = parseInt(options.num || '100', 10);

    // Get all notes metadata first
    const result = await xhsApis.getUserAllNotes(url, cookies);
    if (!result.success) {
      console.error(JSON.stringify({ error: true, message: `获取用户笔记失败: ${result.msg}` }));
      process.exit(1);
    }

    const noteList: any[] = [];
    const allNotes = (result.data || []).slice(0, num);

    for (const simpleNote of allNotes) {
      const noteUrl = `https://www.xiaohongshu.com/explore/${simpleNote.note_id}?xsec_token=${simpleNote.xsec_token}`;
      const noteResult = await xhsApis.getNoteInfo(noteUrl, cookies);
      if (noteResult.success) {
        try {
          const noteData = noteResult.data?.data?.items?.[0];
          if (noteData) {
            noteData.url = noteUrl;
            const noteInfo = handleNoteInfo(noteData);
            noteList.push(noteInfo);

            if (options.download) {
              await downloadNote(noteInfo, basePath.media, 'all');
            }
          }
        } catch (e: any) {
          console.error(`处理笔记 ${noteUrl} 失败: ${e.message}`);
        }
      }
    }

    console.log(getFormatter(options.format).format(noteList));
  });

// Search command
program
  .command('search')
  .description('搜索笔记')
  .argument('<query>', '搜索关键词')
  .option('-c, --cookies <cookies>', 'XHS cookies字符串')
  .option('-n, --num <number>', '搜索数量', '10')
  .option('--sort <0|1|2|3|4>', '排序方式: 0=综合排序, 1=最新, 2=最多点赞, 3=最多评论, 4=最多收藏', '0')
  .option('--type <0|1|2>', '笔记类型: 0=不限, 1=视频笔记, 2=普通笔记', '0')
  .option('--time <0|1|2|3>', '笔记时间: 0=不限, 1=一天内, 2=一周内, 3=半年内', '0')
  .option('--download', '是否下载笔记媒体文件')
  .option('-f, --format <format>', '输出格式: json, table, csv, md', 'json')
  .action(async (query: string, options: {
    cookies?: string;
    num?: string;
    sort?: string;
    type?: string;
    time?: string;
    download?: boolean;
    format?: string;
  }) => {
    const cookies = options.cookies || cookiesStr;
    if (!cookies) {
      console.error(JSON.stringify({ error: true, message: '未提供cookies' }));
      process.exit(1);
    }

    const num = parseInt(options.num || '10', 10);
    const sort = parseInt(options.sort || '0', 10);
    const noteType = parseInt(options.type || '0', 10);
    const noteTime = parseInt(options.time || '0', 10);

    // Search notes
    const searchResult = await xhsApis.searchSomeNote(
      query, num, cookies, sort, noteType, noteTime
    );
    if (!searchResult.success) {
      console.error(JSON.stringify({ error: true, message: `搜索失败: ${searchResult.msg}` }));
      process.exit(1);
    }

    // Filter only note types
    const notes = (searchResult.data || []).filter((n: any) => n.model_type === 'note');

    // Get full note info
    const noteList: any[] = [];

    for (const note of notes.slice(0, num)) {
      const noteUrl = `https://www.xiaohongshu.com/explore/${note.id}?xsec_token=${note.xsec_token}`;
      const noteResult = await xhsApis.getNoteInfo(noteUrl, cookies);
      if (noteResult.success) {
        try {
          const noteData = noteResult.data?.data?.items?.[0];
          if (noteData) {
            noteData.url = noteUrl;
            const noteInfo = handleNoteInfo(noteData);
            noteList.push(noteInfo);

            if (options.download) {
              await downloadNote(noteInfo, basePath.media, 'all');
            }
          }
        } catch (e: any) {
          console.error(`处理笔记 ${noteUrl} 失败: ${e.message}`);
        }
      }
    }

    console.log(getFormatter(options.format).format(noteList));
  });

// Creator command
program
  .command('creator')
  .description('获取创作者发布的笔记')
  .option('-c, --cookies <cookies>', 'XHS cookies字符串')
  .option('-f, --format <format>', '输出格式: json, table, csv, md', 'json')
  .action(async (options: { cookies?: string; format?: string }) => {
    const cookies = options.cookies || cookiesStr;
    if (!cookies) {
      console.error(JSON.stringify({ error: true, message: '未提供cookies' }));
      process.exit(1);
    }

    const creatorApis = new XHSCreatorApis();
    const result = await creatorApis.getAllPublishNoteInfo(cookies);

    if (!result.success) {
      console.error(JSON.stringify({ error: true, message: `获取创作者笔记失败: ${result.msg}` }));
      process.exit(1);
    }

    console.log(getFormatter(options.format).format((result.data || []) as any));
  });

program.parse();
