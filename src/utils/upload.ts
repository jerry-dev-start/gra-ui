// 此文件你可以理解是一个hooks，但是这个文件无需要状态之类的，
// 所以放到的utils里面
import SparkMD5 from 'spark-md5'
import {
  uploadFile,
  checkChunks,
  uploadChunk,
  mergeChunks,
} from '@/api/upload'

/** 默认分片大小：2MB */
const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024

/** 默认分片阈值：5MB，超过此大小走分片上传 */
const DEFAULT_THRESHOLD = 5 * 1024 * 1024

/** 默认并发数 */
const DEFAULT_CONCURRENCY = 3

export interface SmartUploadOptions {
  /** 进度回调 0~100 */
  onProgress?: (percent: number) => void
  /** 分片大小（字节），默认 2MB */
  chunkSize?: number
  /** 分片阈值（字节），默认 5MB */
  threshold?: number
  /** 并发上传数，默认 3 */
  concurrency?: number
}

/**
 * 智能上传：根据文件大小自动选择直传或分片上传
 * @returns 文件访问地址 fileUrl
 */
export async function smartUpload(
  file: File,
  options: SmartUploadOptions = {},
): Promise<string> {
  const {
    onProgress,
    chunkSize = DEFAULT_CHUNK_SIZE,
    threshold = DEFAULT_THRESHOLD,
    concurrency = DEFAULT_CONCURRENCY,
  } = options

  // 小文件直传
  if (file.size <= threshold) {
    const result = await uploadFile(file, onProgress)
    return result.fileUrl
  }

  // 大文件分片上传
  return chunkUpload(file, { onProgress, chunkSize, concurrency })
}

/** 计算文件 MD5（增量计算，不会一次性读入内存） */
async function calculateHash(file: File, chunkSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks = Math.ceil(file.size / chunkSize)
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    let current = 0

    function loadNext() {
      const start = current * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      reader.readAsArrayBuffer(file.slice(start, end))
    }

    reader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer)
      }
      current++
      if (current < chunks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))

    loadNext()
  })
}

/** 并发控制器：限制同时执行的 Promise 数量 */
async function concurrentRun<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0

  async function run() {
    while (index < tasks.length) {
      const i = index++
      results[i] = await tasks[i]()
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => run())
  await Promise.all(workers)
  return results
}

/** 分片上传核心流程 */
async function chunkUpload(
  file: File,
  options: {
    onProgress?: (percent: number) => void
    chunkSize: number
    concurrency: number
  },
): Promise<string> {
  const { onProgress, chunkSize, concurrency } = options
  const totalChunks = Math.ceil(file.size / chunkSize)

  // 1. 计算文件 hash
  onProgress?.(0)
  const hash = await calculateHash(file, chunkSize)

  // 2. 检查已上传分片（秒传 + 断点续传）
  const checkResult = await checkChunks(hash, file.name, totalChunks)

  // 秒传：文件已完整上传过
  if (checkResult.uploaded && checkResult.fileUrl) {
    onProgress?.(100)
    return checkResult.fileUrl
  }

  // 3. 构建待上传分片列表（跳过已上传的）
  const uploadedSet = new Set(checkResult.uploadedChunks)
  const chunkProgress: number[] = new Array(totalChunks).fill(0)

  // 已上传的分片进度标记为 100
  uploadedSet.forEach((i) => {
    chunkProgress[i] = 100
  })

  /** 汇总进度 */
  function reportProgress() {
    if (!onProgress) return
    const total = chunkProgress.reduce((sum, p) => sum + p, 0)
    // hash 计算占 5%，上传占 95%
    const percent = Math.min(5 + Math.round((total / (totalChunks * 100)) * 95), 99)
    onProgress(percent)
  }

  reportProgress()

  const tasks = Array.from({ length: totalChunks }, (_, i) => i)
    .filter((i) => !uploadedSet.has(i))
    .map((i) => () => {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      return uploadChunk(chunk, hash, i, totalChunks, (percent) => {
        chunkProgress[i] = percent
        reportProgress()
      })
    })

  // 4. 并发上传
  await concurrentRun(tasks, concurrency)

  // 5. 合并分片
  const mergeResult = await mergeChunks(hash, file.name, totalChunks)
  onProgress?.(100)

  return mergeResult.fileUrl
}
