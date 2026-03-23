/** 文件直传响应 */
export interface UploadResult {
  /** 文件访问地址 */
  fileUrl: string
  /** 文件名 */
  fileName: string
}

/** 分片检查响应 */
export interface ChunkCheckResult {
  /** 是否已全部上传（秒传） */
  uploaded: boolean
  /** 已上传的分片索引列表 */
  uploadedChunks: number[]
  /** 若已秒传，返回文件地址 */
  fileUrl?: string
}

/** 分片合并响应 */
export interface ChunkMergeResult {
  /** 文件访问地址 */
  fileUrl: string
  /** 文件名 */
  fileName: string
}
