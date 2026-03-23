import { useState } from 'react'
import { Upload, message } from 'antd'
import { InboxOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { smartUpload } from '@/utils/upload'

const { Dragger } = Upload

interface FileUploadProps {
  /** 受控：已上传文件 URL 列表 */
  value?: string[]
  /** 文件变更回调 */
  onChange?: (urls: string[]) => void
  /** 最大文件数，默认 5 */
  maxCount?: number
  /** 单文件大小限制（MB），默认 100 */
  maxSize?: number
  /** 文件类型限制，如 ".pdf,.docx,.zip" */
  accept?: string
  /** 分片阈值（MB），默认 5 */
  chunkThreshold?: number
  /** 是否禁用 */
  disabled?: boolean
}

function FileUpload({
  value = [],
  onChange,
  maxCount = 5,
  maxSize = 100,
  accept,
  chunkThreshold = 5,
  disabled = false,
}: FileUploadProps) {
  // 将受控的 url 列表转为 antd UploadFile 格式
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    value.map((url, i) => ({
      uid: `init-${i}`,
      name: url.split('/').pop() || `文件${i + 1}`,
      status: 'done' as const,
      url,
    })),
  )

  /** 同步 url 列表到外部 */
  function emitChange(list: UploadFile[]) {
    const urls = list
      .filter((f) => f.status === 'done' && f.url)
      .map((f) => f.url!)
    onChange?.(urls)
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // 大小校验
    if (file.size / 1024 / 1024 > maxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB`)
      return Upload.LIST_IGNORE
    }
    // 数量校验
    if (fileList.filter((f) => f.status !== 'error').length >= maxCount) {
      message.error(`最多上传 ${maxCount} 个文件`)
      return Upload.LIST_IGNORE
    }
    return true
  }

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onProgress, onSuccess, onError } = options
    const rawFile = file as File

    try {
      const fileUrl = await smartUpload(rawFile, {
        threshold: chunkThreshold * 1024 * 1024,
        onProgress: (percent) => {
          onProgress?.({ percent })
        },
      })

      onSuccess?.({ fileUrl })
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('上传失败'))
    }
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newList }) => {
    // 上传成功后把 fileUrl 写入 UploadFile
    const updated = newList.map((f) => {
      if (f.status === 'done' && f.response?.fileUrl && !f.url) {
        return { ...f, url: f.response.fileUrl }
      }
      return f
    })
    setFileList(updated)
    emitChange(updated)
  }

  const handleRemove = (file: UploadFile) => {
    const updated = fileList.filter((f) => f.uid !== file.uid)
    setFileList(updated)
    emitChange(updated)
  }

  return (
    <Dragger
      fileList={fileList}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onChange={handleChange}
      onRemove={handleRemove}
      accept={accept}
      multiple
      maxCount={maxCount}
      disabled={disabled}
      iconRender={() => <PaperClipOutlined />}
      showUploadList={{
        removeIcon: <DeleteOutlined />,
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
      <p className="ant-upload-hint">
        {accept ? `支持格式：${accept}` : '支持任意格式'}
        {` · 单文件最大 ${maxSize}MB · 最多 ${maxCount} 个`}
      </p>
    </Dragger>
  )
}

export default FileUpload
