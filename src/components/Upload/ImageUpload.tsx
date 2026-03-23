import { useState } from 'react'
import { Upload, message, Image } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { smartUpload } from '@/utils/upload'

interface ImageUploadProps {
  /** 受控：已上传图片 URL 列表 */
  value?: string[]
  /** 图片变更回调 */
  onChange?: (urls: string[]) => void
  /** 最大图片数，默认 5 */
  maxCount?: number
  /** 单图大小限制（MB），默认 10 */
  maxSize?: number
  /** 分片阈值（MB），默认 5 */
  chunkThreshold?: number
  /** 是否禁用 */
  disabled?: boolean
}

function ImageUpload({
  value = [],
  onChange,
  maxCount = 5,
  maxSize = 10,
  chunkThreshold = 5,
  disabled = false,
}: ImageUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    value.map((url, i) => ({
      uid: `init-${i}`,
      name: url.split('/').pop() || `图片${i + 1}`,
      status: 'done' as const,
      url,
      thumbUrl: url,
    })),
  )

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  /** 同步 url 列表到外部 */
  function emitChange(list: UploadFile[]) {
    const urls = list
      .filter((f) => f.status === 'done' && (f.url || f.thumbUrl))
      .map((f) => f.url || f.thumbUrl!)
    onChange?.(urls)
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // 类型校验
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件')
      return Upload.LIST_IGNORE
    }
    // 大小校验
    if (file.size / 1024 / 1024 > maxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB`)
      return Upload.LIST_IGNORE
    }
    // 数量校验
    if (fileList.filter((f) => f.status !== 'error').length >= maxCount) {
      message.error(`最多上传 ${maxCount} 张图片`)
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
    const updated = newList.map((f) => {
      if (f.status === 'done' && f.response?.fileUrl && !f.url) {
        return { ...f, url: f.response.fileUrl, thumbUrl: f.response.fileUrl }
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

  const handlePreview = (file: UploadFile) => {
    const url = file.url || file.thumbUrl
    if (url) {
      setPreviewUrl(url)
      setPreviewOpen(true)
    }
  }

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={handleChange}
        onRemove={handleRemove}
        onPreview={handlePreview}
        accept="image/*"
        multiple
        maxCount={maxCount}
        disabled={disabled}
        showUploadList={{
          previewIcon: <EyeOutlined />,
          removeIcon: <DeleteOutlined />,
        }}
      >
        {fileList.filter((f) => f.status !== 'error').length >= maxCount ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        )}
      </Upload>

      {previewOpen && (
        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            src: previewUrl,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
        />
      )}
    </>
  )
}

export default ImageUpload
