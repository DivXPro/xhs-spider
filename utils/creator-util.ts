import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { transCookies } from './cookie-util';

export function getCommonHeaders(): Record<string, string> {
  return {
    authority: 'edith.xiaohongshu.com',
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    origin: 'https://creator.xiaohongshu.com',
    referer: 'https://creator.xiaohongshu.com/',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
  };
}

function callPythonCreatorSigning(a1: string, api: string, data: string = ''): { xs: string; xt: string } {
  const projectRoot = path.join(__dirname, '..', '..');
  const tempScript = path.join(os.tmpdir(), `xhs_creator_sign_${Date.now()}.py`);

  const pythonCode = `
import sys
import json
import execjs
import os

os.chdir(r'${projectRoot.replace(/\\/g, '\\\\')}')

try:
    js = execjs.compile(open('static/xhs_creator_xs.js', 'r', encoding='utf-8').read())
except:
    js = execjs.compile(open('../static/xhs_creator_xs.js', 'r', encoding='utf-8').read())

a1 = sys.argv[1]
api = sys.argv[2]
data = sys.argv[3] if len(sys.argv) > 3 else ''

result = js.call('get_xs', api, data, a1)
print(json.dumps(result))
`;

  try {
    fs.writeFileSync(tempScript, pythonCode, 'utf-8');
    const result = execSync(`python "${tempScript}" "${a1}" "${api}" "${data}"`, {
      encoding: 'utf-8',
      timeout: 30000,
    });
    return JSON.parse(result.trim());
  } finally {
    try { fs.unlinkSync(tempScript); } catch {}
  }
}

export function generateCreatorXs(
  a1: string,
  api: string,
  data: string = ''
): { xs: string; xt: string } {
  return callPythonCreatorSigning(a1, api, data);
}

export function spliceStr(api: string, params: Record<string, string | number | null>): string {
  let url = api + '?';
  for (const [key, value] of Object.entries(params)) {
    url += `${key}=${value ?? ''}&`;
  }
  return url.slice(0, -1);
}
