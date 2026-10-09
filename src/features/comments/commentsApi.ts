import { apiClient } from '../../api/client';
import type { CommentsResponse, Comment, AddCommentPayload } from './comments.types';

export const getComments = async (params?: { limit?: number; skip?: number }): Promise<CommentsResponse> => {
  const response = await apiClient.get<CommentsResponse>('/comments', { params });
  return response.data;
};

export const addComment = async (data: AddCommentPayload): Promise<Comment> => {
  const response = await apiClient.post<Comment>('/comments/add', data);
  return response.data;
};

export const updateComment = async (id: number, body: string): Promise<Comment> => {
  const response = await apiClient.put<Comment>(`/comments/${id}`, { body });
  return response.data;
};

export const deleteComment = async (id: number): Promise<Comment & { isDeleted: boolean; deletedOn: string }> => {
  const response = await apiClient.delete(`/comments/${id}`);
  return response.data;
};
