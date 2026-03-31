import { Formatter, extractOutputFields } from './index';
import { NoteInfo } from '../../types';

export class JsonFormatter implements Formatter {
  format(data: NoteInfo[]): string {
    const output = data.map(note => extractOutputFields(note));
    return JSON.stringify(output, null, 2);
  }
}