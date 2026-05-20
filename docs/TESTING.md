# 测试规范

## 测试策略

### BDD 测试（行为驱动开发）
- **位置**: `src/test/bdd/`
- **格式**: `.feature` + `.test.jsx`
- **用途**: 业务流程、用户场景、端到端行为
- **工具**: vitest-bdd + Gherkin

### TDD 测试（测试驱动开发）
- **位置**: `src/**/__tests__/`
- **格式**: `*.test.jsx` / `*.test.js`
- **用途**: 组件、hooks、工具函数单元测试
- **工具**: Vitest + Testing Library

## 目录结构

```
src/
├── components/
│   ├── __tests__/          # 组件单元测试
│   │   └── Button.test.jsx
│   └── Button.jsx
├── hooks/
│   ├── __tests__/          # Hooks 单元测试
│   │   └── useCart.test.jsx
│   └── useCart.jsx
├── utils/
│   ├── __tests__/          # 工具函数测试
│   │   └── api.test.js
│   └── api.js
└── test/
    └── bdd/                # BDD 场景测试
        ├── cart.feature
        └── cart.test.jsx
```

## 命名规范

### Feature 文件
- 文件名: `功能名.feature`
- 场景名: 清晰描述用户行为
- 步骤: Given/When/Then 格式

### 测试文件
- 单元测试: `组件名.test.jsx`
- BDD 测试: `功能名.test.jsx`

## 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test cart

# 查看覆盖率
npm test -- --coverage

# 监听模式
npm test -- --watch
```

## 测试覆盖目标

- 组件: 80%+
- Hooks: 90%+
- Utils: 95%+
- 业务流程: 核心场景 100%
