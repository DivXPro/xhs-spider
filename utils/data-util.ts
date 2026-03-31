import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import http from 'http';
import { NoteInfo, UserInfo, CommentInfo } from '../types';

// Normalize string for filename
export function normStr(str: string): string {
  return str.replace(/[\\/:*?"<>| ]+/g, '').replace(/\n/g, '').replace(/\r/g, '');
}

// Normalize text (remove illegal XML characters)
export function normText(text: string | number | undefined | null): string {
  if (!text) return '';
  const str = String(text);
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// Convert timestamp to string
export function timestampToStr(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Handle note info from API response
export function handleNoteInfo(data: any): NoteInfo {
  const noteCard = data.note_card;
  const noteId = data.id || noteCard?.id;
  const noteUrl = data.url || '';

  const noteType = noteCard?.type === 'normal' ? '图集' : '视频';

  const userId = noteCard?.user?.user_id || '';
  const homeUrl = `https://www.xiaohongshu.com/user/profile/${userId}`;

  const imageList: string[] = [];
  if (noteCard?.image_list) {
    for (const image of noteCard.image_list) {
      try {
        imageList.push(image.info_list[1].url);
      } catch {
        // Ignore
      }
    }
  }

  let videoCover: string | null = null;
  let videoAddr: string | null = null;
  if (noteType === '视频') {
    videoCover = imageList[0] || null;
    const videoInfo = noteCard?.video || {};
    const streams = videoInfo?.media?.stream?.h264 || [];
    if (streams.length > 0) {
      videoAddr = streams[0].master_url || streams[0].url || null;
    }
    if (!videoAddr && videoInfo?.consumer?.origin_video_key) {
      videoAddr = `https://sns-video-bd.xhscdn.com/${videoInfo.consumer.origin_video_key}`;
    }
  }

  const tags: string[] = [];
  if (noteCard?.tag_list) {
    for (const tag of noteCard.tag_list) {
      try {
        tags.push(tag.name);
      } catch {
        // Ignore
      }
    }
  }

  const interactInfo = noteCard?.interact_info || {};
  const likedCount = interactInfo.liked_count || '0';
  const collectedCount = interactInfo.collected_count || '0';
  const commentCount = interactInfo.comment_count || '0';
  const shareCount = interactInfo.share_count || '0';

  return {
    note_id: noteId || '',
    note_url: noteUrl,
    note_type: noteType,
    user_id: userId,
    home_url: homeUrl,
    nickname: noteCard?.user?.nickname || '',
    avatar: noteCard?.user?.avatar || '',
    title: noteCard?.title?.trim() || '无标题',
    desc: noteCard?.desc || '',
    liked_count: String(likedCount),
    collected_count: String(collectedCount),
    comment_count: String(commentCount),
    share_count: String(shareCount),
    video_cover: videoCover,
    video_addr: videoAddr,
    image_list: imageList,
    tags,
    upload_time: timestampToStr(noteCard?.time || 0),
    ip_location: noteCard?.ip_location || '未知',
  };
}

// Handle user info from API response
export function handleUserInfo(data: any, userId: string): UserInfo {
  const basicInfo = data.basic_info || {};
  const interactions = data.interactions || [];

  const genderMap: Record<number, '男' | '女' | '未知'> = { 0: '男', 1: '女' };
  const gender = genderMap[basicInfo.gender] || '未知';

  const tags: string[] = [];
  if (data.tags) {
    for (const tag of data.tags) {
      try {
        tags.push(tag.name);
      } catch {
        // Ignore
      }
    }
  }

  return {
    user_id: userId,
    home_url: `https://www.xiaohongshu.com/user/profile/${userId}`,
    nickname: basicInfo.nickname || '',
    avatar: basicInfo.imageb || '',
    red_id: basicInfo.red_id || '',
    gender,
    ip_location: basicInfo.ip_location || '',
    desc: basicInfo.desc || '',
    follows: interactions[0]?.count || 0,
    fans: interactions[1]?.count || 0,
    interaction: interactions[2]?.count || 0,
    tags,
  };
}

// Handle comment info from API response
export function handleCommentInfo(data: any): CommentInfo {
  const pictures: string[] = [];
  if (data.pictures) {
    for (const picture of data.pictures) {
      try {
        pictures.push(picture.info_list[1].url);
      } catch {
        // Ignore
      }
    }
  }

  return {
    note_id: data.note_id || '',
    note_url: data.note_url || '',
    comment_id: data.id || '',
    user_id: data.user_info?.user_id || '',
    home_url: `https://www.xiaohongshu.com/user/profile/${data.user_info?.user_id || ''}`,
    nickname: data.user_info?.nickname || '',
    avatar: data.user_info?.image || '',
    content: data.content || '',
    show_tags: data.show_tags || [],
    like_count: data.like_count || 0,
    upload_time: timestampToStr(data.create_time || 0),
    ip_location: data.ip_location || '未知',
    pictures,
  };
}

// Check and create path
export function checkAndCreatePath(pathStr: string): void {
  if (!fs.existsSync(pathStr)) {
    fs.mkdirSync(pathStr, { recursive: true });
  }
}

// Save to JSON file
export function saveToJson<T>(datas: T[], filePath: string): void {
  fs.writeFileSync(filePath, JSON.stringify(datas, null, 2), 'utf-8');
  console.log(`数据保存至 ${filePath}`);
}

// Download file from URL
export async function downloadFile(
  url: string,
  filePath: string,
  isVideo: boolean = false
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      if (isVideo) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          file.write(buffer);
          file.close();
          resolve();
        });
      }
    });

    request.on('error', (err) => {
      file.close();
      reject(err);
    });

    file.on('error', (err) => {
      reject(err);
    });
  });
}

