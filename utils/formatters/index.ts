import type { NoteInfo } from '../../types';

/**
 * Formatter 接口
 */
export interface Formatter {
  format(data: NoteInfo[]): string;
}

/**
 * 字段映射
 */
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

/**
 * 字段标签
 */
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

/**
 * 输出字段列表
 */
export const OUTPUT_FIELDS = Object.keys(FIELD_KEYS);

/**
 * 格式化字段值
 * 处理 undefined/null/数组等边界情况
 */
export function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

/**
 * 从 NoteInfo 提取输出字段
 */
export function extractOutputFields(note: NoteInfo): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of OUTPUT_FIELDS) {
    const key = FIELD_KEYS[field];
    result[field] = formatFieldValue(note[key]);
  }
  return result;
}
