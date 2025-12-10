## v1.2.0 — 多行批注与交互升级 (2025-12-09)

### 功能 1：多行批注与安全存储
- **总结**: 支持跨行批注，并安全存储/读取批注内容。
- **解决痛点**: 之前跨行批注会失效，且批注内容中的特殊字符可能破坏 HTML。
- **功能细节**: 多行选区插入的批注在悬浮、右键编辑/删除、Live Preview 中都能正常识别与隐藏，批注文本的换行与符号被完整保留。
- **技术实现**: 
  - COMMENT_REGEX 改为跨行匹配 `[\s\S]*?`，通过 `posToOffset/offsetToPos` 全文定位批注范围。
  - 新增 `escapeDataNote`/`decodeDataNote`，对 `data-note` 进行 `&`, `<`, `>`, 引号、反引号与换行的双向转义，编辑时解码后再保存。
  - Live Preview 装饰使用解码后的批注文本，确保 hover 与右键展示正确内容。

### 功能 2：批注弹窗与提示交互优化
- **总结**: 改进批注弹窗的提交/换行体验，并让悬浮气泡在交互后自动消失。
- **解决痛点**: 之前 Enter 只能换行且气泡会在点击/键盘操作时遮挡文本。
- **功能细节**: Enter 直接提交批注，Shift+Enter 换行；鼠标点击或键盘任意按键后气泡自动隐藏。
- **技术实现**: 
  - Modal 的 keydown 逻辑调整：Enter 提交，Shift+Enter 保留换行。
  - Tooltip 监听 `mousedown`/`keydown` 事件调用 `hideTooltip`，配合原有移出事件。

## v1.1.0 — 首个公开版 (2025-11-20)

### 功能 1：批注插入与右键编辑/删除
- **总结**: 提供命令和右键菜单快速添加、编辑、删除批注。
- **解决痛点**: 需要在编辑器中便捷标注文字并随时修改或移除。
- **功能细节**: 选中文本通过命令插入 `<span class="ob-comment" data-note="...">`；光标位于批注时右键可编辑或删除，直接替换原内容。
- **技术实现**: 
  - `addCommand` 注册 `add-annotation-html`，`handleContextMenu` 结合 `findAnnotationAtCursor` 定位批注并 `replaceRange` 更新。
  - `AnnotationModal` 采集批注文本，写入 `data-note`，保持原文文本不变。

### 功能 2：悬浮展示与实时预览隐藏 HTML
- **总结**: 悬浮显示批注内容，编辑模式隐藏冗长的 HTML 标签。
- **解决痛点**: HTML 标签干扰写作/阅读体验。
- **功能细节**: Hover 批注文本弹出气泡，阅读模式和实时预览均可查看；编辑模式自动隐藏 `<span>` 标签，仅突出标注文本。
- **技术实现**: 
  - 注册全局 `mouseover`/`mouseout` 显示和关闭 tooltip。
  - CodeMirror `ViewPlugin` 使用 `Decoration.replace/mark` 隐藏标签、标记内容，避开光标所在批注。
