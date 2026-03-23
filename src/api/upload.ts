import axios from 'axios'
import type { ApiResponse } from '@/types/api'
import type { UploadResult, ChunkCheckResult, ChunkMergeResult } from '@/types/upload'
import { getToken } from '@/utils/auth'

/**
 * 上传专用 axios 实例
 * 独立于 request.ts，因为：
 * 1. 上传需要更长的 timeout
 * 2. 需要直接操作 FormData，不走 request 的统一拆包
 * 3. 需要 onUploadProgress 回调
 */
const uploadInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 300_000, // 5分钟，大文件上传需要更长时间
})

// 请求拦截：注入 token
uploadInstance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** 小文件直传 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await uploadInstance.post<ApiResponse<UploadResult>>(
    '/files/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    },
  )

  if (res.data.code !== 0) {
    throw new Error(res.data.message || '上传失败')
  }
  return res.data.data
}

/** 检查已上传的分片（秒传 + 断点续传） */
export async function checkChunks(
  hash: string,
  fileName: string,
  totalChunks: number,
): Promise<ChunkCheckResult> {
  const res = await uploadInstance.get<ApiResponse<ChunkCheckResult>>(
    '/files/chunk/check',
    { params: { hash, fileName, totalChunks } },
  )

  if (res.data.code !== 0) {
    throw new Error(res.data.message || '检查分片失败')
  }
  return res.data.data
}

/** 上传单个分片 */
export async function uploadChunk(
  chunk: Blob,
  hash: string,
  chunkIndex: number,
  totalChunks: number,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const formData = new FormData()
  formData.append('file', chunk)
  formData.append('hash', hash)
  formData.append('chunkIndex', String(chunkIndex))
  formData.append('totalChunks', String(totalChunks))

  const res = await uploadInstance.post<ApiResponse<null>>(
    '/files/chunk/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    },
  )

  if (res.data.code !== 0) {
    throw new Error(res.data.message || '分片上传失败')
  }
}

/** 合并分片 */
export async function mergeChunks(
  hash: string,
  fileName: string,
  totalChunks: number,
): Promise<ChunkMergeResult> {
  const res = await uploadInstance.post<ApiResponse<ChunkMergeResult>>(
    '/files/chunk/merge',
    { hash, fileName, totalChunks },
  )

  if (res.data.code !== 0) {
    throw new Error(res.data.message || '合并分片失败')
  }
  return res.data.data
}
