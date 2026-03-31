import * as fs from 'fs';
import * as path from 'path';
import { BasePath } from '../types';

// Load environment from .env file and environment variables
export function loadEnv(): { cookies: string | undefined } {
  // 1. 环境变量（最高优先级，用于生产环境）
  if (process.env.XHS_COOKIES) {
    return { cookies: process.env.XHS_COOKIES };
  }

  // 2. 当前目录的 .env 文件
  const envPath = path.join(process.cwd(), '.env');
  // 3. 父目录的 .env 文件
  const altEnvPath = path.join(process.cwd(), '..', '.env');

  let envContent = '';
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    } else if (fs.existsSync(altEnvPath)) {
      envContent = fs.readFileSync(altEnvPath, 'utf-8');
    }
  } catch (e) {
    // Ignore errors
  }

  const cookiesMatch = envContent.match(/XHS_COOKIES=(.+)/);
  return {
    cookies: cookiesMatch ? cookiesMatch[1].trim() : undefined,
  };
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录 ${dirPath}`);
  }
}

export function init(): { cookiesStr: string | undefined; basePath: BasePath } {
  const rootDir = path.join(__dirname, '..', '..', 'datas');
  const mediaBasePath = path.join(rootDir, 'media_datas');
  const excelBasePath = path.join(rootDir, 'excel_datas');
  const jsonBasePath = path.join(rootDir, 'json_datas');

  ensureDir(mediaBasePath);
  ensureDir(excelBasePath);
  ensureDir(jsonBasePath);

  const { cookies } = loadEnv();

  const basePath: BasePath = {
    media: mediaBasePath,
    excel: excelBasePath,
    json: jsonBasePath,
  };

  return {
    cookiesStr: cookies,
    basePath,
  };
}
