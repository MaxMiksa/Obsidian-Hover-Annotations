import { App, Editor, MarkdownView, Modal, Plugin, Setting, MarkdownPostProcessorContext } from 'obsidian';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

// 定义 HTML 标签的正则结构
// 匹配格式: <span class="ob-comment" data-note="批注内容">选中文本</span>
const COMMENT_REGEX = /<span class="ob-comment" data-note="(.*?)">(.*?)<\/span>/g;

export default class AnnotationPlugin extends Plugin {
	tooltipEl: HTMLElement | null = null;

	async onload() {
		// 1. 添加样式文件
		// (Obsidian 会自动加载 styles.css，这里不需要额外代码)

		// 2. 注册“添加批注”命令
		this.addCommand({
			id: 'add-annotation-html',
			name: '添加批注 (HTML)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (!selection) {
					new Notice("请先选择一段文本");
					return;
				}
				// 打开输入弹窗
				new AnnotationModal(this.app, (noteContent) => {
					// 这里进行简单的转义，防止破坏 HTML 结构
					const safeNote = noteContent.replace(/"/g, '&quot;');
					const replacement = `<span class="ob-comment" data-note="${safeNote}">${selection}</span>`;
					editor.replaceSelection(replacement);
				}).open();
			}
		});

		// 3. 注册 CodeMirror 扩展 (用于 Live Preview 的渲染)
		this.registerEditorExtension(livePreviewAnnotationPlugin);

		// 4. 初始化全局 Tooltip 元素
		this.createTooltipElement();

		// 5. 注册全局鼠标事件 (处理悬浮显示)
		// 这种方式同时支持 阅读模式 和 编辑模式
		this.registerDomEvent(document, 'mouseover', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			// 检查鼠标是否停留在我们的批注元素上
			if (target && target.hasClass && target.hasClass('ob-comment')) {
				const note = target.getAttribute('data-note');
				if (note) {
					this.showTooltip(evt, note);
				}
			}
		});

		this.registerDomEvent(document, 'mouseout', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
				this.hideTooltip();
			}
		});
	}

	onunload() {
		if (this.tooltipEl) {
			this.tooltipEl.remove();
		}
	}

	// --- Tooltip 相关逻辑 ---
	createTooltipElement() {
		this.tooltipEl = document.body.createDiv({ cls: 'ob-annotation-tooltip' });
	}

	showTooltip(evt: MouseEvent, text: string) {
		if (!this.tooltipEl) return;
		
		this.tooltipEl.innerText = text;
		this.tooltipEl.addClass('is-visible');

		// 计算位置：在鼠标上方显示
		const x = evt.pageX;
		const y = evt.pageY - 40; // 向上偏移

		this.tooltipEl.style.left = `${x}px`;
		this.tooltipEl.style.top = `${y}px`;
	}

	hideTooltip() {
		if (!this.tooltipEl) return;
		this.tooltipEl.removeClass('is-visible');
	}
}

// --- 弹窗输入框类 ---
class AnnotationModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "输入批注内容" });

		const inputEl = contentEl.createEl("textarea", { 
			cls: "annotation-input",
			attr: { rows: "3", style: "width: 100%; margin-bottom: 10px;" } 
		});
		inputEl.focus();

		// 回车提交 (Ctrl+Enter)
		inputEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				this.submit(inputEl.value);
			}
		});

		const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
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

// --- CodeMirror 6 扩展 (核心难点) ---
// 这个插件的作用是：在编辑模式下，扫描文档，找到 HTML 标签，
// 将 <span...> 和 </span> 部分隐藏，只显示中间的文本，并给中间的文本加上样式。

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
		
		// 获取当前光标选区，如果光标在标签内部，我们就不隐藏标签，方便用户编辑
		const selection = view.state.selection.main;
		const cursorFrom = selection.from;
		const cursorTo = selection.to;

		let match;
		// 重置正则索引
		COMMENT_REGEX.lastIndex = 0;

		while ((match = COMMENT_REGEX.exec(text)) !== null) {
			const fullMatch = match[0];       // 整个 <span ...>text</span>
			const noteContent = match[1];     // data-note 的内容
			const visibleText = match[2];     // 标签内的文本
			
			const startPos = match.index;
			const endPos = startPos + fullMatch.length;

			// 计算各部分的位置
			// Opening Tag: <span class="ob-comment" data-note="...">
			const openingTagLength = fullMatch.indexOf('>') + 1;
			const openingTagFrom = startPos;
			const openingTagTo = startPos + openingTagLength;

			// Content: text
			const contentFrom = openingTagTo;
			const contentTo = contentFrom + visibleText.length;

			// Closing Tag: </span>
			const closingTagFrom = contentTo;
			const closingTagTo = endPos;

			// 判断光标是否在这个标签范围内
			// 如果光标触碰到了这个范围，就不应用“隐藏”效果，让源码暴露出来方便修改
			const isCursorInside = (cursorFrom >= startPos && cursorFrom <= endPos) || 
								   (cursorTo >= startPos && cursorTo <= endPos);

			if (isCursorInside) {
				// 光标在附近，不做任何修饰，显示源码
				continue;
			}

			// 1. 隐藏 Opening Tag
			builder.add(
				openingTagFrom,
				openingTagTo,
				Decoration.replace({}) // replace为空，即隐藏
			);

			// 2. 给内容文本添加样式 (模仿阅读模式的样子)
			builder.add(
				contentFrom,
				contentTo,
				Decoration.mark({
					class: "ob-comment",           // 使用 CSS 中定义的样式
					attributes: { "data-note": noteContent } // 把批注内容加上，方便鼠标事件获取
				})
			);

			// 3. 隐藏 Closing Tag
			builder.add(
				closingTagFrom,
				closingTagTo,
				Decoration.replace({}) // replace为空，即隐藏
			);
		}

		return builder.finish();
	}
}, {
	decorations: v => v.decorations
});