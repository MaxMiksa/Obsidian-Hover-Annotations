# Obsidian-Simple-HTML-Annotation V1.1.0

这款插件名为 **Simple HTML Annotation**（极简 HTML 批注）： 在Obsidian 中实现**插入后自动隐藏批注内容、鼠标悬停时立即展示批注内容**，同时保持 Markdown 文件的纯文本兼容性及本地保存的安全性。

The plugin is called Simple HTML Annotation: It allows you to **automatically hide annotation content after insertion and instantly display it upon mouse hover within Obsidian**. At the same time, it maintains the plain text compatibility and local storage security of Markdown files.

---
### ✨ 插件功能速览 (Features)

![插件使用说明](https://github.com/user-attachments/assets/05ab4eae-33ad-4687-b9d0-49426c792ee1)

---

### 📝 插件功能总结 (User Manual)

*   **选中即注**：选中任意文本，通过命令快速添加备注信息。
*   **悬浮查看**：鼠标移动到被批注的文本上，会自动浮现一个黑色气泡（Tooltip）显示批注内容。
*   **沉浸式编辑 (Live Preview)**：
    *   在**编辑模式**下，插件会自动隐藏冗长的 HTML 标签（`<span...>`），只给文本加上橙色下划线，保持写作界面整洁。
    *   只有当光标移入批注文本内部时，源码才会自动展开，方便修改。
*   **阅读模式支持**：在**阅读视图**下，同样支持悬浮显示批注。
*   **数据安全**：所有批注均以标准 HTML `<span>` 标签存储在文档中。即使你卸载了插件，批注内容依然保留在文档源码中，不会丢失。

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/db8f682d-3e7f-45b8-bcd2-5ff41665edbc" />

*示例 1 - 插入批注（推荐快捷键 `Alt+c`）*  

<img width="600" height="300" alt="image" src="https://github.com/user-attachments/assets/a4b9e833-7430-4160-b287-1424aa46a3a5" />

*示例 2 - 插入批注后将自动高亮对应文本*  

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/22a82896-4349-427f-9ded-341caf2607f8" />

*示例 3 - 显示批注内容（鼠标悬停时自动弹出批注内容）*  

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/82bd523b-1a2e-46dd-b8aa-52acb08190b9" />

*示例 4 - 批注以HTML永久安全储存在文档中（卸载插件后批注仍将保留）*  

---

### 使用方法 (How to Use)

**第一步：添加批注**
1.  在笔记中用鼠标选中一段文字（例如：“量子力学”）,使用快捷键Alt+c（使用前需自行设置）。
2.  在弹出的输入框中写下你的批注（例如：“这里需要进一步查证资料”）， 回车或点击“确定”。

当然，如果你不想使用快捷键，你也可以使用Obsidian的自带方式：
1.  在笔记中用鼠标选中一段文字（例如：“量子力学”）,按下命令面板快捷键（通常是 `Ctrl/Cmd + P`）。
2.  输入 `HTML` 或 `Annotation` 搜索，找到命令 **“Simple HTML Annotation: 添加批注 (HTML)”** 并回车。
3.  在弹出的输入框中写下你的批注（例如：“这里需要进一步查证资料”）， 回车或点击“确定”。

**第二步：查看批注**
*   你会发现“量子力学”这几个字下方出现了**橙色下划线**及浅色背景。
*   将鼠标悬停在文字上方，即可看到刚才输入的“这里需要进一步查证资料”。

**第三步：修改/删除批注**
*   **修改**：点击高亮的文本（即有批注的文本），然后右键弹出选项菜单栏，点击“编辑批注”，修改内容并确认。
*   **删除**：点击高亮的文本（即有批注的文本），然后右键弹出选项菜单栏，点击“删除批注”，批注内容将会被删除（对应的文本高亮也将被清除）。

---

### 🚀 未来改进路线图 (Roadmap)


#### 1. 交互体验升级 (UI/UX)
*   **右键菜单集成**：目前只能通过 `Ctrl+P` 调用。考虑添加一个 `EditorMenu` 事件，让用户选中文字后**右键**就能看到“添加批注”选项。
*   **侧边栏视图 (Sidebar View)**：
    *   开发一个侧边栏面板，列出当前文档中的**所有批注**。
    *   点击侧边栏的某条批注，编辑器自动滚动跳转到对应位置（类似 Word 的审阅窗格）。
*   **多彩批注**：
    *   允许用户选择不同的批注颜色（如：红色代表疑问，绿色代表想法，黄色代表待办）。
    *   实现方式：在 HTML 中添加不同的 class，如 `class="ob-comment red"`。

#### 2. 功能增强
*   **一键删除/编辑命令**：
    *   目前删除需要手动删代码。可以开发一个命令：光标在批注上时，执行“删除批注”，自动把 HTML 标签剥离，只留下纯文本。
    *   执行“编辑批注”，弹窗修改 `data-note` 的内容，而不用去改源码。
*   **图标模式**：
    *   你最初的需求中提到了“图标”。可以在设置里增加一个开关：选择是“下划线模式”还是“文末图标模式”。
    *   图标模式下，使用 CSS `::after` 伪元素在文本后加一个 `📝` 符号，鼠标悬浮在图标上显示内容。

#### 3. 导出与汇总
*   **批注汇总**：增加一个功能，一键将当前文档的所有批注提取出来，生成一个新的 Markdown 列表（包含：原文、批注内容、位置链接）。这对于读书笔记非常有用。

---

### 联系方式

Any questions or suggestions？Please contact Max Kong (Carnegie Mellon University, Pittsburgh, PA).

如有任何问题或建议，请联系Max Kong (卡内基梅隆大学，宾夕法尼亚州)。

Max Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu
