# Obsidian-Simple-HTML-Annotation | [English Doc](README.md)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Language: TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg) ![Obsidian API](https://img.shields.io/badge/Obsidian-API-4B3CFA.svg) ![Build: esbuild](https://img.shields.io/badge/build-esbuild-FFCF00.svg)

这款插件名为 **Simple HTML Annotation**（极简 HTML 批注）：在 Obsidian 中可以**插入后自动隐藏批注内容，鼠标悬停时立即展示批注内容**，同时保持 Markdown 文件的纯文本兼容与本地存储安全。

The plugin is called Simple HTML Annotation: It allows you to **automatically hide annotation content after insertion and instantly display it upon mouse hover within Obsidian** while keeping plain-text compatibility and safe local storage.

---

### 插件功能速览 (Features)

![插件使用说明 v1 1 0 gif](https://github.com/user-attachments/assets/0e3bd7f0-c70a-48db-b2d7-f6a814c9a396)

---

### 插件功能总结 (User Manual)

*   **选中即注**：选中任意文本，通过命令快速添加批注信息。
*   **悬浮查看**：鼠标移到批注文本上，会自动浮现黑色气泡显示批注内容。
*   **沉浸式编辑 (Live Preview)**：
    *   在**编辑模式**下自动隐藏冗长的 HTML 标签（`<span...>`），仅给文本加橙色下划线，界面更简洁。
    *   只有当光标移入批注文本内部时，源码才会展开，方便修改。
*   **阅读模式支持**：在阅读视图同样支持悬浮显示批注。
*   **数据安全**：批注以标准 HTML `<span>` 标签存储在文件中，即使卸载插件也不会丢失。
*   **批注修复能力**：新增 `normalizeAnnotationsInText`，以及两条命令（“修复当前文件的批注 data-note”“修复所有 Markdown 文件的批注 data-note”），可一键把旧版遗留的原始换行/特殊字符重编码为安全格式，避免 data-note 换行导致 Obsidian 的 Markdown 解析挂掉。
*   **多彩批注**：在批注弹窗选择红/绿/黄等颜色，插入的 HTML 会带上 `class="ob-comment red"` 之类的 class，对应不同的高亮语义。

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/db8f682d-3e7f-45b8-bcd2-5ff41665edbc" />

*示例 1 - 插入批注（推荐快捷键 `Alt+c`）*  

<img width="600" height="300" alt="image" src="https://github.com/user-attachments/assets/a4b9e833-7430-4160-b287-1424aa46a3a5" />

*示例 2 - 插入批注后将自动高亮对应文本*  

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/22a82896-4349-427f-9ded-341caf2607f8" />

*示例 3 - 显示批注内容（鼠标悬停时自动弹出批注内容）*  

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/82bd523b-1a2e-46dd-b8aa-52acb08190b9" />

*示例 4 - 批注以 HTML 永久安全储存在文件中（卸载插件后批注仍将保留）*  

---

### 使用方法

**第一步：添加批注**
1.  在笔记中选中一段文字（例如：“量子力学”），使用快捷键 Alt+c（使用前需自行设置）。
2.  在弹出的输入框中写下批注（例如：“这里需要进一步查证资料”），回车或点击“确定”。

如果不想用快捷键，可以使用命令面板：
1.  选中文本，按下命令面板快捷键（通常是 `Ctrl/Cmd + P`）。
2.  输入 `HTML` 或 `Annotation` 搜索，找到命令 **“Simple HTML Annotation: 添加批注 (HTML)”** 并回车。
3.  在弹出的输入框中写下批注，回车或点击“确定”。

**第二步：查看批注**
*   你会看到原文出现**橙色下划线**与浅色背景。
*   悬停鼠标即可看到刚才输入的批注内容。

**第三步：修改/删除批注**
*   **修改**：点击高亮文本并右键，选择“编辑批注”，修改内容后确认。
*   **删除**：点击高亮文本并右键，选择“删除批注”，批注与高亮都会移除。

---

### 未来改进路线图

- [x]  1. 交互体验升级 (UI/UX) (2025-11-20完成)
*   **右键菜单集成**：支持在选中文本后通过 `EditorMenu` 右键直接添加批注。

- [x] 2. 交互与安全优化 (2025-12-09完成)
*   **多行批注**：跨行选区的批注可正常隐藏/悬浮/右键编辑删除。
*   **输入体验**：Enter 直接提交批注，Shift+Enter 换行。
*   **气泡行为**：鼠标点击或任意键盘按键后自动隐藏气泡。

- [ ] 3. 侧边栏视图 (Sidebar View)
*   开发一个侧边栏面板，列出当前文档中**所有批注**。
*   点击侧边栏的某条批注，编辑器自动滚动跳转到对应位置（类似 Word 的审阅窗格）。

- [x] 4. 多彩批注
*   允许用户在弹窗中选择不同的批注颜色（如：红色代表疑问，绿色代表想法，黄色代表待办）。
*   实现方式：在 HTML 中添加不同的 class，如 `class=\"ob-comment red\"`。

- [ ] 5. 图标模式
*   在设置里增加一个开关：选择“下划线模式”还是“文末图标模式”。
*   图标模式下，使用 CSS `::after` 伪元素在文本后加一个 `📝` 符号，鼠标悬浮在图标上显示内容。

- [ ] 6. 导出与汇总 (暂搁置)
*   **批注汇总**：一键提取当前文档的所有批注，生成新的 Markdown 列表（包含：原文、批注内容、位置链接），便于整理读书笔记。

---

### 联系方式

Any questions or suggestions？Please contact Max Kong (Carnegie Mellon University, Pittsburgh, PA).

如有任何问题或建议，请联系 Max Kong (卡内基梅隆大学，宾夕法尼亚州匹兹堡)。

Max Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu