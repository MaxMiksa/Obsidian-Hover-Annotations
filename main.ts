import { App, Editor, MarkdownView, Modal, Plugin, Menu, Notice } from 'obsidian';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

// 定义 HTML 标签的正则结构 (支持多行)
const COMMENT_REGEX = /<span class="ob-comment" data-note="([\s\S]*?)">([\s\S]*?)<\/span>/g;

// 软性层通用：安全地将手挂内容存入 HTML data-note
function escapeDataNote(note: string): string {
	return note
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/'/g, "&#39;")
		.replace(/`/g, "&#96;")
		.replace(/\r?\n/g, "&#10;");
}

// 解码 data-note 内的常见 HTML 安全转义
function decodeDataNote(note: string): string {
	return note
		.replace(/&#10;/g, "\n")
		.replace(/&#13;/g, "\r")
		.replace(/&#96;/g, "`")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, "\"")
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<")
		.replace(/&amp;/g, "&");
}

export default class AnnotationPlugin extends Plugin {
	tooltipEl: HTMLElement | null = null;

	onload() {
		// 1. 注册“添加批注”命令 (保留快捷键功能)
		this.addCommand({
			id: 'add-annotation-html',
			name: '添加批注',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleAddCommand(editor);
			}
		});

		// 2. 注册 CodeMirror 扩展 (Live Preview 渲染)
		this.registerEditorExtension(livePreviewAnnotationPlugin);

		// 3. 初始化全局 Tooltip
		this.createTooltipElement();

		// 4. 注册全局鼠标悬浮事件
		this.registerDomEvent(document, 'mouseover', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
				const note = target.getAttribute('data-note');
				if (note) this.showTooltip(evt, note);
			}
		});

		this.registerDomEvent(document, 'mouseout', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
				this.hideTooltip();
			}
		});

		// 额外的隐藏触发：点击任意鼠标键 / 任意键盘按键
		this.registerDomEvent(document, 'mousedown', () => {
			this.hideTooltip();
		});
		this.registerDomEvent(document, 'keydown', () => {
			this.hideTooltip();
		});

		// 5. [新增] 注册右键菜单事件
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view: MarkdownView) => {
				this.handleContextMenu(menu, editor);
			})
		);
	}

	onunload() {
		if (this.tooltipEl) {
			this.tooltipEl.remove();
		}
	}

	// --- 核心逻辑区 ---

	/**
	 * 处理右键菜单逻辑
	 */
	handleContextMenu(menu: Menu, editor: Editor) {
		// 检查光标下是否存在已有的批注
		const existingAnnotation = this.findAnnotationAtCursor(editor);

		if (existingAnnotation) {
			// === 场景 A：光标在批注上 -> 显示 编辑/删除 ===
			
			// 1. 编辑批注
			menu.addItem((item) => {
				item
					.setTitle("编辑批注")
					.setIcon("pencil")
					.onClick(() => {
						// 打开弹窗，传入原有的笔记内容
						new AnnotationModal(this.app, existingAnnotation.note, (newNote) => {
							const safeNote = escapeDataNote(newNote);
							// 重组 HTML，保持原文文本不变
							const replacement = `<span class="ob-comment" data-note="${safeNote}">${existingAnnotation.text}</span>`;
							
							// 精确替换范围
							editor.replaceRange(replacement, existingAnnotation.from, existingAnnotation.to);
						}).open();
					});
			});

			// 2. 删除批注
			menu.addItem((item) => {
				item
					.setTitle("删除批注")
					.setIcon("trash")
					.onClick(() => {
						// 直接用纯文本替换掉 HTML 标签
						editor.replaceRange(existingAnnotation.text, existingAnnotation.from, existingAnnotation.to);
					});
			});

		} else {
			// === 场景 B：光标不在批注上 -> 检查是否有选区 -> 显示 添加 ===
			const selection = editor.getSelection();
			if (selection && selection.trim().length > 0) {
				menu.addItem((item) => {
					item
						.setTitle("添加批注")
						.setIcon("message-square")
						.onClick(() => {
							this.performAddAnnotation(editor, selection);
						});
				});
			}
		}
	}

	/**
	 * 命令触发的添加逻辑
	 */
	handleAddCommand(editor: Editor) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice("请先选择一段文本");
			return;
		}
		// 检查选区内是否已经包含了 HTML 标签，防止嵌套（可选）
		if (selection.includes('<span class="ob-comment"')) {
			new Notice("不支持在已有批注上嵌套批注，请先删除旧批注");
			return;
		}
		this.performAddAnnotation(editor, selection);
	}

	/**
	 * 执行添加批注动作
	 */
	performAddAnnotation(editor: Editor, selectionText: string) {
		new AnnotationModal(this.app, "", (noteContent) => {
			const safeNote = escapeDataNote(noteContent);
			const replacement = `<span class="ob-comment" data-note="${safeNote}">${selectionText}</span>`;
			editor.replaceSelection(replacement);
		}).open();
	}

	/**
	 * [辅助算法] 扫描全文，判断光标是否位于某个批注 HTML 标签内部
	 */
	findAnnotationAtCursor(editor: Editor) {
		const cursor = editor.getCursor();
		const cursorOffset = editor.posToOffset(cursor);
		const docText = editor.getValue();

		// 重置正则索引
		COMMENT_REGEX.lastIndex = 0;
		let match;

		// 遍历全文所有的批注
		while ((match = COMMENT_REGEX.exec(docText)) !== null) {
			const fullMatch = match[0];    // 完整的 <span...>text</span>
			const noteContent = match[1];  // data-note="..."
			const innerText = match[2];    // <span>包裹的文本</span>
			
			const startOffset = match.index;
			const endOffset = startOffset + fullMatch.length;

			// 判断光标位置是否在这个范围内
			if (cursorOffset >= startOffset && cursorOffset <= endOffset) {
				return {
					from: editor.offsetToPos(startOffset),
					to: editor.offsetToPos(endOffset),
					text: innerText, // 原文
					note: decodeDataNote(noteContent) // 笔记内容（解码后）
				};
			}
		}
		return null;
	}

	// --- Tooltip 相关逻辑 (保持不变) ---
	createTooltipElement() {
		this.tooltipEl = document.body.createDiv({ cls: 'ob-annotation-tooltip' });
	}

	showTooltip(evt: MouseEvent, text: string) {
		if (!this.tooltipEl) return;
		this.tooltipEl.innerText = text;
		this.tooltipEl.addClass('is-visible');
		const x = evt.pageX;
		const y = evt.pageY - 40;
		this.tooltipEl.style.left = `${x}px`;
		this.tooltipEl.style.top = `${y}px`;
	}

	hideTooltip() {
		if (!this.tooltipEl) return;
		this.tooltipEl.removeClass('is-visible');
	}
}

