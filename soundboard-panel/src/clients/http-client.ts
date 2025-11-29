// api/soundsClient.ts
import axios from 'axios';

export interface Sound {
  id: number;
  title: string;
  author: string;
  category: string;
  filename: string;
}

export interface CreateSoundInput {
  title: string;
  author: string;
  category: string;
  file: File;
}

export interface UpdateSoundInput {
  title?: string;
  author?: string;
  category?: string;
  file?: File | null;
}

const api = axios.create({
  baseURL: '/api', // adjust this to match your server prefix
});

// CREATE
export async function createSound(data: CreateSoundInput): Promise<Sound> {
  const form = new FormData();
  form.append('title', data.title);
  form.append('author', data.author);
  form.append('category', data.category);
  form.append('file', data.file);

  const res = await api.post<Sound>('/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// UPDATE
export async function updateSound(id: number, data: UpdateSoundInput): Promise<Sound> {
  const form = new FormData();
  if (data.title !== undefined) form.append('title', data.title);
  if (data.author !== undefined) form.append('author', data.author);
  if (data.category !== undefined) form.append('category', data.category);
  if (data.file) form.append('file', data.file);

  const res = await api.put<Sound>(`/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// DELETE
export async function deleteSound(id: number): Promise<void> {
  await api.delete(`/${id}`);
}

// GET ALL
export async function getAllSounds(): Promise<Sound[]> {
  const res = await api.get<Sound[]>('/');
  return res.data;
}

// GET SOUND FILE (returns Blob)
export function getSoundURL(filename: string) {
  return `${api.getUri()}/file/${filename}`
}
