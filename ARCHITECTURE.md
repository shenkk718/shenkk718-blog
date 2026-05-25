# 2025-blog-public 项目架构

## 概述

一个基于 **Next.js 16** 的个人博客系统，采用 App Router 架构，支持部署到 **Cloudflare Workers**。项目集成了博客、图片展示、项目展示、随笔、音乐等多个功能模块，具有高度可定制的首页卡片布局和主题系统。

---

## 技术栈

| 类别         | 技术                                        |
| ------------ | ------------------------------------------- |
| **框架**     | Next.js 16 (App Router, Turbopack)          |
| **语言**     | TypeScript 5                                |
| **UI 框架**  | React 19                                    |
| **样式**     | Tailwind CSS 4                              |
| **动画**     | Motion (Framer Motion)                      |
| **状态管理** | Zustand 5                                   |
| **数据请求** | SWR                                         |
| **Markdown** | Marked + Shiki (代码高亮) + KaTeX (数学公式) |
| **图标**     | Lucide React + 自定义 SVG (@svgr/webpack)   |
| **通知**     | Sonner                                      |
| **部署**     | Cloudflare Workers (OpenNext)               |
| **包管理**   | pnpm 11                                     |
| **代码格式** | Prettier + prettier-plugin-tailwindcss       |

---

## 目录结构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── (home)/                 # 首页（卡片布局）
│   │   ├── page.tsx            # 首页入口
│   │   ├── hi-card.tsx         # 个人介绍卡片（含轨道动画）
│   │   ├── art-card.tsx        # 艺术图片卡片
│   │   ├── aritcle-card.tsx    # 最新文章卡片（悬停展开）
│   │   ├── calendar-card.tsx   # 日历卡片
│   │   ├── clock-card.tsx      # 时钟卡片
│   │   ├── note-card.tsx       # 随笔卡片
│   │   ├── hat-card.tsx        # 装饰卡片
│   │   ├── share-card.tsx      # 分享卡片
│   │   ├── social-buttons.tsx  # 社交按钮
│   │   ├── home-dock.tsx       # 底部 Dock 栏
│   │   ├── home-draggable-layer.tsx  # 可拖拽卡片层
│   │   ├── config-dialog/      # 站点配置弹窗
│   │   ├── stores/             # Zustand 状态仓库
│   │   │   ├── config-store.ts # 站点配置 & 卡片样式
│   │   │   └── layout-edit-store.ts  # 布局编辑状态
│   │   └── services/           # 本地保存服务
│   │
│   ├── blog/                   # 博客模块
│   ├── write/                  # 博客写作/编辑器
│   ├── pictures/               # 图片展示
│   │   ├── page.tsx            # 图片页面主入口
│   │   ├── components/
│   │   │   ├── three-d-photo-carousel.tsx  # 3D 图片轮播
│   │   │   ├── memory-star-calendar.tsx    # 记忆星图日历
│   │   │   ├── picture-viewer.tsx          # 图片详情（含 Lens 透镜）
│   │   │   └── upload-dialog.tsx           # 图片上传弹窗
│   │   └── services/           # 图片本地保存服务
│   │
│   ├── projects/               # 项目展示
│   │   ├── page.tsx            # 项目页面
│   │   ├── components/         # 项目卡片、创建弹窗
│   │   └── services/           # 项目本地保存服务
│   │
│   ├── notes/                  # 随笔模块
│   ├── about/                  # 关于页面
│   ├── bloggers/               # 友链
│   ├── snippets/               # 代码片段
│   ├── share/                  # 分享功能
│   ├── music/                  # 音乐页面
│   ├── live2d/                 # Live2D 模型
│   ├── clock/                  # 时钟页面
│   ├── image-toolbox/          # 图片压缩工具
│   ├── api/                    # API 路由（本地保存）
│   │   ├── local-blog/         # 博客本地保存
│   │   ├── local-config/       # 站点配置本地保存
│   │   ├── local-notes/        # 随笔本地保存
│   │   ├── local-pictures/     # 图片本地保存
│   │   └── local-projects/     # 项目本地保存
│   │
│   ├── layout.tsx              # 根布局
│   └── sitemap.ts              # 站点地图生成
│
├── components/                 # 通用组件
│   ├── card.tsx                # 基础卡片组件
│   ├── dialog-modal.tsx        # 模态弹窗
│   ├── side-panel.tsx          # 侧滑面板
│   ├── lens.tsx                # 透镜放大组件
│   ├── hyper-text.tsx          # 文字动画组件
│   ├── nav-card.tsx            # 导航卡片
│   ├── music-card.tsx          # 音乐播放器
│   ├── like-button.tsx         # 点赞按钮
│   ├── blog-preview.tsx        # 博客预览
│   ├── blog-sidebar.tsx        # 博客侧栏
│   ├── blog-toc.tsx            # 博客目录
│   ├── code-block.tsx          # 代码块（Shiki）
│   ├── color-picker.tsx        # 颜色选择器
│   └── ...
│
├── config/                     # 静态配置
│   ├── site-content.json       # 站点内容配置
│   ├── card-styles.json        # 卡片布局样式
│   └── card-styles-default.json
│
├── hooks/                      # 自定义 Hooks
│   ├── use-auth.ts             # GitHub App 认证
│   ├── use-center.ts           # 视口中心计算
│   ├── use-blog-index.ts       # 博客索引
│   ├── use-markdown-render.tsx # Markdown 渲染
│   └── ...
│
├── layout/                     # 全局布局
│   ├── index.tsx               # 布局入口
│   ├── head.tsx                # HTML Head
│   ├── header.tsx              # 页头
│   ├── footer.tsx              # 页脚
│   └── backgrounds/            # 背景效果（粒子等）
│
├── lib/                        # 工具库
│   ├── github-client.ts        # GitHub API 封装
│   ├── markdown-renderer.ts    # Markdown 渲染器
│   ├── auth.ts                 # 认证工具
│   ├── file-utils.ts           # 文件处理
│   ├── color.ts                # 颜色工具
│   └── utils.ts                # 通用工具
│
├── styles/
│   └── globals.css             # 全局样式 + Tailwind
│
└── svgs/                       # SVG 图标资源
```

---

## 核心架构设计

### 1. 首页卡片系统

首页采用**可拖拽卡片布局**，每个卡片是独立组件，通过 `HomeDraggableLayer` 实现拖拽定位。卡片位置和样式存储在 `card-styles.json` 中，通过 `config-store`（Zustand）管理。

### 2. 本地保存机制

所有内容（博客、图片、项目、随笔、站点配置）均支持**本地保存**，通过 Next.js API Routes 将数据写入本地文件系统：

- 图片文件写入 `public/images/` 目录
- JSON 数据写入对应模块的 `list.json`
- 配置数据写入 `src/config/` 下的 JSON 文件

### 3. 主题系统

通过 `site-content.json` 的 `theme` 字段定义 CSS 变量（`--color-brand`、`--color-primary` 等），在 `layout.tsx` 中注入到 `<html>` 元素，实现全局主题可配置。

### 4. 部署

- **开发**：`pnpm dev`（Turbopack，端口 2025）
- **构建**：`pnpm build`（标准 Next.js 构建）
- **Cloudflare 部署**：通过 `@opennextjs/cloudflare` 适配，`pnpm deploy` 部署到 Cloudflare Workers

---

## 数据流

```
JSON 配置文件 (list.json / site-content.json)
        ↓ import
    页面组件 (useState 初始化)
        ↓ 用户编辑
    Zustand Store (运行时状态)
        ↓ 保存
    API Route (/api/local-*)
        ↓ 写入
    本地文件系统 (public/ & src/config/)
```