// --- 弹窗输入框类 (升级：支持默认值) ---
class AnnotationModal extends Modal {
	result: string;
	defaultValue: string;
	onSubmit: (result: string) => void;

	constructor(app: App, defaultValue: string, onSubmit: (result: string) => void) {
		super(app);
		this.defaultValue = defaultValue;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: this.defaultValue ? "编辑批注" : "输入批注内容" });

		const inputEl = contentEl.createEl("textarea", { 
			cls: "annotation-input",
			attr: { rows: "3", style: "width: 100%; margin-bottom: 10px;" } 
		});
		
		// 填入默认值
		inputEl.value = this.defaultValue;
		inputEl.focus();
		// 如果是编辑模式，全选文本方便修改
		if (this.defaultValue) inputEl.select();

		inputEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && e.shiftKey) {
				// Shift + Enter -> 换行
				return;
			}
			if (e.key === "Enter") {
				e.preventDefault();
				this.submit(inputEl.value);
			}
		});

		const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
		// 取消按钮
		const cancelBtn = btnContainer.createEl("button", { text: "取消" });
		cancelBtn.addEventListener("click", () => this.close());

		// 确定按钮
		const submitBtn = btnContainer.createEl("button", { text: "确定", cls: "mod-cta" });
		submitBtn.addEventListener("click", () => {
			this.submit(inputEl.value);
		});
	}

	submit(value: string) {
		this.onSubmit(value);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// --- CodeMirror 6 扩展 (保持不变) ---
const livePreviewAnnotationPlugin = ViewPlugin.fromClass(class {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged || update.selectionSet) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	buildDecorations(view: EditorView) {
		const builder = new RangeSetBuilder<Decoration>();
		const text = view.state.doc.toString();
		const selection = view.state.selection.main;
		const cursorFrom = selection.from;
		const cursorTo = selection.to;

		let match;
		COMMENT_REGEX.lastIndex = 0;

		while ((match = COMMENT_REGEX.exec(text)) !== null) {
			const fullMatch = match[0];
			const noteContent = match[1];
			const visibleText = match[2];
			const noteText = decodeDataNote(noteContent);
			
			const startPos = match.index;
			const endPos = startPos + fullMatch.length;

			const openingTagLength = fullMatch.indexOf('>') + 1;
			const openingTagFrom = startPos;
			const openingTagTo = startPos + openingTagLength;
			const contentFrom = openingTagTo;
			const contentTo = contentFrom + visibleText.length;
			const closingTagFrom = contentTo;
			const closingTagTo = endPos;

			const isCursorInside = (cursorFrom >= startPos && cursorFrom <= endPos) || 
								   (cursorTo >= startPos && cursorTo <= endPos);

			if (isCursorInside) continue;

			builder.add(openingTagFrom, openingTagTo, Decoration.replace({}));
			builder.add(contentFrom, contentTo, Decoration.mark({
				class: "ob-comment",
				attributes: { "data-note": noteText }
			}));
			builder.add(closingTagFrom, closingTagTo, Decoration.replace({}));
		}

		return builder.finish();
	}
}, {
	decorations: v => v.decorations
});
