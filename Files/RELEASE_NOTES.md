## v2.1.0 – Cursor-Aware Annotation Normalization / 光标感知的批注规范化 (2026-03-20)

## ✨ 编辑批注源码时更稳，不再被中途打断

**这次更新把自动规范化的触发时机改成“离开批注源码后”，避免用户还在编辑 `data-note` 时就被自动改写和折叠打断。**

| 类别 | 详细内容 |
| :--- | :--- |
| **更聪明的触发时机** | 自动规范化只会在光标离开批注源码并短暂停留后才执行。 |
| **更少打断** | 当你还在 `data-note` 中连续输入时，不会再被定时器中途改写并折叠源码。 |
| **设置更简单** | 设置中现在只保留“移出批注源码后自动规范化”，保存时保底检查已移除。 |

## ✨ Smarter Timing, Less Interruption While Editing Source

**This release makes auto-normalization wait until you leave annotation source, so editing inside `data-note` no longer gets interrupted by an early rewrite and collapse.**

| Category | Details |
| :--- | :--- |
| **Smarter Trigger Timing** | Auto-normalization now runs only after the cursor leaves annotation source and stays outside briefly. |
| **Less Interruption** | While you keep typing inside `data-note`, the plugin no longer rewrites and collapses the source mid-edit. |
| **Simpler Settings** | Settings now keep only “Auto-normalize after leaving annotation source”; the save-time fallback was removed. |

---

## v2.0.0 – Mobile Modal & Safe Newline Controls / 移动端弹窗与安全换行控制 (2026-03-19)

## ✨ 更适合移动端编辑，也更不容易把批注写坏

**这次更新重点解决了手机端批注编辑难用的问题，并自动修复会导致文件重开失败的不安全换行。**

| 类别 | 详细内容 |
| :--- | :--- |
| **移动端弹窗** | iOS/手机端批注弹窗更宽，标题保持单行，颜色圆点改为单排，确认操作更集中。 |
| **快捷键自定义** | 现在可以分别设置“完成批注”和“换行”按键，支持 `Enter`、`Shift+Enter`、`Ctrl+Enter` 或关闭快捷键。 |
| **自动安全修复** | 当源码中的 `data-note` 出现原始换行时，插件会在编辑器空闲后和保存时自动转换为兼容的 `&#10;` 格式。 |

## ✨ Easier Mobile Editing, Safer Annotation Storage

**This release makes annotation editing much more usable on mobile and automatically repairs unsafe raw newlines before they break file reopening.**

| Category | Details |
| :--- | :--- |
| **Mobile Modal** | The annotation modal is wider on phones, keeps the title on one line, shows colors in one row, and keeps the primary action easy to reach. |
| **Shortcut Customization** | You can now configure separate submit and newline keys with `Enter`, `Shift+Enter`, `Ctrl+Enter`, or disable the shortcut entirely. |
| **Automatic Safety Fix** | Raw newlines inside `data-note` are normalized to the safe `&#10;` format after editor idle time and on save. |

---

## v1.6.0 – Rebrand & Bilingual UI / 更名与双语界面 (2025 年12月19日)

## ✨ 更名与双语体验
**插件更名为 Hover Annotations，新增语言切换与优化的批注弹窗。**
| 类别 | 详细内容 |
| :--- | :--- |
| **品牌/ID** | 更名并更换插件 ID 为 `hover-annotations`；升级时建议移除旧目录 `simple-html-annotation` 后重新安装。 |
| **双语界面** | 设置新增语言切换；命令、提示、右键菜单即时切换中/英，默认英文。 |
| **弹窗体验** | 新增标题+快捷键提示，颜色选择与按钮同列展示，键盘选色状态更清晰。 |

## ✨ Rebrand & Bilingual Experience
**New Hover Annotations brand, language toggle, and a refined annotation modal.**
| Category | Details |
| :--- | :--- |
| **Brand/ID** | Renamed with plugin ID `hover-annotations`; for upgrades, remove the old `simple-html-annotation` folder before reinstalling. |
| **Bilingual UI** | Language switch in settings; commands, notices, and context menus swap between EN/ZH instantly (default EN). |
| **Modal UX** | Added header with key hints, inline layout for colors + buttons, clearer active state for keyboard selection. |

---

## v1.5.0 – New Settings Panel & Customization / 全新设置面板与个性化定制 (2025年12月11日)

## ✨ 全新设置面板与极简图标模式

**本次更新引入了功能强大的设置面板，支持外观深度定制，并新增“极简图标”阅读模式。**

| 类别 | 详细内容 |
| :--- | :--- |
| **个性化外观** | 新增完整设置页，可开关下划线、背景色、调节不透明度。 |
| **极简模式** | 支持“仅图标”模式 (📌)，隐藏高亮，仅在文末显示小图标，点击或悬浮查看。 |
| **阅读体验** | Tooltip 弹窗宽度和字体大小均可自定义，适应不同屏幕和阅读习惯。 |
| **数据管理** | 新增“导出所有批注”到剪贴板功能，以及旧版本数据一键修复工具。 |

## ✨ Comprehensive Settings & Minimalist Icon Mode

**This update introduces a powerful settings panel for deep customization and a new "Icon Only" reading mode.**

| Category | Details |
| :--- | :--- |
| **Custom Looks** | Full settings tab to toggle underline/background and adjust opacity. |
| **Icon Mode** | "Icon Only" mode (📌) hides highlights, showing only a small icon at the end. |
| **Readability** | Customizable tooltip width and font scale for better reading experience. |
| **Data Tools** | New tools to "Export All Annotations" and "Fix Legacy Data" in settings. |

---

## v1.4.0 – Batch Fix Safety & Markdown Tables / 批量修复保护与 Markdown 表格支持 (2025年12月10日)

## ✨ 批量修复保护与 Markdown 表格

**更安全的维护工具，更丰富的阅读体验（支持表格！）。**

| 类别 | 详细内容 |
| :--- | :--- |
| **🛡️ 批量修复保护** | 执行“修复所有 Markdown 文件”命令时新增确认弹窗，防止意外误操作。 |
| **📊 Markdown 表格** | 悬浮批注（Tooltip）现在完美支持 **Markdown 表格** 及其他富文本格式。即使在表格单元格内，也能安全嵌套包含表格的批注。 |
| **🎨 细节优化** | 右键菜单图标放大；Tooltip 布局更紧凑；编辑弹窗支持自动高度调节；主题适配优化。 |

## ✨ Batch Fix Safety & Markdown Tables

**Safer maintenance tools and richer reading experience (Tables supported!).**

| Category | Details |
| :--- | :--- |
| **🛡️ Batch Fix Safety** | Added a confirmation dialog before running "Normalize all Markdown files" to prevent accidental bulk changes. |
| **📊 Markdown Tables** | Tooltips now perfectly render **Markdown Tables**. Supports nested tables (tables inside annotations inside tables). |
| **🎨 Visual Polish** | Larger context menu icons; auto-resizing input modal; optimized highlight contrast; compacted tooltip layout. |

---

## v1.3.0 – Color Revolution & UX Renewal / 色彩革命与交互焕新 (2025年12月10日)

## ✨ 全新 8 色系统与原生交互体验

**不仅是颜色更多，更是从视觉到触觉的全方位原生化升级。**

| 类别 | 详细内容 |
| :--- | :--- |
| **🎨 八色批注** | 新增红、橙、黄、绿、青、蓝、紫、灰 8 种颜色，满足复杂标注需求。 |
| **👁️ 可视化选色** | 弹窗新增圆形色块选择器，支持键盘操作；右键菜单支持彩色图标预览。 |
| **🛠️ 原生 UI** | 悬浮框（Tooltip）与弹窗完全适配 Obsidian 原生主题，支持动画上浮效果。 |
| **📱 移动端支持** | 支持点击批注显示内容，填补了移动端无法查看批注的空白。 |
| **⚡ 极速操作** | 新增特定颜色快捷命令、一键显隐开关，右键菜单结构全面优化。 |

## ✨ 8-Color System & Native UX Overhaul

**More than just colors—a complete native experience upgrade.**

| Category | Details |
| :--- | :--- |
| **🎨 8-Color Palette** | Added Red, Orange, Yellow, Green, Cyan, Blue, Purple, Gray to suit complex needs. |
| **👁️ Visual Picker** | New circular color swatches in modal; real colored icons in the context menu. |
| **🛠️ Native UI** | Tooltips and modals now fully adapt to Obsidian themes with smooth animations. |
| **📱 Mobile Support** | Added click-to-view support for mobile devices. |
| **⚡ Efficiency** | Added color-specific commands, toggle visibility switch, and optimized menu layout. |

---

## v1.2.0 — Multi-line & Interaction Polish / 多行与交互优化 (2025-12-09)

## ✨多行批注与交互升级

**跨行批注、快捷提交与自动隐藏气泡，批注体验更顺滑。**

| 类别 | 详细内容 |
| :--- | :--- |
| **多行批注** | 跨行批注可正常隐藏/悬浮/右键编辑，批注文本换行与特殊符号被安全保留。 |
| **交互体验** | Enter 直接提交批注，Shift+Enter 换行；鼠标点击或键盘操作后气泡自动关闭。 |

## ✨Multi-line annotations and smoother interactions

**Cross-line notes stay safe, Enter submits instantly, and tooltips get out of the way.**

| Category | Details |
| :--- | :--- |
| **Multi-line annotations** | Cross-line notes remain hidden/highlighted correctly and keep line breaks and symbols intact. |
| **Interaction** | Enter submits the note, Shift+Enter adds a newline; tooltips auto-hide after any mouse click or key press. |

---

## v1.1.0 — Initial Public Release / 首个公开版 (2025-11-20)

## ✨首个公开版

**快速为文本添加悬浮批注，编辑/删除一键完成。**

| 类别 | 详细内容 |
| :--- | :--- |
| **批注操作** | 命令和右键菜单添加批注，光标位于批注时可直接编辑或删除。 |
| **悬浮展示** | 悬浮气泡展示批注内容，实时预览隐藏 HTML 标签仅保留高亮文本。 |

## ✨First public cut

**Add hoverable notes to text with quick edit/delete actions.**

| Category | Details |
| :--- | :--- |
| **Annotation flow** | Command and context menu to insert notes; edit or delete when the cursor is on an annotation. |
| **Hover display** | Tooltip shows note content; Live Preview hides raw HTML and keeps highlighted text. |

## ✨First public cut

**Add hoverable notes to text with quick edit/delete actions.**

| Category | Details |
| :--- | :--- |
| **Annotation flow** | Command and context menu to insert notes; edit or delete when the cursor is on an annotation. |
| **Hover display** | Tooltip shows note content; Live Preview hides raw HTML and keeps highlighted text. |
