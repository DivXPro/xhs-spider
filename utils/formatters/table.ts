import { Formatter, extractOutputFields, OUTPUT_FIELDS, FIELD_LABELS } from './index';
import { NoteInfo } from '../../types';

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
