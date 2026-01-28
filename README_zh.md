# Obsidian-Hover-Annotations | [English Doc](README.md)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Language: TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg) ![Obsidian API](https://img.shields.io/badge/Obsidian-API-4B3CFA.svg) ![Build: esbuild](https://img.shields.io/badge/build-esbuild-FFCF00.svg)

✅ **选中即注 | 悬停即显 | 沉浸式阅读 | 纯文本存储**  
✅ **Markdown 富文本渲染 | 多彩批注系统 | 移动端支持**  
✅ **Obsidian 插件 | 跨平台 (桌面/移动) | 本地优先**  

这款插件名为 **Hover Annotations**（悬停批注）：在 Obsidian 中可以**插入后自动隐藏批注内容，鼠标悬停时立即展示批注内容**，同时保持 Markdown 文件的纯文本兼容与本地存储安全。

---

## 插件功能速览 (Features)

![Feature Overview](Presentation/v1.6.0/presentation.gif)

---

## 插件功能总结 (User Manual)

| 特性 | 描述 |
| :--- | :--- |
| **⚡ 选中即注** | 选中任意文本，通过命令快速添加批注信息。 |
| **🗨️ 悬浮查看** | 鼠标移到批注文本上，会自动浮现气泡显示批注内容（支持上浮动画与原生主题适配）。 |
| **👓 沉浸式编辑** | 在**编辑模式**下自动隐藏冗长的 HTML 标签，仅给文本加橙色下划线；光标移入时展开源码。 |
| **🎨 多彩批注** | 支持 **红、橙、黄、绿、青、蓝、紫、灰** 8 种颜色，提供可视化选择与右键预览。 |
| **📝 Markdown 支持** | 悬浮批注完美支持 **Markdown 表格**、粗体、斜体、链接、代码块等富文本格式。 |
| **📱 移动端支持** | 在手机/平板上点击批注文本即可弹出显示内容。 |
| **🚀 高效操作** | 支持为特定颜色设置快捷键；提供一键隐藏/显示所有批注样式命令。 |
| **🛡️ 数据安全** | 批注以标准 HTML `<span>` 标签存储，即使卸载插件也不会丢失数据。 |
| **🔧 自动修复** | 一键修复旧版遗留的 data-note 格式问题。 |

---

## 使用方法

<table>
<tr>
<td width="60%" valign="top">

### 第一步：添加批注

- **方法 A：使用快捷键（最快）**
    1. 在笔记中选中一段文字，按下 `Alt+c`（需在设置中自行绑定）。
    2. 在弹出的输入框中输入批注内容，按下回车或点击“确定”。
- **方法 B：使用右键菜单**
    1. 选中文本后，右键点击。
    2. 在菜单中选择 **“添加批注”**。
- **方法 C：使用命令面板**
    1. 选中文本后，按下 `Ctrl/Cmd + P` 打开命令面板。
    2. 输入 `Hover` 或 `Annotation` 搜索并执行 **“Hover Annotations: 添加批注（默认）”**。

### 第二步：查看批注
* 你会看到原文出现**橙色下划线**与浅色背景。
* 悬停鼠标即可看到刚才输入的批注内容。

### 第三步：修改/删除批注
* **修改**：点击高亮文本并右键，选择“编辑批注”，修改内容后确认。
* **删除**：点击高亮文本并右键，选择“删除批注”，批注与高亮都会移除。

</td>
<td width="40%" valign="top">
<br>
<img src="Presentation/v1.6.0/menu.png" alt="Context Menu" width="100%">
<br>
<img src="Presentation/v1.6.0/edit.png" alt="Edit Annotation" width="100%">
</td>
</tr>
</table>

---

## 📥 安装方法 (Installation)

### 方法 1：社区插件市场 (审核中)
目前插件已提交至官方商店，正处于审核阶段（预计需要 1 个月左右）。审核通过后，你将可以通过以下步骤安装：
1. 打开 Obsidian **设置** > **第三方插件 (Community plugins)**。
2. 关闭 **安全模式 (Restricted mode)**。
3. 点击 **浏览 (Browse)** 按钮，搜索 **"Hover Annotations"**。
4. 点击 **安装 (Install)** 并 **启用 (Enable)**。

### 方法 2：BRAT (推荐 - 可立即使用)
在插件上架商店前，推荐使用 BRAT 安装，这也是获取最新测试版功能的最佳方式。
1. 在社区插件市场搜索并安装 **BRAT** 插件。
2. 打开 BRAT 设置。
3. 点击 **"Add Better Obsidian plugin"**。
4. 输入 GitHub 仓库地址：`MaxMiksa/Obsidian-Simple-HTML-Annotation`。
5. 点击 **"Add Plugin"**。

### 方法 3：手动安装
1. 前往 GitHub [Releases](https://github.com/MaxMiksa/Obsidian-Simple-HTML-Annotation/releases) 页面下载最新版本的 `main.js`、`manifest.json` 和 `styles.css` 文件。
2. 打开你的 Obsidian 仓库文件夹，找到 `.obsidian/plugins/` 目录。
3. 新建一个文件夹，命名为 `hover-annotations`。
4. 将下载的文件放入该文件夹。
5. 重启 Obsidian 并在插件列表中启用。

---

<details>

<summary>🚀 未来改进路线图</summary>

- [x]  1. 交互体验升级 (UI/UX) (2025-11-20完成)
*   **右键菜单集成**：支持在选中文本后通过 `EditorMenu` 右键直接添加批注。

- [x] 2. 交互与安全优化 (2025-12-09完成)
*   **多行批注**：跨行选区的批注可正常隐藏/悬浮/右键编辑删除。
*   **输入体验**：Enter 直接提交批注，Shift+Enter 换行。
*   **气泡行为**：鼠标点击或任意键盘按键后自动隐藏气泡。

- [ ] 3. 侧边栏视图 (Sidebar View)
*   开发一个侧边栏面板，列出当前文档中**所有批注**。
*   点击侧边栏的某条批注，编辑器自动滚动跳转到对应位置（类似 Word 的审阅窗格）。

- [x] 4. 多彩批注 (2025-11-20完成)
*   允许用户在弹窗中选择不同的批注颜色（如：红色代表疑问，绿色代表想法，黄色代表待办）。
*   实现方式：在 HTML 中添加不同的 class，如 `class="ob-comment red"`。

- [x] 5. 图标模式 (2025-11-20完成)
*   在设置里增加一个开关：选择“下划线模式”还是“文末图标模式”。
*   图标模式下，使用 CSS `::after` 伪元素在文本后加一个 `📝` 符号，鼠标悬浮在图标上显示内容。

- [ ] 6. 导出与汇总 (暂搁置)
*   **批注汇总**：一键提取当前文档的所有批注，生成新的 Markdown 列表（包含：原文、批注内容、位置链接），便于整理读书笔记。

</details>

---

## 🤝 贡献与联系

欢迎提交 Issue 和 Pull Request！  
如有任何问题或建议，请联系 Zheyuan (Max) Kong (卡内基梅隆大学，宾夕法尼亚州)。

Zheyuan (Max) Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu
