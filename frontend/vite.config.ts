import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // 生产环境移除 console 语句
    target: 'es2015',
  },
  esbuild: {
    logOverride: { 'duplicate-attribute': 'silent' },
    // 生产环境丢弃 console.log/debug 语句，保留 error/warn
    drop: ['console', 'debugger'],
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // 生产环境注入 config.js 脚本
    {
      name: 'inject-config-script',
      transformIndexHtml: {
        order: 'pre',
        handler: (html: string, ctx) => {
          // 只在生产环境构建时注入
          if (ctx?.bundle) {
            return html.replace(
              '</head>',
              '    <!-- 运行时配置文件 -->\n    <script src="/config.js"></script>\n  </head>'
            );
          }
          return html;
        }
      }
    }
  ],
})
