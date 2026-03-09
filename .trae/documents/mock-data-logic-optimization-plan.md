# Mock数据逻辑优化计划

## 需求分析

### 当前问题
1. **清空按钮行为**：当前点击"清空所有数据"按钮会调用 `clearAllData()`，但页面刷新后由于 `loadFromStorage` 逻辑，如果 localStorage 为空会重新加载初始数据
2. **加载Mock数据行为**：当前 `resetAllData()` 会将数据重置为初始状态并保存到 localStorage

### 需求目标
1. **清空按钮**：点击后真正清空所有数据（teams、matches、streamInfo 设为空），页面显示空状态
2. **加载Mock数据**：点击后使用 `data.ts` 中的数据覆盖 localStorage 中的现有数据

## 实现方案

### 1. 修改 `src/mock/service.ts`

#### 1.1 修改 `clearAllData` 方法
- 清空 localStorage 中的数据
- 将内存中的数据设为空数组/空对象
- **关键**：修改 `loadFromStorage` 逻辑，添加一个标志位来判断是否是"清空"状态

#### 1.2 修改 `loadFromStorage` 逻辑
- 添加检查：如果数据被清空（有特定标志），则不加载初始数据
- 或者：修改初始化逻辑，区分"首次访问"和"清空后"

#### 1.3 修改 `resetAllData` 方法（加载Mock数据）
- 使用 `data.ts` 中的 `initialTeams`、`initialMatches`、`initialStreamInfo` 覆盖 localStorage
- 更新内存中的数据

### 2. 具体代码修改

#### 修改点1：添加清空状态标志
```typescript
const CLEAR_FLAG = 'data_cleared';
```

#### 修改点2：修改 `clearAllData` 方法
```typescript
clearAllData: async (): Promise<void> => {
  await delay(DELAY);
  localStorage.removeItem('teams');
  localStorage.removeItem('matches');
  localStorage.removeItem('streamInfo');
  // 设置清空标志
  localStorage.setItem(CLEAR_FLAG, 'true');
  teams = [];
  matches = [];
  streamInfo = {} as StreamInfo;
}
```

#### 修改点3：修改 `loadFromStorage` 函数
```typescript
const loadFromStorage = <T>(key: string, initialData: T): T => {
  // 如果数据被清空过，不使用初始数据
  if (localStorage.getItem(CLEAR_FLAG) === 'true') {
    const stored = localStorage.getItem(key);
    if (!stored) {
      // 返回空数组或空对象
      return Array.isArray(initialData) ? [] as T : {} as T;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return Array.isArray(initialData) ? [] as T : {} as T;
    }
  }
  
  // 原有逻辑
  const stored = localStorage.getItem(key);
  if (!stored) return initialData;
  // ...
};
```

#### 修改点4：修改 `resetAllData` 方法（加载Mock数据）
```typescript
resetAllData: async (): Promise<void> => {
  await delay(DELAY);
  // 移除清空标志
  localStorage.removeItem(CLEAR_FLAG);
  // 使用初始数据覆盖
  teams = [...initialTeams];
  matches = [...initialMatches];
  streamInfo = { ...initialStreamInfo };
  // 保存到 localStorage
  saveToStorage('teams', teams);
  saveToStorage('matches', matches);
  saveToStorage('streamInfo', streamInfo);
}
```

## 测试计划

### 测试用例1：清空数据
1. 页面加载（有初始数据）
2. 点击"清空所有数据"按钮
3. 确认清空
4. 页面刷新后显示空状态（无战队、无赛程）

### 测试用例2：加载Mock数据
1. 清空数据后的空状态页面
2. 点击"加载Mock数据"按钮
3. 确认加载
4. 页面显示 `data.ts` 中的初始数据

### 测试用例3：覆盖现有数据
1. 修改一些数据（如添加新战队）
2. 点击"加载Mock数据"按钮
3. 确认数据被 `data.ts` 中的初始数据覆盖

## 实施步骤

1. 修改 `src/mock/service.ts` 中的逻辑
2. 运行测试验证功能
3. 检查页面表现是否符合预期
