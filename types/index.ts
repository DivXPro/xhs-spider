// Note types
export interface NoteInfo {
  note_id: string;
  note_url: string;
  note_type: '图集' | '视频';
  user_id: string;
  home_url: string;
  nickname: string;
  avatar: string;
  title: string;
  desc: string;
  liked_count: string;
  collected_count: string;
  comment_count: string;
  share_count: string;
  video_cover: string | null;
  video_addr: string | null;
  image_list: string[];
  tags: string[];
  upload_time: string;
  ip_location: string;
}

export interface NoteSearchItem {
  id: string;
  xsec_token: string;
  model_type: string;
  type?: string;
  note_card?: {
    id: string;
    type: string;
    user: {
      user_id: string;
      nickname: string;
      avatar: string;
    };
    title: string;
    desc: string;
    interact_info: {
      liked_count: string;
      collected_count: string;
      comment_count: string;
      share_count: string;
    };
    image_list: Array<{
      info_list: Array<{ url: string }>;
    }>;
    video?: {
      media: {
        stream: {
          h264: Array<{ master_url: string; url: string }>;
        };
      };
      consumer?: {
        origin_video_key: string;
      };
    };
    tag_list: Array<{ name: string }>;
    time: number;
    ip_location?: string;
  };
}

export interface SimpleNoteInfo {
  note_id: string;
  xsec_token: string;
  model_type?: string;
}

// User types
export interface UserInfo {
  user_id: string;
  home_url: string;
  nickname: string;
  avatar: string;
  red_id: string;
  gender: '男' | '女' | '未知';
  ip_location: string;
  desc: string;
  follows: number;
  fans: number;
  interaction: number;
  tags: string[];
}

export interface UserSearchItem {
  user_id: string;
  nickname: string;
  avatar: string;
  red_id: string;
  desc: string;
  fans: number;
  interaction: number;
}

// Comment types
export interface CommentInfo {
  note_id: string;
  note_url: string;
  comment_id: string;
  user_id: string;
  home_url: string;
  nickname: string;
  avatar: string;
  content: string;
  show_tags: string[];
  like_count: number;
  upload_time: string;
  ip_location: string;
  pictures: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  msg: string;
  data?: T;
  code?: number;
}

export interface NoteDetailResponse {
  items: NoteSearchItem[];
  has_more: boolean;
}

export interface NoteListResponse {
  items: NoteSearchItem[];
  has_more: boolean;
  cursor?: string;
}

export interface UserNotesResponse {
  notes: NoteSearchItem[];
  has_more: boolean;
  cursor?: string;
}

export interface SearchNotesResponse {
  items: NoteSearchItem[];
  has_more: boolean;
}

export interface SearchUsersResponse {
  users: UserSearchItem[];
  has_more: boolean;
}

export interface CommentsResponse {
  comments: CommentInfo[];
  has_more: boolean;
  cursor?: string;
}

// Creator types
export interface PublishNote {
  note_id: string;
  title: string;
  type: string;
  time: number;
  cover?: string;
  status?: string;
}

// Configuration types
export interface BasePath {
  media: string;
  excel: string;
  json: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// CLI types
export interface SearchOptions {
  query: string;
  num: number;
  sort: 0 | 1 | 2 | 3 | 4;
  noteType: 0 | 1 | 2;
  noteTime: 0 | 1 | 2 | 3;
  noteRange: 0 | 1 | 2 | 3;
  posDistance: 0 | 1 | 2;
  geo?: GeoLocation;
  download: boolean;
}

export type SaveChoice = 'all' | 'media' | 'media-video' | 'media-image' | 'json' | 'excel';
