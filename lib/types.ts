export type Photo = {
  id: string;
  storage_path: string;
  image_url: string;
  thumbnail_url: string | null;
  uploader_name: string | null;
  caption: string | null;
  mime_type: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  is_video: boolean;
  approved: boolean;
  featured: boolean;
  likes_count: number;
  created_at: string;
};
