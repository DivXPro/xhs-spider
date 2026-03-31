import { Formatter, extractOutputFields, OUTPUT_FIELDS, FIELD_LABELS } from './index';
import { NoteInfo } from '../../types';

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
