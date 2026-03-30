import {Upload, Image, type UploadProps} from "antd";
import React, {useEffect, useState} from "react";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import {smartUpload} from "@/utils/upload.ts";
import {updateUserAvatar} from "@/api/user.ts";
import {useUserStore} from "@/stores/user.ts";

// 定义组件属性接口
interface AvatarUploadProps {
    currentAvatar?: string; // 可选，因为初始可能没有头像
    onUpdateSuccess?: (newUrl: string) => void; // 必传，用于通知父组件更新
}
const chunkThreshold = 5
const AvatarUploader: React.FC<AvatarUploadProps> = ({currentAvatar}) =>{
    const {updateAvatar} = useUserStore()
    // 核心：内部维护一个头像状态，用于实现“即时预览/更新”
    const [localAvatar, setLocalAvatar] = useState<string | undefined>(import.meta.env.VITE_API_PRE  + currentAvatar);
    // 当外部 currentAvatar 改变时同步（例如页面重新加载后）
    useEffect(() => {
        if (currentAvatar) {
            setLocalAvatar(import.meta.env.VITE_API_PRE + currentAvatar);
        }
    }, [currentAvatar]);

    const customRequest: UploadProps['customRequest'] = async (options) => {
        setLoading(true)
        const { file, onProgress, onSuccess, onError } = options
        const rawFile = file as File

        try {
            const fileUrl = await smartUpload(rawFile, {
                threshold: chunkThreshold * 1024 * 1024,
                onProgress: (percent) => {
                    onProgress?.({ percent })
                },
            })

            //调用接口更新头像
            await updateUserAvatar({avatar: fileUrl}).then(()=>{
                setLocalAvatar(import.meta.env.VITE_API_PRE + fileUrl)
                updateAvatar(fileUrl)
                onSuccess?.({ fileUrl })
            }).catch((err)=>{
                onError?.(err instanceof Error ? err : new Error('上传失败'))
            })

        } catch (err) {
            onError?.(err instanceof Error ? err : new Error('上传失败'))
        } finally {
            setLoading(false)
        }
    }
    const [loading, setLoading] = useState<boolean>(false);
    return <div>
        <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={customRequest}
        >
            {localAvatar ? (
                <div className="relative w-full h-full group">
                    <Image
                        preview={false}
                        className="w-full h-full rounded-full transition-opacity group-hover:opacity-70"
                        src={localAvatar}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white bg-black/40 px-2 py-1 rounded text-xs">更换头像</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    {loading ? <LoadingOutlined className="text-blue-500 text-xl" /> : <PlusOutlined className="text-gray-400 text-xl" />}
                    <div className="mt-2 text-xs text-gray-500">{loading ? '上传中' : '上传头像'}</div>
                </div>
            )}
        </Upload>
    </div>
}

export default AvatarUploader