import api from './api';

export async function uploadImage(
  file: File,
  folder = 'tableo/menu',
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const { data } = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
}

export async function deleteImage(publicId: string): Promise<void> {
  await api.delete('/uploads/image', { data: { publicId } });
}
