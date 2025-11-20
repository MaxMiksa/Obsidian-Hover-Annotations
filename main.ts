import { App, Editor, MarkdownView, Modal, Plugin, Menu, Notice } from 'obsidian';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

// 定义 HTML 标签的正则结构
const COMMENT_REGEX = /<span class="ob-comment" data-note="(.*?)">(.*?)<\/span>/g;

export default class AnnotationPlugin extends Plugin {
	tooltipEl: HTMLElement | null = null;

	async onload() {
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
							const safeNote = newNote.replace(/"/g, '&quot;');
							// 重组 HTML，保持原文文本不变
							const replacement = `<span class="ob-comment" data-note="${safeNote}">${existingAnnotation.text}</span>`;
							
							// 精确替换范围
							editor.replaceRange(
								replacement,
								{ line: existingAnnotation.line, ch: existingAnnotation.start },
								{ line: existingAnnotation.line, ch: existingAnnotation.end }
							);
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
						editor.replaceRange(
							existingAnnotation.text,
							{ line: existingAnnotation.line, ch: existingAnnotation.start },
							{ line: existingAnnotation.line, ch: existingAnnotation.end }
						);
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
			const safeNote = noteContent.replace(/"/g, '&quot;');
			const replacement = `<span class="ob-comment" data-note="${safeNote}">${selectionText}</span>`;
			editor.replaceSelection(replacement);
		}).open();
	}

	/**
	 * [辅助算法] 扫描当前行，判断光标是否位于某个批注 HTML 标签内部
	 */
	findAnnotationAtCursor(editor: Editor) {
		const cursor = editor.getCursor();
		const lineText = editor.getLine(cursor.line);
		
		// 重置正则索引
		COMMENT_REGEX.lastIndex = 0;
		let match;

		// 遍历这一行所有的批注
		while ((match = COMMENT_REGEX.exec(lineText)) !== null) {
			const fullMatch = match[0];    // 完整的 <span...>text</span>
			const noteContent = match[1];  // data-note="..."
			const innerText = match[2];    // <span>包裹的文本</span>
			
			const startIndex = match.index;
			const endIndex = startIndex + fullMatch.length;

			// 判断光标位置是否在这个范围内
			// 我们放宽一点条件，只要触碰到边缘也算
			if (cursor.ch >= startIndex && cursor.ch <= endIndex) {
				return {
					line: cursor.line,
					start: startIndex,
					end: endIndex,
					text: innerText, // 原文
					note: noteContent // 笔记内容
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
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
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
				attributes: { "data-note": noteContent }
			}));
			builder.add(closingTagFrom, closingTagTo, Decoration.replace({}));
		}

		return builder.finish();
	}
}, {
	decorations: v => v.decorations
});