export interface User {
  /** * 用户唯一标识 (雪花算法 ID)
   * 注意：后端 uint64 传到前端建议使用 string 接收，避免精度丢失
   */
  id?: string; 
  
  /** 用户名 */
  username: string;
  
  /** 昵称 */
  nickname?: string;
  
  /** 头像地址 */
  avatar?: string;
  
  /** 邮箱 */
  email?: string;
  
  /** 手机号 */
  phoneNumber?: string;
}