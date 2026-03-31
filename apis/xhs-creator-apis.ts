import axios from 'axios';
import { getCommonHeaders, generateCreatorXs, spliceStr } from '../utils/creator-util';
import { transCookies } from '../utils/cookie-util';

export interface ApiResult<T = any> {
  success: boolean;
  msg: string;
  data?: T;
}

export interface PublishNote {
  note_id: string;
  title: string;
  type: string;
  time: number;
  cover?: string;
  status?: string;
}

export class XHSCreatorApis {
  private baseUrl = 'https://edith.xiaohongshu.com';

  async getPublishNoteInfo(
    page: number,
    cookiesStr: string
  ): Promise<ApiResult> {
    try {
      const api = '/web_api/sns/v5/creator/note/user/posted';
      const params: Record<string, string> = { tab: '0' };
      if (page >= 0) {
        params['page'] = String(page);
      }
      const spliceApi = spliceStr(api, params);
      const headers = getCommonHeaders();
      const cookies = transCookies(cookiesStr);
      const { xs, xt } = generateCreatorXs(cookies['a1'], spliceApi, '');
      headers['x-s'] = xs;
      headers['x-t'] = String(xt);
      headers['Cookie'] = Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');

      const response = await axios.get(this.baseUrl + spliceApi, { headers });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async getAllPublishNoteInfo(cookiesStr: string): Promise<ApiResult<PublishNote[]>> {
    const notes: PublishNote[] = [];
    let page = 0;

    while (true) {
      const result = await this.getPublishNoteInfo(page, cookiesStr);
      if (!result.success) {
        return { success: false, msg: result.msg };
      }

      const dataNotes = result.data?.data?.notes || [];
      notes.push(...dataNotes);

      const nextPage = result.data?.data?.page;
      if (nextPage === -1 || dataNotes.length === 0) {
        break;
      }
      page = nextPage;
    }

    return { success: true, msg: '成功', data: notes };
  }
}
