import { Formatter, extractOutputFields, OUTPUT_FIELDS, FIELD_LABELS } from './index';
import { NoteInfo } from '../../types';

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
