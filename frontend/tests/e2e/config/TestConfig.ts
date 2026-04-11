/**
 * 测试配置接口
 */
export interface TestConfig {
  admin: {
    username: string;
    password: string;
  };
  urls: {
    frontend: string;
    backend: string;
  };
  testOptions: {
    enableDataCleanup: boolean;
    headless: boolean;
  };
}

/**
 * 配置加载器
 * 从环境变量加载测试配置
 */
export class ConfigLoader {
  private static config: TestConfig | null = null;

  /**
   * 获取测试配置
   * 从环境变量读取，使用默认值作为后备
   */
  static getConfig(): TestConfig {
    if (this.config) {
      return this.config;
    }

    // 从环境变量读取配置
    this.config = {
      admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || '',
      },
      urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
        backend: process.env.BACKEND_URL || 'http://localhost:3000',
      },
      testOptions: {
        enableDataCleanup: process.env.ENABLE_DATA_CLEANUP !== 'false',
        headless: process.env.HEADLESS === 'true',
      },
    };

    // 验证必要配置
    this.validateConfig(this.config);

    return this.config;
  }

  /**
   * 验证配置
   */
  private static validateConfig(config: TestConfig): void {
    if (!config.admin.password) {
      throw new Error(
        '管理员密码未配置。请设置环境变量 ADMIN_PASSWORD\n' +
          '例如：ADMIN_PASSWORD=your_password npx playwright test'
      );
    }

    if (!config.admin.username) {
      throw new Error('管理员用户名未配置');
    }
  }

  /**
   * 重置配置（用于测试）
   */
  static resetConfig(): void {
    this.config = null;
  }
}

/**
 * 便捷函数：获取配置
 */
export function getTestConfig(): TestConfig {
  return ConfigLoader.getConfig();
}
