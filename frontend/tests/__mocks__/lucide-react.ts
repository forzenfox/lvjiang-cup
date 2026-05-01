// Mock for lucide-react - 动态返回图标组件
const MockIcon = () => null;

// 创建一个包含所有可能图标的对象
const icons: Record<string, () => null> = {};

// 导出一个函数来获取图标，避免需要列出所有图标
export default new Proxy(icons, {
  get(_target, prop) {
    if (prop === '__esModule') return true;
    return MockIcon;
  },
});

// 也导出默认的 MockIcon
export { MockIcon };
