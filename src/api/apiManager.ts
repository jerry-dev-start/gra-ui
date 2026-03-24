import request from '@/utils/request'
import type { ApiManagerPageResult, ApiManagerQuery } from '@/types/api'

/** 获取 API 管理列表（分页） */
export function getApiManagerList(params: ApiManagerQuery) {
  return request.get<ApiManagerPageResult>('/apis', params as unknown as Record<string, unknown>)
}
