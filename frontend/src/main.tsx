import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import './index.css'

const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL',
];

function validateEnvironmentVariables() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    const errorMsg = `缺少必需的环境变量: ${missingVars.join(', ')}\n\n请确保配置文件存在：\n  - 开发环境: .env.development\n  - 生产环境: .env.production`;
    
    console.error('❌', errorMsg);
    alert(errorMsg);
    throw new Error(errorMsg);
  }

  console.log('✅ 所有必需的环境变量已配置');
}

validateEnvironmentVariables();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
    </ErrorBoundary>
  </StrictMode>,
)
