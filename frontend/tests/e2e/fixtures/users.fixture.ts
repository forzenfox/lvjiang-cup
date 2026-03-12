/**
 * 用户测试数据
 */

export interface User {
  username: string;
  password: string;
}

/**
 * 管理员账号
 * 对应 backend/src/config/app.config.ts 中的默认配置
 */
export const adminUser: User = {
  username: 'admin',
  password: 'admin123',
};

/**
 * 错误密码用户
 */
export const wrongPasswordUser: User = {
  username: 'admin',
  password: 'wrongpassword',
};

/**
 * 错误用户名用户
 */
export const wrongUsernameUser: User = {
  username: 'wronguser',
  password: 'admin123',
};

/**
 * 空用户名用户
 */
export const emptyUsernameUser: User = {
  username: '',
  password: 'admin123',
};

/**
 * 空密码用户
 */
export const emptyPasswordUser: User = {
  username: 'admin',
  password: '',
};
