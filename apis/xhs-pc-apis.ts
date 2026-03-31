import axios, { AxiosRequestConfig } from 'axios';
import { URL } from 'url';
import { generateRequestParams, generateX_b3_Traceid, spliceStr } from '../utils/xhs-util';
import {
  NoteInfo,
  NoteSearchItem,
  SimpleNoteInfo,
  UserInfo,
  NoteListResponse,
  SearchNotesResponse,
  SearchUsersResponse,
  CommentInfo,
} from '../types';

export interface ApiResult<T = any> {
  success: boolean;
  msg: string;
  data?: T;
}

function cookiesToHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

export class XHSApis {
  private baseUrl = 'https://edith.xiaohongshu.com';

  async getHomefeedAllChannel(
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const api = '/api/sns/web/v1/homefeed/category';
      const { headers, cookies } = generateRequestParams(cookiesStr, api, '', 'GET');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.get(this.baseUrl + api, { headers, ...this.getProxyConfig(proxies) });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async getHomefeedRecommend(
    category: string,
    cursorScore: string,
    refreshType: number,
    noteIndex: number,
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const api = '/api/sns/web/v1/homefeed';
      const data = {
        cursor_score: cursorScore,
        num: 20,
        refresh_type: refreshType,
        note_index: noteIndex,
        unread_begin_note_id: '',
        unread_end_note_id: '',
        unread_note_count: 0,
        category,
        search_key: '',
        need_num: 10,
        image_formats: ['jpg', 'webp', 'avif'],
        need_filter_image: false,
      };
      const { headers, cookies, data: transData } = generateRequestParams(cookiesStr, api, data, 'POST');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.post(this.baseUrl + api, JSON.parse(transData), {
        headers,
        ...this.getProxyConfig(proxies),
      });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async getHomefeedRecommendByNum(
    category: string,
    requireNum: number,
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult<NoteSearchItem[]>> {
    let cursorScore = '';
    let refreshType = 1;
    let noteIndex = 0;
    const noteList: NoteSearchItem[] = [];
    try {
      while (true) {
        const result = await this.getHomefeedRecommend(
          category, cursorScore, refreshType, noteIndex, cookiesStr, proxies
        );
        if (!result.success) {
          return { success: false, msg: result.msg };
        }
        if (!result.data?.data?.items) {
          break;
        }
        const notes = result.data.data.items;
        noteList.push(...notes);
        cursorScore = result.data.data.cursor_score;
        refreshType = 3;
        noteIndex += 20;
        if (noteList.length >= requireNum) {
          break;
        }
      }
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
    if (noteList.length > requireNum) {
      noteList.length = requireNum;
    }
    return { success: true, msg: '', data: noteList };
  }

  async getUserInfo(
    userId: string,
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const api = '/api/sns/web/v1/user/otherinfo';
      const params = { target_user_id: userId };
      const spliceApi = spliceStr(api, params);
      const { headers, cookies } = generateRequestParams(cookiesStr, spliceApi, '', 'GET');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.get(this.baseUrl + spliceApi, { headers, ...this.getProxyConfig(proxies) });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async getUserSelfInfo(
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const api = '/api/sns/web/v1/user/selfinfo';
      const { headers, cookies } = generateRequestParams(cookiesStr, api, '', 'GET');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.get(this.baseUrl + api, { headers, ...this.getProxyConfig(proxies) });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async getUserNoteInfo(
    userId: string,
    cursor: string,
    cookiesStr: string,
    xsecToken: string = '',
    xsecSource: string = '',
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const api = '/api/sns/web/v1/user_posted';
      const params = {
        num: '30',
        cursor,
        user_id: userId,
        image_formats: 'jpg,webp,avif',
        xsec_token: xsecToken,
        xsec_source: xsecSource,
      };
      const spliceApi = spliceStr(api, params);
      const { headers, cookies } = generateRequestParams(cookiesStr, spliceApi, '', 'GET');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.get(this.baseUrl + spliceApi, { headers, ...this.getProxyConfig(proxies) });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async getUserAllNotes(
    userUrl: string,
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult<SimpleNoteInfo[]>> {
    let cursor = '';
    const noteList: SimpleNoteInfo[] = [];
    try {
      const parsedUrl = new URL(userUrl);
      const pathParts = parsedUrl.pathname.split('/');
      const userId = pathParts[pathParts.length - 1];
      const kvDist: Record<string, string> = {};
      parsedUrl.searchParams.forEach((value, key) => {
        kvDist[key] = value;
      });
      const xsecToken = kvDist['xsec_token'] || '';
      const xsecSource = kvDist['xsec_source'] || 'pc_search';

      while (true) {
        const result = await this.getUserNoteInfo(userId, cursor, cookiesStr, xsecToken, xsecSource, proxies);
        if (!result.success) {
          return { success: false, msg: result.msg };
        }
        const notes = result.data?.data?.notes || [];
        if ('cursor' in (result.data?.data || {})) {
          cursor = String(result.data.data.cursor);
        } else {
          break;
        }
        noteList.push(...notes);
        if (notes.length === 0 || !result.data?.data?.has_more) {
          break;
        }
      }
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
    return { success: true, msg: '', data: noteList };
  }

  async getNoteInfo(
    url: string,
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      const noteId = pathParts[pathParts.length - 1];
      const kvDist: Record<string, string> = {};
      parsedUrl.searchParams.forEach((value, key) => {
        kvDist[key] = value;
      });

      const api = '/api/sns/web/v1/feed';
      const data = {
        source_note_id: noteId,
        image_formats: ['jpg', 'webp', 'avif'],
        extra: { need_body_topic: '1' },
        xsec_source: kvDist['xsec_source'] || 'pc_search',
        xsec_token: kvDist['xsec_token'],
      };
      const { headers, cookies, data: transData } = generateRequestParams(cookiesStr, api, data, 'POST');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.post(this.baseUrl + api, JSON.parse(transData), {
        headers,
        ...this.getProxyConfig(proxies),
      });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async searchNote(
    query: string,
    cookiesStr: string,
    page: number = 1,
    sortTypeChoice: number = 0,
    noteType: number = 0,
    noteTime: number = 0,
    noteRange: number = 0,
    posDistance: number = 0,
    geo: Record<string, any> | null = null,
    proxies?: Record<string, string>
  ): Promise<ApiResult> {
    try {
      const sortTypeMap: Record<number, string> = {
        0: 'general',
        1: 'time_descending',
        2: 'popularity_descending',
        3: 'comment_descending',
        4: 'collect_descending',
      };
      const filterNoteTypeMap: Record<number, string> = {
        0: '不限',
        1: '视频笔记',
        2: '普通笔记',
      };
      const filterNoteTimeMap: Record<number, string> = {
        0: '不限',
        1: '一天内',
        2: '一周内',
        3: '半年内',
      };
      const filterNoteRangeMap: Record<number, string> = {
        0: '不限',
        1: '已看过',
        2: '未看过',
        3: '已关注',
      };
      const filterPosDistanceMap: Record<number, string> = {
        0: '不限',
        1: '同城',
        2: '附近',
      };

      const api = '/api/sns/web/v1/search/notes';
      const data = {
        keyword: query,
        page,
        page_size: 20,
        search_id: generateX_b3_Traceid(21),
        sort: sortTypeMap[sortTypeChoice] || 'general',
        note_type: 0,
        ext_flags: [],
        filters: [
          { tags: [sortTypeMap[sortTypeChoice] || 'general'], type: 'sort_type' },
          { tags: [filterNoteTypeMap[noteType] || '不限'], type: 'filter_note_type' },
          { tags: [filterNoteTimeMap[noteTime] || '不限'], type: 'filter_note_time' },
          { tags: [filterNoteRangeMap[noteRange] || '不限'], type: 'filter_note_range' },
          { tags: [filterPosDistanceMap[posDistance] || '不限'], type: 'filter_pos_distance' },
        ],
        geo: geo ? JSON.stringify(geo) : '',
        image_formats: ['jpg', 'webp', 'avif'],
      };
      const { headers, cookies, data: transData } = generateRequestParams(cookiesStr, api, data, 'POST');
      headers['Cookie'] = cookiesToHeader(cookies);
      const response = await axios.post(this.baseUrl + api, JSON.parse(transData), {
        headers,
        ...this.getProxyConfig(proxies),
      });
      const resJson = response.data;
      return { success: resJson.success, msg: resJson.msg, data: resJson };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  }

  async searchSomeNote(
    query: string,
    requireNum: number,
    cookiesStr: string,
    sortTypeChoice: number = 0,
    noteType: number = 0,
    noteTime: number = 0,
    noteRange: number = 0,
    posDistance: number = 0,
    geo: Record<string, any> | null = null,
    proxies?: Record<string, string>
  ): Promise<ApiResult<NoteSearchItem[]>> {
    let page = 1;
    const noteList: NoteSearchItem[] = [];
    try {
      while (true) {
        const result = await this.searchNote(
          query, cookiesStr, page, sortTypeChoice, noteType, noteTime, noteRange, posDistance, geo, proxies
        );
        if (!result.success) {
          return { success: false, msg: result.msg };
        }
        if (!result.data?.data?.items) {
          break;
        }
        const notes = result.data.data.items;
        noteList.push(...notes);
        page++;

        if (noteList.length >= requireNum || !result.data.data.has_more) {
          break;
        }
      }
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
    if (noteList.length > requireNum) {
      noteList.length = requireNum;
    }
    return { success: true, msg: '', data: noteList };
  }

  async getNoteAllOutComment(
    url: string,
    cookiesStr: string,
    proxies?: Record<string, string>
  ): Promise<ApiResult<CommentInfo[]>> {
    const allComments: CommentInfo[] = [];
    let cursor = '';
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      const noteId = pathParts[pathParts.length - 1];
      const kvDist: Record<string, string> = {};
      parsedUrl.searchParams.forEach((value, key) => {
        kvDist[key] = value;
      });
      const xsecToken = kvDist['xsec_token'] || '';
      const xsecSource = kvDist['xsec_source'] || 'pc_user';

      while (true) {
        const api = '/api/sns/web/v2/comment/page';
        const params = {
          note_id: noteId,
          cursor,
          num: '30',
          xsec_token: xsecToken,
          xsec_source: xsecSource,
        };
        const spliceApi = spliceStr(api, params);
        const { headers, cookies } = generateRequestParams(cookiesStr, spliceApi, '', 'GET');
        headers['Cookie'] = cookiesToHeader(cookies);
        const response = await axios.get(this.baseUrl + spliceApi, { headers, ...this.getProxyConfig(proxies) });
        const resJson = response.data;

        if (!resJson.success) {
          return { success: false, msg: resJson.msg };
        }

        const comments = resJson.data?.comments || [];
        allComments.push(...comments);
        if (!resJson.data?.has_more || comments.length === 0) {
          break;
        }
        cursor = resJson.data.cursor;
      }
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
    return { success: true, msg: '', data: allComments };
  }

  private getProxyConfig(proxies?: Record<string, string>): AxiosRequestConfig {
    if (!proxies || Object.keys(proxies).length === 0) {
      return {};
    }
    return { proxy: proxies as any };
  }
}
