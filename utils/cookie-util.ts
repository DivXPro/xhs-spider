import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Cookie string to dict conversion
export function transCookies(cookiesStr: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  const pairs = cookiesStr.includes('; ')
    ? cookiesStr.split('; ')
    : cookiesStr.split(';');

  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split('=');
    if (key) {
      cookies[key.trim()] = decodeURIComponent(valueParts.join('=').trim());
    }
  }
  return cookies;
}

// Generate random hex string
export function generateX_b3_Traceid(len: number = 16): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(16 * Math.random())];
  }
  return result;
}

// Call Node.js to execute JS signing script
function callNodeSigning(a1: string, api: string, data: string = '', method: string = 'POST'): { xs: string; xt: string; xs_common: string } {
  const xhsSpiderDir = __dirname;
  const staticPath = path.join(xhsSpiderDir, '..', '..', 'static');
  // 把临时脚本放在 xhs_spider 根目录，这样相对路径能正确解析
  const tempScript = path.join(xhsSpiderDir, '..', `temp_sign_${Date.now()}.js`);

  // 读取原始 JS 文件
  let jsCode = fs.readFileSync(path.join(staticPath, 'xhs_xs_xsc_56.js'), 'utf-8');

  // 移除测试代码
  jsCode = jsCode.replace(/console\.log\(window\.mnsv2\(f, c, d\)\);?/g, ';');
  jsCode = jsCode.replace(/if\s*\(require\.main\s*===\s*module\)\s*\{[\s\S]*?\}/m, '');
  // 替换 console 定义为空注释（避免 Node.js 中 console.log 被重定义）
  jsCode = jsCode.replace(/var console = \{[\s\S]*?\};/g, '// console redefined');

  const nodeCode = `
module.paths.unshift('${path.join(xhsSpiderDir, 'node_modules').replace(/\\/g, '\\\\')}');
${jsCode}
const result = get_request_headers_params('${api}', '${data}', '${a1}', '${method}');
console.log('SIGNATURE:' + JSON.stringify(result));
`;

  try {
    fs.writeFileSync(tempScript, nodeCode, 'utf-8');
    const stdout = execSync(`node "${tempScript}"`, {
      encoding: 'utf-8',
      cwd: xhsSpiderDir,
      timeout: 30000,
    });

    // 从 stdout 中提取签名结果
    const match = stdout.match(/SIGNATURE:(.+)/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('签名结果解析失败');
  } finally {
    try { fs.unlinkSync(tempScript); } catch {}
  }
}

// Call Node.js to execute xray traceId JS
function callNodeXrayTraceid(): string {
  const xhsSpiderDir = __dirname;
  const staticPath = path.join(xhsSpiderDir, '..', '..', 'static');
  // 把临时脚本放在 xhs_spider 根目录
  const tempScript = path.join(xhsSpiderDir, '..', `temp_xray_${Date.now()}.js`);

  const jsCode = fs.readFileSync(path.join(staticPath, 'xhs_xray.js'), 'utf-8');

  const nodeCode = `
module.paths.unshift('${path.join(xhsSpiderDir, 'node_modules').replace(/\\/g, '\\\\')}');
${jsCode}
console.log('TRACEID:' + traceId());
`;

  try {
    fs.writeFileSync(tempScript, nodeCode, 'utf-8');
    const stdout = execSync(`node "${tempScript}"`, {
      encoding: 'utf-8',
      cwd: xhsSpiderDir,
      timeout: 30000,
    });
    // 从 stdout 中提取 TRACEID
    const match = stdout.match(/TRACEID:(.+)/);
    if (match) {
      return match[1].trim();
    }
    throw new Error('traceId 解析失败');
  } catch (e: any) {
    console.error('Node xray error:', e.message);
    return generateX_b3_Traceid(16);
  } finally {
    try { fs.unlinkSync(tempScript); } catch {}
  }
}

export function generateXsXsCommon(
  a1: string,
  api: string,
  data: string = '',
  method: string = 'POST'
): { xs: string; xt: string; xs_common: string } {
  return callNodeSigning(a1, api, data, method);
}

export function generateXs(
  a1: string,
  api: string,
  data: string = ''
): { xs: string; xt: string } {
  const result = callNodeSigning(a1, api, data, 'POST');
  return {
    xs: result.xs,
    xt: result.xt,
  };
}

export function generateXrayTraceid(): string {
  return callNodeXrayTraceid();
}
