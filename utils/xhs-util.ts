import {
  generateXsXsCommon,
  generateXrayTraceid,
  generateX_b3_Traceid,
  transCookies,
} from './cookie-util';

export { generateX_b3_Traceid };

export interface RequestHeaders {
  [key: string]: string;
  authority: string;
  accept: string;
  'accept-language': string;
  'cache-control': string;
  'content-type': string;
  origin: string;
  pragma: string;
  referer: string;
  'sec-ch-ua': string;
  'sec-ch-ua-mobile': string;
  'sec-ch-ua-platform': string;
  'sec-fetch-dest': string;
  'sec-fetch-mode': string;
  'sec-fetch-site': string;
  'user-agent': string;
  'x-b3-traceid': string;
  'x-mns': string;
  'x-s': string;
  'x-s-common': string;
  'x-t': string;
  'x-xray-traceid': string;
}

export function getCommonHeaders(): Record<string, string> {
  return {
    authority: 'www.xiaohongshu.com',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    referer: 'https://www.xiaohongshu.com/',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };
}

export function getRequestHeadersTemplate(): RequestHeaders {
  return {
    authority: 'edith.xiaohongshu.com',
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'cache-control': 'no-cache',
    'content-type': 'application/json;charset=UTF-8',
    origin: 'https://www.xiaohongshu.com',
    pragma: 'no-cache',
    referer: 'https://www.xiaohongshu.com/',
    'sec-ch-ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
    'x-b3-traceid': '',
    'x-mns': 'unload',
    'x-s': '',
    'x-s-common': '',
    'x-t': '',
    'x-xray-traceid': '',
  };
}

export function generateHeaders(
  a1: string,
  api: string,
  data: string = '',
  method: string = 'POST'
): { headers: RequestHeaders; data: string } {
  const { xs, xt, xs_common } = generateXsXsCommon(a1, api, data, method);
  const x_b3_traceid = generateX_b3_Traceid();
  const x_xray_traceid = generateXrayTraceid();

  const headers = getRequestHeadersTemplate();
  headers['x-s'] = xs;
  headers['x-t'] = String(xt);
  headers['x-s-common'] = xs_common;
  headers['x-b3-traceid'] = x_b3_traceid;
  headers['x-xray-traceid'] = x_xray_traceid;

  return { headers, data };
}

export function generateRequestParams(
  cookiesStr: string,
  api: string,
  data: object | string = '',
  method: string = 'POST'
): { headers: RequestHeaders; cookies: Record<string, string>; data: string } {
  const cookies = transCookies(cookiesStr);
  const a1 = cookies['a1'];

  let dataStr = '';
  if (data) {
    dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  }

  const { headers, data: _data } = generateHeaders(a1, api, dataStr, method);
  return { headers, cookies, data: _data };
}

export function spliceStr(api: string, params: Record<string, string | number | null>): string {
  let url = api + '?';
  for (const [key, value] of Object.entries(params)) {
    url += `${key}=${value ?? ''}&`;
  }
  return url.slice(0, -1);
}
