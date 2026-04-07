import 'axios'; // 必须保留这一行，确保原始类型被加载

declare module 'axios' {
    // 扩展 AxiosRequestConfig 接口
    export interface AxiosRequestConfig {
        /** 是否屏蔽全局错误提示，默认为 false */
        noGlobalMessage?: boolean;
    }

    // 扩展拦截器中使用的内部配置对象（针对新版 Axios）
    export interface InternalAxiosRequestConfig {
        noGlobalMessage?: boolean;
    }
}