// Download media (image or video)
export async function downloadMedia(
  pathStr: string,
  name: string,
  url: string,
  type: 'image' | 'video'
): Promise<void> {
  const ext = type === 'image' ? '.jpg' : '.mp4';
  const filePath = path.join(pathStr, `${name}${ext}`);
  await downloadFile(url, filePath, type === 'video');
}

// Save note detail to txt file
export function saveNoteDetail(note: NoteInfo, pathStr: string): void {
  const filePath = path.join(pathStr, 'detail.txt');
  let content = `笔记id: ${note.note_id}\n`;
  content += `笔记url: ${note.note_url}\n`;
  content += `笔记类型: ${note.note_type}\n`;
  content += `用户id: ${note.user_id}\n`;
  content += `用户主页url: ${note.home_url}\n`;
  content += `昵称: ${note.nickname}\n`;
  content += `头像url: ${note.avatar}\n`;
  content += `标题: ${note.title}\n`;
  content += `描述: ${note.desc}\n`;
  content += `点赞数量: ${note.liked_count}\n`;
  content += `收藏数量: ${note.collected_count}\n`;
  content += `评论数量: ${note.comment_count}\n`;
  content += `分享数量: ${note.share_count}\n`;
  content += `视频封面url: ${note.video_cover || ''}\n`;
  content += `视频地址url: ${note.video_addr || ''}\n`;
  content += `图片地址url列表: ${JSON.stringify(note.image_list)}\n`;
  content += `标签: ${JSON.stringify(note.tags)}\n`;
  content += `上传时间: ${note.upload_time}\n`;
  content += `ip归属地: ${note.ip_location}\n`;

  fs.writeFileSync(filePath, content, 'utf-8');
}

// Download note with all media
export async function downloadNote(
  noteInfo: NoteInfo,
  pathStr: string,
  saveChoice: string
): Promise<string> {
  const noteId = noteInfo.note_id;
  const userId = noteInfo.user_id;
  const title = normStr(noteInfo.title).substring(0, 40);
  const nickname = normStr(noteInfo.nickname).substring(0, 20);

  if (!title) {
    // Use '无标题' if title is empty
  }

  const savePath = path.join(pathStr, `${nickname}_${userId}`, `${title}_${noteId}`);
  checkAndCreatePath(savePath);

  // Save info.json
  const infoJsonPath = path.join(savePath, 'info.json');
  fs.writeFileSync(infoJsonPath, JSON.stringify(noteInfo), 'utf-8');

  // Save detail.txt
  saveNoteDetail(noteInfo, savePath);

  // Download media
  if (noteInfo.note_type === '图集' && ['media', 'media-image', 'all'].includes(saveChoice)) {
    for (let i = 0; i < noteInfo.image_list.length; i++) {
      await downloadMedia(savePath, `image_${i}`, noteInfo.image_list[i], 'image');
    }
  } else if (noteInfo.note_type === '视频' && ['media', 'media-video', 'all'].includes(saveChoice)) {
    if (noteInfo.video_cover) {
      await downloadMedia(savePath, 'cover', noteInfo.video_cover, 'image');
    }
    if (noteInfo.video_addr) {
      await downloadMedia(savePath, 'video', noteInfo.video_addr, 'video');
    }
  }

  return savePath;
}
