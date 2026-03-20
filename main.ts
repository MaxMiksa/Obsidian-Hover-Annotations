import { App, Component, Editor, MarkdownView, Modal, Plugin, Menu, MenuItem, Notice, addIcon, MarkdownRenderer, TFile, PluginSettingTab, Setting } from 'obsidian';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { decodeDataNote, escapeDataNote, findAnnotationRangeAtOffset, getAutoNormalizeAction, normalizeAnnotationsInText, normalizeTextWithCursor, type AnnotationOffsetRange } from "./annotation-normalization";
import { formatModalKeyHint, getShortcutLabel, isShortcutEvent, normalizeShortcutSettings, type ModalShortcut } from "./modal-shortcuts";

type AnnotationColor = string;
type IconTooltipTrigger = 'hover' | 'click';
type SubmenuCapableMenuItem = MenuItem & { setSubmenu?: () => Menu };

// 定义 HTML 标签的正则结构 (支持多行 + 颜色 class)
const COMMENT_REGEX = /<span class="ob-comment(?:\s+([\w-]+))?" data-note="([\s\S]*?)">([\s\S]*?)<\/span>/g;

const DEFAULT_COLOR: AnnotationColor = "";
const AUTO_NORMALIZE_IDLE_MS = 1000;

type Locale = 'en' | 'zh';

const STRINGS = {
	en: {
		settingLanguageName: "Language",
		settingLanguageDesc: "Choose plugin UI language (default: English).",
		settingLanguageEn: "English",
		settingLanguageZh: "Simplified Chinese",

		colorRed: "Red",
		colorDefault: "Orange (default)",
		colorYellow: "Yellow",
		colorGreen: "Green",
		colorCyan: "Cyan",
		colorBlue: "Blue",
		colorPurple: "Purple",
		colorGray: "Gray",

		cmdAddDefault: "Add Annotation (Default)",
		cmdAddWithColor: (color: string) => `Add Annotation (${color})`,
		cmdToggleVisibility: "Show/Hide Annotation Styles",
		cmdEditCurrent: "Edit Current Annotation",
		cmdDeleteCurrent: "Delete Current Annotation",
		cmdNormalizeCurrent: "Fix Current File Annotation data-note",
		cmdNormalizeVault: "Fix All Markdown Annotation data-note",

		noticeHidden: "Annotation styles are now hidden",
		noticeShown: "Annotation styles are now visible",
		noticeNoAnnotation: "No annotation at cursor",
		noticeNeedSelection: "Please select some text first",
		noticeNoNested: "Nested annotations are not supported; remove the old one first",
		noticeNoFixNeeded: "No annotations need fixing",
		noticeFixedCurrent: "Annotations in this file are now safe-formatted",
		noticeScanStart: "Scanning vault, please wait...",
		noticeFixedVault: (count: number) => `Successfully fixed annotations in ${count} Markdown file(s)`,
		noticeNeedSelectionAdd: "Please select text to add a new annotation",
		noticeCopied: "Annotations copied to clipboard!",
		noticeOpenDoc: "Please open a Markdown document first",
		noticeShortcutConflict: "Submit shortcut can't match newline shortcut. Submit shortcut has been reset to None.",

		ctxAdd: "Add Annotation",
		ctxEdit: "Edit Annotation",
		ctxChangeColor: " - Change Color",
		ctxDelete: "Delete Annotation",

		modalTitleEdit: "Edit Annotation",
		modalTitleNew: "Enter Annotation Content",
		modalColorLabel: "Annotation Color",
		modalCancel: "Cancel",
		modalConfirm: "Confirm",
		modalColorCurrent: "Current color: ",
		modalShortcutNone: "None",
		modalShortcutEnter: "Enter",
		modalShortcutShiftEnter: "Shift+Enter",
		modalShortcutCtrlEnter: "Ctrl+Enter",
		modalHintSubmitPrefix: "Submit: ",
		modalHintNewlinePrefix: "Newline: ",
		modalHintSeparator: "; ",

			batchTitle: "⚠️ Batch fix confirmation",
			batchSummary: (count: number) => `Found ${count} file(s) with legacy or unsafe annotations.`,
			batchWarning: "Fixing will update HTML (data-note escaping). Please back up your vault first.",
		batchConfirm: (count: number) => `Confirm fix (${count} files)`,
		batchCancel: "Cancel",

			settingsGeneral: "General settings",
			settingsAppearance: "Appearance",
			settingsInteraction: "Interaction",
			settingsAdvanced: "Advanced & maintenance",

		settingDefaultColorName: "Default annotation color",
		settingDefaultColorDesc: "Initial color when creating a new annotation.",
		settingHideDefaultName: "Hide annotations by default",
		settingHideDefaultDesc: "On app launch, hide all annotation styling for a clean reading mode.",
		settingUnderlineName: "Show underline",
		settingUnderlineDesc: "Add a colored underline to annotated text.",
		settingBackgroundName: "Show background highlight",
		settingBackgroundDesc: "Add a translucent background highlight to annotated text.",
		settingIconName: "Show end icon",
		settingIconDesc: 'Append a small "📝" icon (pseudo-element) to annotated text.',
		settingIconTriggerName: "End icon trigger",
		settingIconTriggerDesc: "Only in icon-only mode: show tooltip on hover, or require click first.",
		settingIconHover: "Hover to show",
		settingIconClick: "Click to show",
		settingLightOpacityName: "Light theme opacity",
			settingLightOpacityDesc: "Adjust highlight depth for light themes (0% - 100%).",
			settingDarkOpacityName: "Dark theme opacity",
			settingDarkOpacityDesc: "Adjust highlight depth for dark themes (0% - 100%).",
		settingTooltipWidthName: "Tooltip max width",
		settingTooltipWidthDesc: "Limit tooltip width (px).",
		settingSubmitShortcutName: "Submit shortcut",
		settingSubmitShortcutDesc: "Keyboard shortcut to submit the annotation modal. None means confirm by button only.",
		settingNewlineShortcutName: "Newline shortcut",
		settingNewlineShortcutDesc: "Keyboard shortcut to insert a newline inside the annotation modal.",
		settingAutoNormalizeAfterExitName: "Auto-normalize after leaving annotation source",
		settingAutoNormalizeAfterExitDesc: "About 1 second after the cursor leaves annotation source, convert unsafe raw newlines inside annotation data-note values to &#10;.",
		settingFontAdjustName: "Adjust font size",
		settingFontAdjustDescPrefix: "Adjust annotation font by steps (max ±3). Current: ",
		settingFontStepDefault: "Default",
		settingFontStep: (step: number) => `${step > 0 ? "+" : ""}${step} step`,
		settingFontStepPlural: (step: number) => `${step > 0 ? "+" : ""}${step} steps`,
		settingFontSmaller: "Smaller",
		settingFontLarger: "Larger",
		settingMarkdownName: "Enable Markdown rendering",
		settingMarkdownDesc: "Render annotation content as Markdown. Off = show plain text.",
		settingFixDataName: "One-click repair",
		settingFixDataDesc: "Scan all files and fix legacy annotation format issues.",
		settingFixDataButton: "Start scan & fix",
		settingExportName: "Export annotations (current file)",
		settingExportDesc: "Extract all annotations from the current document to clipboard.",
		settingExportButton: "Copy to clipboard",

		exportHeading: "## Annotations Export\n\n",
		exportOriginal: "Original",
		exportAnnotation: "Annotation",

		menuAddTitle: "Add Annotation",
	},
	zh: {
		settingLanguageName: "语言",
		settingLanguageDesc: "选择插件界面语言（默认：英文）。",
		settingLanguageEn: "英语",
		settingLanguageZh: "简体中文",

		colorRed: "红色",
		colorDefault: "橙色（默认）",
		colorYellow: "黄色",
		colorGreen: "绿色",
		colorCyan: "青色",
		colorBlue: "蓝色",
		colorPurple: "紫色",
		colorGray: "灰色",

		cmdAddDefault: "添加批注（默认）",
		cmdAddWithColor: (color: string) => `添加批注（${color}）`,
		cmdToggleVisibility: "显示/隐藏批注样式",
		cmdEditCurrent: "编辑当前批注",
		cmdDeleteCurrent: "删除当前批注",
		cmdNormalizeCurrent: "修复当前文件的批注 data-note",
		cmdNormalizeVault: "修复所有 Markdown 文件的批注 data-note",

		noticeHidden: "批注样式已隐藏",
		noticeShown: "批注样式已显示",
		noticeNoAnnotation: "光标处没有批注",
		noticeNeedSelection: "请先选择一段文本",
		noticeNoNested: "不支持在已有批注上嵌套批注，请先删除旧批注",
		noticeNoFixNeeded: "未发现需要修复的批注",
		noticeFixedCurrent: "当前文件的批注已转换为安全格式",
		noticeScanStart: "开始扫描库文件，请稍候...",
		noticeFixedVault: (count: number) => `已成功修复 ${count} 个 Markdown 文件的批注`,
		noticeNeedSelectionAdd: "请先选择文本以添加新批注",
		noticeCopied: "批注已复制到剪贴板！",
		noticeOpenDoc: "请先打开一个 Markdown 文档",
		noticeShortcutConflict: "完成批注快捷键不能与换行快捷键相同，已自动重置为“无”。",

		ctxAdd: "添加批注",
		ctxEdit: "编辑批注",
		ctxChangeColor: " - 修改颜色",
		ctxDelete: "删除批注",

		modalTitleEdit: "编辑批注",
		modalTitleNew: "输入批注内容",
		modalColorLabel: "批注颜色",
		modalCancel: "取消",
		modalConfirm: "确定",
		modalColorCurrent: "当前颜色：",
		modalShortcutNone: "无",
		modalShortcutEnter: "Enter",
		modalShortcutShiftEnter: "Shift+Enter",
		modalShortcutCtrlEnter: "Ctrl+Enter",
		modalHintSubmitPrefix: "完成批注：",
		modalHintNewlinePrefix: "换行：",
		modalHintSeparator: "；",

		batchTitle: "⚠️ 批量修复确认",
		batchSummary: (count: number) => `扫描发现共有 ${count} 个文件包含旧格式或需要规范化的批注。`,
			batchWarning: "执行修复将更新这些文件中的 HTML 结构（主要是 data-note 的安全转义）。建议先备份你的 vault。",
		batchConfirm: (count: number) => `确认修复（${count} 个文件）`,
		batchCancel: "取消",

		settingsGeneral: "基础设置",
		settingsAppearance: "外观样式",
		settingsInteraction: "交互体验",
		settingsAdvanced: "高级与维护",

		settingDefaultColorName: "默认批注颜色",
		settingDefaultColorDesc: "新建批注时的初始选中颜色。",
		settingHideDefaultName: "默认隐藏批注",
		settingHideDefaultDesc: "Obsidian 启动时自动隐藏所有批注样式（纯净阅读模式）。",
		settingUnderlineName: "显示下划线",
		settingUnderlineDesc: "为批注文本添加底部彩色下划线。",
		settingBackgroundName: "显示背景色",
		settingBackgroundDesc: "为批注文本添加半透明背景高亮。",
		settingIconName: "显示文末图标",
		settingIconDesc: "在批注文本末尾追加一个小的“📝”图标（伪元素）。",
		settingIconTriggerName: "文末图标触发方式",
		settingIconTriggerDesc: "仅在“仅图标”模式下生效：悬浮自动显示或需点击后显示批注。",
		settingIconHover: "移动到图标自动悬浮",
		settingIconClick: "点击图标后再悬浮",
		settingLightOpacityName: "浅色模式不透明度",
			settingLightOpacityDesc: "调整浅色主题下高亮背景的深浅 (0% - 100%)。",
			settingDarkOpacityName: "深色模式不透明度",
			settingDarkOpacityDesc: "调整深色主题下高亮背景的深浅 (0% - 100%)。",
		settingTooltipWidthName: "Tooltip 最大宽度",
		settingTooltipWidthDesc: "限制悬浮气泡的最大宽度 (px)。",
		settingSubmitShortcutName: "完成批注快捷键",
		settingSubmitShortcutDesc: "为批注弹窗设置完成快捷键；选择“无”时需点击“确定”。",
		settingNewlineShortcutName: "换行快捷键",
		settingNewlineShortcutDesc: "为批注弹窗设置换行快捷键。",
		settingAutoNormalizeAfterExitName: "移出批注源码后自动规范化",
		settingAutoNormalizeAfterExitDesc: "在光标移出批注源码约 1 秒后，将批注 data-note 中不安全的原始换行转换为 &#10;。",
		settingFontAdjustName: "调节字体大小",
		settingFontAdjustDescPrefix: "批注内容字体按档位调整（最多 ±3 档）。 当前：",
		settingFontStepDefault: "默认",
		settingFontStep: (step: number) => `${step > 0 ? "+" : ""}${step} 档`,
		settingFontStepPlural: (step: number) => `${step > 0 ? "+" : ""}${step} 档`,
		settingFontSmaller: "减小一号",
		settingFontLarger: "加大一号",
		settingMarkdownName: "启用 Markdown 渲染",
		settingMarkdownDesc: "开启后，批注内容支持 Markdown；关闭则显示纯文本。",
		settingFixDataName: "一键修复数据",
		settingFixDataDesc: "扫描库中文件并修复旧版批注的格式问题。",
		settingFixDataButton: "开始扫描修复",
		settingExportName: "导出所有批注（当前文件）",
		settingExportDesc: "将当前文档的所有批注提取到剪贴板。",
		settingExportButton: "复制到剪贴板",

		exportHeading: "## 批注导出\n\n",
		exportOriginal: "原文",
		exportAnnotation: "批注",

		menuAddTitle: "添加批注",
	}
};

type LocaleKey = keyof typeof STRINGS.en;

type TranslationParam = string | number;
type TranslateFn = (key: LocaleKey, params?: TranslationParam) => string;

const COLOR_OPTIONS: { value: AnnotationColor; labelKey: LocaleKey; hex: string }[] = [
	{ value: "red", labelKey: "colorRed", hex: "#e5484d" },
	{ value: "", labelKey: "colorDefault", hex: "#ff9900" }, // Orange is default (empty class)
	{ value: "yellow", labelKey: "colorYellow", hex: "#e6c229" },
	{ value: "green", labelKey: "colorGreen", hex: "#2f9d62" },
	{ value: "cyan", labelKey: "colorCyan", hex: "#1abc9c" },
	{ value: "blue", labelKey: "colorBlue", hex: "#3498db" },
	{ value: "purple", labelKey: "colorPurple", hex: "#9b59b6" },
	{ value: "gray", labelKey: "colorGray", hex: "#95a5a6" },
];

interface SimpleHTMLAnnotationSettings {
	defaultColor: AnnotationColor;
	hideAnnotations: boolean;
	enableUnderline: boolean;
	enableBackground: boolean;
	enableIcon: boolean;
	iconTooltipTrigger: IconTooltipTrigger;
	lightOpacity: number;
	darkOpacity: number;
	tooltipWidth: number;
	tooltipFontScale: number;
	submitShortcut: ModalShortcut;
	newlineShortcut: ModalShortcut;
	autoNormalizeAfterExit: boolean;
	enableMarkdown: boolean;
	language: Locale;
}

const DEFAULT_SETTINGS: SimpleHTMLAnnotationSettings = {
	defaultColor: DEFAULT_COLOR,
	hideAnnotations: false,
	enableUnderline: true,
	enableBackground: true,
	enableIcon: false,
	iconTooltipTrigger: 'hover',
	lightOpacity: 20,
	darkOpacity: 25,
	tooltipWidth: 800,
	tooltipFontScale: 100,
	submitShortcut: '',
	newlineShortcut: 'enter',
	autoNormalizeAfterExit: true,
	enableMarkdown: true,
	language: 'en'
}

function buildAnnotationClass(color: AnnotationColor): string {
	return color ? "ob-comment " + color : "ob-comment";
}

let forcedExpandedAnnotationRange: AnnotationOffsetRange | null = null;
let autoNormalizeAfterExitEnabled = true;

function setForcedExpandedAnnotationRange(range: AnnotationOffsetRange | null) {
	forcedExpandedAnnotationRange = range;
}

function setAutoNormalizeAfterExitEnabled(enabled: boolean) {
	autoNormalizeAfterExitEnabled = enabled;
}

function isSelectionInsideRange(from: number, to: number, range: AnnotationOffsetRange) {
	return from >= range.from && to <= range.to;
}

function getCollapsedCursorAnnotationRange(view: EditorView): AnnotationOffsetRange | null {
	const selection = view.state.selection.main;
	if (!selection.empty) return null;
	return findAnnotationRangeAtOffset(view.state.doc.toString(), selection.head);
}

export default class AnnotationPlugin extends Plugin {
  settings: SimpleHTMLAnnotationSettings;
  tooltipEl: HTMLElement | null = null;
  private tooltipRenderComponent: Component | null = null;
  private tooltipRenderId = 0;
  private tooltipLastRenderKey: string | null = null;
  locale: Locale = 'en';
  static lastUsedColor: AnnotationColor = DEFAULT_COLOR; // 记忆上次使用的颜色

	t(key: LocaleKey, params?: TranslationParam): string {
		const entry = STRINGS[this.locale][key];
		if (typeof entry === "function") {
			return (entry as (p: TranslationParam) => string)(params);
		}
		return entry;
	}

	private getColorLabel(key: LocaleKey): string {
		return this.t(key);
	}

	private getCommandRegistry() {
		// @ts-ignore internal API access
		return this.app.commands?.commands;
	}

	private setCommandName(id: string, name: string) {
		const registry = this.getCommandRegistry();
		if (!registry) return;
		const fullId = `${this.manifest.id}:${id}`;
		if (registry[fullId]) registry[fullId].name = name;
	}

	updateCommandNames() {
		this.setCommandName('add-annotation-html', this.t('cmdAddDefault'));
		COLOR_OPTIONS.forEach(opt => {
			if (opt.value === "") return;
			const colorLabel = this.getColorLabel(opt.labelKey);
			this.setCommandName(`add-annotation-${opt.value}`, this.t('cmdAddWithColor', colorLabel));
		});
		this.setCommandName('toggle-annotation-visibility', this.t('cmdToggleVisibility'));
		this.setCommandName('edit-current-annotation', this.t('cmdEditCurrent'));
		this.setCommandName('delete-current-annotation', this.t('cmdDeleteCurrent'));
		this.setCommandName('normalize-annotation-data-note-current', this.t('cmdNormalizeCurrent'));
		this.setCommandName('normalize-annotation-data-note-vault', this.t('cmdNormalizeVault'));
	}

	async onload() {
		await this.loadSettings();

		this.locale = this.settings.language ?? 'en';
		setAutoNormalizeAfterExitEnabled(this.settings.autoNormalizeAfterExit);

		// 初始化：从设置中读取默认颜色
		AnnotationPlugin.lastUsedColor = this.settings.defaultColor;
		this.updateStyles();

		// 注册设置页
		this.addSettingTab(new AnnotationSettingTab(this.app, this));

		// 0. 注册彩色圆点图标 (用于右键菜单)
		COLOR_OPTIONS.forEach(opt => {
			const iconId = opt.value ? `ob-annotation-icon-${opt.value}` : `ob-annotation-icon-default`;
			// 使用实心圆，显式设置 fill/stroke，避免被主题的 fill:none 覆盖导致看不见
			// Adjust cy to 25 per user request and allow overflow to fix clipping
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="66" height="66" viewBox="0 0 24 24" style="overflow: visible"><circle cx="12" cy="20" r="10" style="fill:${opt.hex};stroke:${opt.hex};stroke-width:1;" /></svg>`;
			addIcon(iconId, svg);
		});

		// 1. 注册“添加批注”命令
		this.addCommand({
			id: 'add-annotation-html',
			name: this.t('cmdAddDefault'),
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleAddCommand(editor);
			}
		});

		// 注册特定颜色命令
		COLOR_OPTIONS.forEach(opt => {
			if (opt.value === "") return;
			const colorLabel = this.getColorLabel(opt.labelKey);
			this.addCommand({
				id: `add-annotation-${opt.value}`,
				name: this.t('cmdAddWithColor', colorLabel),
				editorCallback: (editor: Editor) => {
					this.handleAddCommand(editor, opt.value);
				}
			});
		});
		
		// 注册一键开关命令
		this.addCommand({
			id: 'toggle-annotation-visibility',
			name: this.t('cmdToggleVisibility'),
			callback: async () => {
				this.settings.hideAnnotations = !this.settings.hideAnnotations;
				this.updateStyles();
				await this.saveSettings();
				
				if (this.settings.hideAnnotations) {
					new Notice(this.t('noticeHidden'));
				} else {
					new Notice(this.t('noticeShown'));
				}
			}
		});

		// 注册编辑/删除快捷键命令
		this.addCommand({
			id: 'edit-current-annotation',
			name: this.t('cmdEditCurrent'),
			editorCallback: (editor: Editor) => {
				this.handleEditCommand(editor);
			}
		});

		this.addCommand({
			id: 'delete-current-annotation',
			name: this.t('cmdDeleteCurrent'),
			editorCallback: (editor: Editor) => {
				this.handleDeleteCommand(editor);
			}
		});

		// 修复当前文件的批注 data-note 格式
	this.addCommand({
		id: 'normalize-annotation-data-note-current',
		name: this.t('cmdNormalizeCurrent'),
		editorCallback: (editor: Editor) => {
			this.normalizeCurrentFileAnnotations(editor);
		}
	});

		// 修复全库所有 Markdown 文件的批注 data-note
		this.addCommand({
			id: 'normalize-annotation-data-note-vault',
			name: this.t('cmdNormalizeVault'),
			callback: async () => {
				await this.normalizeAllMarkdownFiles();
			}
		});

		// 2. 注册 CodeMirror 扩展 (Live Preview 渲染)
		this.registerEditorExtension(livePreviewAnnotationPlugin);

		// 3. 初始化全局 Tooltip
		this.createTooltipElement();

		// 4. 注册全局鼠标悬浮事件 (桌面端)
		this.registerDomEvent(document, 'mouseover', (evt: MouseEvent) => {
			// 如果隐藏模式开启，不显示 tooltip
			if (document.body.classList.contains('ob-hide-annotations')) return;

                   const target = evt.target as HTMLElement;
                   if (this.shouldShowTooltipOnHover(evt, target)) {       
                           const note = target.getAttribute('data-note');  
							if (note) this.showTooltip(evt, note);
                   }
           });

		// 仅图标模式 + 悬浮触发时，需要跟踪鼠标移动以确保只有在图标区域才显示
		this.registerDomEvent(document, 'mousemove', (evt: MouseEvent) => {
			if (!this.isIconOnlyMode()) return;
			if (this.settings.iconTooltipTrigger !== 'hover') return;
			if (document.body.classList.contains('ob-hide-annotations')) return;

			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
                           const note = target.getAttribute('data-note');  
                           if (note && this.isEventOnIcon(evt, target)) {  
									this.showTooltip(evt, note);
                                   return;
                           }
                   }
                   this.hideTooltip();
           });

		this.registerDomEvent(document, 'mouseout', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
				this.hideTooltip();
			}
		});

		// 移动端/点击支持：点击批注显示 Tooltip
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			if (document.body.classList.contains('ob-hide-annotations')) return;
			
			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
                           if (this.shouldShowTooltipOnClick(evt, target)) {
                                   const note = target.getAttribute('data-note');
									if (note) this.showTooltip(evt, note);
                           }
                   } else {
                           // 点击空白处隐藏 (仅当不是 tooltip 本身)       
                           if (this.tooltipEl && !this.tooltipEl.contains(target)) {
					this.hideTooltip();
				}
			}
		});
		// 修正 mousedown: 只有当点击的不是批注时才隐藏，避免跟 click 冲突
		this.registerDomEvent(document, 'mousedown', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target && target.hasClass && target.hasClass('ob-comment')) {
				return; // 点击的是批注，交给 click 处理
			}
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

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				setForcedExpandedAnnotationRange(null);
			})
		);
	}

  onunload() {
          setAutoNormalizeAfterExitEnabled(false);
          setForcedExpandedAnnotationRange(null);
          this.unloadTooltipRenderComponent();
          if (this.tooltipEl) {
                  this.tooltipEl.remove();
          }
          document.body.classList.remove('ob-show-underline', 'ob-show-background', 'ob-show-icon', 'ob-hide-annotations', 'ob-icon-only-mode');
		const rootStyle = document.documentElement.style;
		rootStyle.removeProperty('--ob-annotation-bg-opacity-light');
		rootStyle.removeProperty('--ob-annotation-bg-opacity-dark');
		rootStyle.removeProperty('--ob-annotation-tooltip-width');
		rootStyle.removeProperty('--ob-annotation-tooltip-font-scale');
	}

	async loadSettings() {
		const data = await this.loadData() as Partial<SimpleHTMLAnnotationSettings> & { autoNormalizeNewlines?: boolean } | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});

		if (data && typeof data.autoNormalizeNewlines === "boolean") {
			if (data.autoNormalizeAfterExit === undefined) {
				this.settings.autoNormalizeAfterExit = data.autoNormalizeNewlines;
			}
		}

		const changed = this.enforceShortcutSettings();
		if (changed) {
			await this.saveData(this.settings);
		}
	}

	async saveSettings() {
		this.enforceShortcutSettings();
		await this.saveData(this.settings);
	}

	enforceShortcutSettings(showNotice = false): boolean {
		const normalized = normalizeShortcutSettings({
			submitShortcut: this.settings.submitShortcut,
			newlineShortcut: this.settings.newlineShortcut,
		});

		this.settings.submitShortcut = normalized.submitShortcut;
		this.settings.newlineShortcut = normalized.newlineShortcut;

		if (normalized.changed && showNotice) {
			new Notice(this.t('noticeShortcutConflict'));
		}

		return normalized.changed;
	}

	private isIconOnlyMode(): boolean {
		return this.settings.enableIcon && !this.settings.enableUnderline && !this.settings.enableBackground;
	}

	private isEventOnIcon(evt: MouseEvent, target: HTMLElement): boolean {
		const rects = target.getClientRects();
		if (!rects.length) return false;

		const lastRect = rects[rects.length - 1];
		const style = getComputedStyle(target, '::after');
		const iconWidth = parseFloat(style.width || '') || 14;
		const iconMarginLeft = parseFloat(style.marginLeft || '') || 2;

		const hitboxStartX = lastRect.right - iconWidth - iconMarginLeft;
		const x = evt.clientX;
		const y = evt.clientY;
		return x >= hitboxStartX && x <= lastRect.right && y >= lastRect.top && y <= lastRect.bottom;
	}

	private shouldShowTooltipOnHover(evt: MouseEvent, target: HTMLElement): boolean {
		if (!target || !target.hasClass || !target.hasClass('ob-comment')) return false;
		if (this.isIconOnlyMode()) {
			if (this.settings.iconTooltipTrigger !== 'hover') return false;
			return this.isEventOnIcon(evt, target);
		}
		return true;
	}

	private shouldShowTooltipOnClick(evt: MouseEvent, target: HTMLElement): boolean {
		if (!target || !target.hasClass || !target.hasClass('ob-comment')) return false;
		if (this.isIconOnlyMode()) {
			return this.isEventOnIcon(evt, target);
		}
		return true;
	}

	/**
	 * 根据当前设置更新全局样式（body class + CSS 变量），即时生效。
	 */
	updateStyles() {
		// 切换展示模式样式
		const iconOnlyMode = this.isIconOnlyMode();
		document.body.classList.toggle('ob-show-underline', this.settings.enableUnderline);
		document.body.classList.toggle('ob-show-background', this.settings.enableBackground);
		document.body.classList.toggle('ob-show-icon', this.settings.enableIcon);
		document.body.classList.toggle('ob-hide-annotations', this.settings.hideAnnotations);
		document.body.classList.toggle('ob-icon-only-mode', iconOnlyMode);

		// 同步 CSS 变量
		const clampOpacity = (value: number) => Math.min(Math.max(value, 0), 100) / 100;
		const rootStyle = document.documentElement.style;
		const lightAlpha = clampOpacity(this.settings.lightOpacity ?? DEFAULT_SETTINGS.lightOpacity);
		const darkAlpha = clampOpacity(this.settings.darkOpacity ?? DEFAULT_SETTINGS.darkOpacity);
		const tooltipWidth = this.settings.tooltipWidth > 0 ? this.settings.tooltipWidth : DEFAULT_SETTINGS.tooltipWidth;
		const fontScale = this.settings.tooltipFontScale > 0 ? this.settings.tooltipFontScale : DEFAULT_SETTINGS.tooltipFontScale;

		rootStyle.setProperty('--ob-annotation-bg-opacity-light', lightAlpha.toString());
		rootStyle.setProperty('--ob-annotation-bg-opacity-dark', darkAlpha.toString());
		rootStyle.setProperty('--ob-annotation-tooltip-width', `${tooltipWidth}px`);
		rootStyle.setProperty('--ob-annotation-tooltip-font-scale', `${fontScale / 100}`);
	}

	// --- 核心逻辑区 ---

	/**
	 * 命令触发：编辑当前批注
	 */
	handleEditCommand(editor: Editor) {
		const existing = this.findAnnotationAtCursor(editor);
		if (existing) {
			new AnnotationModal(this.app, existing.note, existing.color || DEFAULT_COLOR, (newNote, newColor) => {
				const safeNote = escapeDataNote(newNote);
				const replacement = `<span class="${buildAnnotationClass(newColor)}" data-note="${safeNote}">${existing.text}</span>`;
				editor.replaceRange(replacement, existing.from, existing.to);
			}, this.locale, this.t.bind(this), this.settings.submitShortcut, this.settings.newlineShortcut).open();
		} else {
			new Notice(this.t('noticeNoAnnotation'));
		}
	}

	/**
	 * 命令触发：删除当前批注
	 */
	handleDeleteCommand(editor: Editor) {
		const existing = this.findAnnotationAtCursor(editor);
		if (existing) {
			editor.replaceRange(existing.text, existing.from, existing.to);
		} else {
			new Notice(this.t('noticeNoAnnotation'));
		}
	}

	/**
	 * 处理右键菜单逻辑
	 */
	handleContextMenu(menu: Menu, editor: Editor) {
		// 检查光标下是否存在已有的批注
		const existingAnnotation = this.findAnnotationAtCursor(editor);

		if (existingAnnotation) {
			// === 场景 A：光标在批注上 ===
			
			menu.addSeparator();

			// 1. 添加批注
			menu.addItem((item) => {
				item
					.setTitle(this.t('ctxAdd'))
					.setIcon("highlighter")
					.onClick(() => {
						const selection = editor.getSelection();
						if(selection) this.performAddAnnotation(editor, selection);
						else new Notice(this.t('noticeNeedSelectionAdd'));
					});
			});

			// 2. 编辑批注
			menu.addItem((item) => {
				item
					.setTitle(this.t('ctxEdit'))
					.setIcon("pencil")
					.onClick(() => {
						this.handleEditCommand(editor);
					});
			});

				// 3. 修改颜色 (子菜单)
				menu.addItem((item) => {
					item.setTitle(this.t('ctxChangeColor')).setIcon("palette");
					const subMenu = (item as SubmenuCapableMenuItem).setSubmenu?.();
					if (!subMenu) return;

					COLOR_OPTIONS.forEach(opt => {
							const iconId = opt.value ? `ob-annotation-icon-${opt.value}` : `ob-annotation-icon-default`;
							const colorLabel = this.getColorLabel(opt.labelKey);
                                           subMenu.addItem((subItem: MenuItem) => {
                                                   subItem.setTitle(colorLabel)
                                                              .setIcon(iconId) // 使用注册的彩色图标
                                                              .onClick(() => {
									   // 直接修改颜色
									   const replacement = `<span class="${buildAnnotationClass(opt.value)}" data-note="${escapeDataNote(existingAnnotation.note)}">${existingAnnotation.text}</span>`;
									   editor.replaceRange(replacement, existingAnnotation.from, existingAnnotation.to);
								   });
						});
						});
					});

					// 4. 删除批注
					menu.addItem((item) => {
				item
					.setTitle(this.t('ctxDelete'))
					.setIcon("trash")
					.onClick(() => {
						this.handleDeleteCommand(editor);
					});
			});

		} else {
			// === 场景 B：光标不在批注上 -> 检查是否有选区 -> 显示 添加 ===
			const selection = editor.getSelection();
			if (selection && selection.trim().length > 0) {
				menu.addSeparator();

				menu.addItem((item) => {
					item
						.setTitle(this.t('ctxAdd'))
						.setIcon("highlighter")
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
	handleAddCommand(editor: Editor, forcedColor: AnnotationColor | null = null) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice(this.t('noticeNeedSelection'));
			return;
		}
		// 检查选区内是否已经包含了 HTML 标签，防止嵌套（可选）
		if (selection.includes('<span class="ob-comment"')) {
			new Notice(this.t('noticeNoNested'));
			return;
		}
		this.performAddAnnotation(editor, selection, forcedColor);
	}

	/**
	 * 执行添加批注动作
	 */
	performAddAnnotation(editor: Editor, selectionText: string, forcedColor: AnnotationColor | null = null) {
		// 优先使用强制颜色(如来自快捷命令)，否则使用记忆的颜色
		const initialColor = forcedColor !== null ? forcedColor : AnnotationPlugin.lastUsedColor;

		new AnnotationModal(this.app, "", initialColor, (noteContent, colorChoice) => {
			// 更新记忆的颜色 (通常即使是强制颜色操作，也更新记忆比较符合直觉，方便连续操作)
			AnnotationPlugin.lastUsedColor = colorChoice;

			const safeNote = escapeDataNote(noteContent);
			const replacement = `<span class="${buildAnnotationClass(colorChoice)}" data-note="${safeNote}">${selectionText}</span>`;
			editor.replaceSelection(replacement);
		}, this.locale, this.t.bind(this), this.settings.submitShortcut, this.settings.newlineShortcut).open();
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
			const colorClass = match[1] || "";
			const noteContent = match[2];  // data-note="..."
			const innerText = match[3];    // <span>包裹的文本</span>
			
			const startOffset = match.index;
			const endOffset = startOffset + fullMatch.length;

			// 判断光标位置是否在这个范围内
			if (cursorOffset >= startOffset && cursorOffset <= endOffset) {
				return {
					from: editor.offsetToPos(startOffset),
					to: editor.offsetToPos(endOffset),
					text: innerText, // 原文
					note: decodeDataNote(noteContent), // 笔记内容（解码后）
					color: colorClass
				};
			}
		}
		return null;
	}

	// --- Tooltip 相关逻辑 ---
	createTooltipElement() {
		this.tooltipEl = document.body.createDiv({ cls: 'ob-annotation-tooltip' });
	}

	private unloadTooltipRenderComponent() {
		this.tooltipRenderComponent?.unload();
		this.tooltipRenderComponent = null;
	}

	private updateTooltipPosition(evt: MouseEvent) {
		if (!this.tooltipEl) return;

		const x = evt.pageX;
		const y = evt.pageY - 40;
		this.tooltipEl.style.left = `${x}px`;
		this.tooltipEl.style.top = `${y}px`;
	}

	showTooltip(evt: MouseEvent, text: string) {
		if (!this.tooltipEl) return;
		
		this.tooltipEl.addClass('is-visible');
		this.updateTooltipPosition(evt);

		// tooltip content is rendered below (after renderKey check)
		// 解码 text 中的 HTML 实体（如 &#10; -> \n），确保 Markdown 表格等语法能正确识别换行
		const decodedText = decodeDataNote(text);
		// 使用当前激活文件的路径作为 sourcePath，以支持相对路径链接等
		const sourcePath = this.app.workspace.getActiveFile()?.path || "";
		const renderKey = `${this.settings.enableMarkdown ? "md" : "text"}|${sourcePath}|${decodedText}`;
		if (renderKey === this.tooltipLastRenderKey) return;
		this.tooltipLastRenderKey = renderKey;

		this.tooltipEl.empty();
		this.unloadTooltipRenderComponent();

		if (this.settings.enableMarkdown) {
			const renderId = ++this.tooltipRenderId;
			const component = new Component();
			component.load();
			this.tooltipRenderComponent = component;

			const renderContainer = document.createElement('div');
			void MarkdownRenderer.render(this.app, decodedText, renderContainer, sourcePath, component)
				.then(() => {
					if (!this.tooltipEl) return;
					if (renderId !== this.tooltipRenderId) return;
					this.tooltipEl.empty();
					this.tooltipEl.appendChild(renderContainer);
				})
				.catch((err) => {
					console.error('[hover-annotations] Failed to render tooltip markdown', err);
				});
		} else {
			// 关闭 Markdown 渲染时，直接显示纯文本
			this.tooltipEl.createEl("pre", { text: decodedText, cls: "ob-annotation-tooltip-plain" });
		}

	}

	hideTooltip() {
		if (!this.tooltipEl) return;
		this.tooltipEl.removeClass('is-visible');

		this.tooltipRenderId++;
		this.tooltipLastRenderKey = null;
		this.unloadTooltipRenderComponent();
		this.tooltipEl.empty();
	}

	/**
	 * 修复当前文件中所有批注的 data-note（处理旧版直接换行/特殊字符未转义的情况）
	 */
	private normalizeCurrentFileAnnotations(editor: Editor) {
		const docText = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor());
		const { text, changed, cursorOffset: nextCursorOffset } = normalizeTextWithCursor(docText, cursorOffset);

		if (!changed) {
			new Notice(this.t('noticeNoFixNeeded'));
			return;
		}
		
		// 使用 replaceRange 替代 setValue 以保留撤销历史
		const lastLine = editor.lastLine();
		const lastLineLen = editor.getLine(lastLine).length;
		setForcedExpandedAnnotationRange(findAnnotationRangeAtOffset(text, nextCursorOffset));
		editor.replaceRange(text, { line: 0, ch: 0 }, { line: lastLine, ch: lastLineLen });
		
		editor.setCursor(editor.offsetToPos(nextCursorOffset));
		new Notice(this.t('noticeFixedCurrent'));
	}

	/**
	 * 扫描并修复库内所有 Markdown 文件的批注 data-note
	 */
	private async normalizeAllMarkdownFiles() {
		new Notice(this.t('noticeScanStart'));
		const files = this.app.vault.getMarkdownFiles();
		const filesToFix: TFile[] = [];

		// 1. 扫描阶段
		for (const file of files) {
			const original = await this.app.vault.read(file);
			const { changed } = normalizeAnnotationsInText(original);
			if (changed) {
				filesToFix.push(file);
			}
		}

		if (filesToFix.length === 0) {
			new Notice(this.t('noticeNoFixNeeded'));
			return;
		}

		// 2. 确认阶段
		new BatchFixConfirmModal(this.app, filesToFix, () => {
			void this.applyNormalizationToFiles(filesToFix);
		}, this.t.bind(this)).open();
	}

	private async applyNormalizationToFiles(filesToFix: TFile[]) {
		let fixedCount = 0;
		// 3. 执行阶段
		for (const file of filesToFix) {
			const original = await this.app.vault.read(file);
			const { text, changed } = normalizeAnnotationsInText(original);
			if (changed) {
				await this.app.vault.modify(file, text);
				fixedCount++;
			}
		}
		new Notice(this.t('noticeFixedVault', fixedCount));
	}
}

class AnnotationSettingTab extends PluginSettingTab {
	plugin: AnnotationPlugin;

	constructor(app: App, plugin: AnnotationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		let iconTriggerSetting: Setting | null = null;
		const t = this.plugin.t.bind(this.plugin);

		// 1. 基础设置 (General Settings)
		new Setting(containerEl).setName(t('settingsGeneral')).setHeading();

		new Setting(containerEl)
			.setName(t('settingLanguageName'))
			.setDesc(t('settingLanguageDesc'))
			.addDropdown(dropdown => {
				dropdown.addOption('en', t('settingLanguageEn'));
				dropdown.addOption('zh', t('settingLanguageZh'));
				dropdown.setValue(this.plugin.settings.language ?? 'en')
					.onChange(async (value) => {
				const nextLocale: Locale = value === 'zh' ? 'zh' : 'en';
				this.plugin.settings.language = nextLocale;
				this.plugin.locale = nextLocale;
				await this.plugin.saveSettings();
				this.plugin.updateCommandNames();
				this.display(); // refresh labels
			});
	});

		new Setting(containerEl)
			.setName(t('settingDefaultColorName'))
			.setDesc(t('settingDefaultColorDesc'))
			.addDropdown(dropdown => {
				COLOR_OPTIONS.forEach(opt => {
					dropdown.addOption(opt.value, t(opt.labelKey));
				});
				dropdown.setValue(this.plugin.settings.defaultColor)
					.onChange(async (value) => {
						this.plugin.settings.defaultColor = value;
						AnnotationPlugin.lastUsedColor = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t('settingHideDefaultName'))
			.setDesc(t('settingHideDefaultDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideAnnotations)
				.onChange(async (value) => {
					this.plugin.settings.hideAnnotations = value;
					this.plugin.updateStyles();
					await this.plugin.saveSettings();
				}));

		// 2. 外观样式 (Appearance)
		new Setting(containerEl).setName(t('settingsAppearance')).setHeading();

		new Setting(containerEl)
			.setName(t('settingUnderlineName'))
			.setDesc(t('settingUnderlineDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableUnderline)
				.onChange(async (value) => {
					this.plugin.settings.enableUnderline = value;
					this.plugin.updateStyles();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settingBackgroundName'))
			.setDesc(t('settingBackgroundDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableBackground)
				.onChange(async (value) => {
					this.plugin.settings.enableBackground = value;
					this.plugin.updateStyles();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settingIconName'))
			.setDesc(t('settingIconDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableIcon)
					.onChange(async (value) => {
						this.plugin.settings.enableIcon = value;
						this.plugin.updateStyles();
						iconTriggerSetting?.setDisabled(!value);
						await this.plugin.saveSettings();
					}));

		iconTriggerSetting = new Setting(containerEl)
			.setName(t('settingIconTriggerName'))
			.setDesc(t('settingIconTriggerDesc'))
			.addDropdown(dropdown => {
				dropdown.addOption('hover', t('settingIconHover'));
				dropdown.addOption('click', t('settingIconClick'));
				dropdown.setValue(this.plugin.settings.iconTooltipTrigger)
					.onChange(async (value) => {
						const nextValue: IconTooltipTrigger = value === 'click' ? 'click' : 'hover';
						this.plugin.settings.iconTooltipTrigger = nextValue;
						await this.plugin.saveSettings();
					});
			})
			.setDisabled(!this.plugin.settings.enableIcon);

		new Setting(containerEl)
			.setName(t('settingLightOpacityName'))
			.setDesc(t('settingLightOpacityDesc'))
			.addSlider(slider => slider
				.setLimits(0, 100, 5)
				.setValue(this.plugin.settings.lightOpacity)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.lightOpacity = value;
					this.plugin.updateStyles();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settingDarkOpacityName'))
			.setDesc(t('settingDarkOpacityDesc'))
			.addSlider(slider => slider
				.setLimits(0, 100, 5)
				.setValue(this.plugin.settings.darkOpacity)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.darkOpacity = value;
					this.plugin.updateStyles();
					await this.plugin.saveSettings();
				}));

		// 3. 交互体验 (Interaction)
		new Setting(containerEl).setName(t('settingsInteraction')).setHeading();

		new Setting(containerEl)
			.setName(t('settingTooltipWidthName'))
			.setDesc(t('settingTooltipWidthDesc'))
			.addText(text => text
				.setPlaceholder("800")
				.setValue(this.plugin.settings.tooltipWidth.toString())
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num)) {
						this.plugin.settings.tooltipWidth = num;
						// Update styles immediately
						this.plugin.updateStyles();
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName(t('settingSubmitShortcutName'))
			.setDesc(t('settingSubmitShortcutDesc'))
			.addDropdown(dropdown => {
				(["", "enter", "shift-enter", "ctrl-enter"] as ModalShortcut[]).forEach(value => {
					dropdown.addOption(value, getShortcutLabel(t, value));
				});
				dropdown.setValue(this.plugin.settings.submitShortcut)
					.onChange(async (value) => {
						this.plugin.settings.submitShortcut = value as ModalShortcut;
						const changed = this.plugin.enforceShortcutSettings(true);
						await this.plugin.saveSettings();
						if (changed) this.display();
					});
			});

		new Setting(containerEl)
			.setName(t('settingNewlineShortcutName'))
			.setDesc(t('settingNewlineShortcutDesc'))
			.addDropdown(dropdown => {
				(["enter", "shift-enter", "ctrl-enter"] as ModalShortcut[]).forEach(value => {
					dropdown.addOption(value, getShortcutLabel(t, value));
				});
				dropdown.setValue(this.plugin.settings.newlineShortcut)
					.onChange(async (value) => {
						this.plugin.settings.newlineShortcut = value as ModalShortcut;
						const changed = this.plugin.enforceShortcutSettings(true);
						await this.plugin.saveSettings();
						if (changed) this.display();
					});
			});

		// 调节字体大小：按档位增减，最多 ±3 档
		const fontStepSize = 10; // 每档 10%
		const fontStepMax = 3;
		const clampStep = (val: number) => Math.min(Math.max(val, -fontStepMax), fontStepMax);
		const getCurrentStep = () => {
			const base = DEFAULT_SETTINGS.tooltipFontScale;
			const current = this.plugin.settings.tooltipFontScale ?? base;
			return clampStep(Math.round((current - base) / fontStepSize));
		};
		const formatStepLabel = (step: number) => {
			if (step === 0) return t('settingFontStepDefault');
			const abs = Math.abs(step);
			if (abs === 1) return t('settingFontStep', step);
			return t('settingFontStepPlural', step);
		};

		const fontSizeSetting = new Setting(containerEl).setName(t('settingFontAdjustName'));
		fontSizeSetting.descEl.empty();
		fontSizeSetting.descEl.createSpan({ text: t('settingFontAdjustDescPrefix') });
		const fontStepLabelEl = fontSizeSetting.descEl.createSpan({ text: formatStepLabel(getCurrentStep()) });

		const applyFontStep = async (delta: number) => {
			const base = DEFAULT_SETTINGS.tooltipFontScale;
			const nextStep = clampStep(getCurrentStep() + delta);
			const nextScale = base + nextStep * fontStepSize;
			this.plugin.settings.tooltipFontScale = nextScale;
			this.plugin.updateStyles();
			await this.plugin.saveSettings();
			fontStepLabelEl.setText(formatStepLabel(nextStep));
		};

		fontSizeSetting.addButton(button => {
			button.setButtonText(t('settingFontSmaller'));
			button.onClick(async () => { await applyFontStep(-1); });
		});

		fontSizeSetting.addButton(button => {
			button.setButtonText(t('settingFontLarger'));
			button.setCta();
			button.onClick(async () => { await applyFontStep(1); });
		});

		new Setting(containerEl)
			.setName(t('settingMarkdownName'))
			.setDesc(t('settingMarkdownDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableMarkdown)
				.onChange(async (value) => {
					this.plugin.settings.enableMarkdown = value;
					await this.plugin.saveSettings();
				}));

		// 4. 高级与维护 (Advanced)
		new Setting(containerEl).setName(t('settingsAdvanced')).setHeading();

		new Setting(containerEl)
			.setName(t('settingAutoNormalizeAfterExitName'))
			.setDesc(t('settingAutoNormalizeAfterExitDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoNormalizeAfterExit)
				.onChange(async (value) => {
					this.plugin.settings.autoNormalizeAfterExit = value;
					setAutoNormalizeAfterExitEnabled(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settingFixDataName'))
			.setDesc(t('settingFixDataDesc'))
			.addButton(button => button
				.setButtonText(t('settingFixDataButton'))
				.onClick(async () => {
					// 调用 plugin 中的方法
					// @ts-ignore: private access
					await this.plugin.normalizeAllMarkdownFiles();
				}));
		
		new Setting(containerEl)
			.setName(t('settingExportName'))
			.setDesc(t('settingExportDesc'))
			.addButton(button => button
				.setButtonText(t('settingExportButton'))
				.onClick(async () => {
					const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
					if (view) {
						const text = view.editor.getValue();
						const regex = /<span class="ob-comment(?:\s+[\w-]+)?" data-note="([\s\S]*?)">([\s\S]*?)<\/span>/g;
						let match;
						let output = this.plugin.t('exportHeading');
						while ((match = regex.exec(text)) !== null) {
							const note = decodeDataNote(match[1]);
							const original = match[2];
							output += `- **${this.plugin.t('exportOriginal')}**: "${original}"\n  - **${this.plugin.t('exportAnnotation')}**: ${note}\n`;
						}
						await navigator.clipboard.writeText(output);
						new Notice(this.plugin.t('noticeCopied'));
					} else {
						new Notice(this.plugin.t('noticeOpenDoc'));
					}
				}));
	}
}

// --- 弹窗输入框类 (升级：支持默认值 + 颜色选择) ---
class AnnotationModal extends Modal {
	result: string;
	defaultValue: string;
	defaultColor: AnnotationColor;
	selectedColor: AnnotationColor;
	submitShortcut: ModalShortcut;
	newlineShortcut: ModalShortcut;
	colorLabelEl: HTMLElement | null = null; // 显示当前选中的颜色名称
	onSubmit: (result: string, color: AnnotationColor) => void;
	locale: Locale;
	translate: TranslateFn;

	constructor(
		app: App,
		defaultValue: string,
		defaultColor: AnnotationColor,
		onSubmit: (result: string, color: AnnotationColor) => void,
		locale: Locale,
		translate: TranslateFn,
		submitShortcut: ModalShortcut,
		newlineShortcut: ModalShortcut
	) {
		super(app);
		this.defaultValue = defaultValue;
		this.defaultColor = defaultColor;
		this.selectedColor = defaultColor || DEFAULT_COLOR; // 确保有选中值
		this.onSubmit = onSubmit;
		this.locale = locale;
		this.translate = translate;
		this.submitShortcut = submitShortcut;
		this.newlineShortcut = newlineShortcut;
		this.modalEl.addClass("ob-annotation-modal-container");
	}

	onOpen() {
		const { contentEl } = this;
		const headerRow = contentEl.createDiv({ cls: "annotation-header-row" });
		headerRow.createEl("h2", { text: this.defaultValue ? this.translate('modalTitleEdit') : this.translate('modalTitleNew') });
		headerRow.createDiv({
			cls: "annotation-key-hint",
			text: formatModalKeyHint(this.translate, this.submitShortcut, this.newlineShortcut)
		});

		const inputEl = contentEl.createEl("textarea", {
			cls: "annotation-input",
			attr: { rows: "3" }
		});

		// Auto-resize logic
		const adjustHeight = () => {
			inputEl.setCssProps({ height: 'auto' });
			inputEl.setCssProps({ height: inputEl.scrollHeight + 'px' });
		};
		inputEl.addEventListener('input', adjustHeight);

		// 填入默认值
		inputEl.value = this.defaultValue;
		// 稍微延迟聚焦，确保 UI 渲染完成
		setTimeout(() => {
			adjustHeight(); // Initial adjustment
			inputEl.focus();
			// 如果是编辑模式，全选文本方便修改
			if (this.defaultValue) inputEl.select();
		}, 0);

		// --- 颜色选择区域 ---
		const colorWrapper = contentEl.createDiv({ cls: "annotation-color-field" });

		const colorHeader = colorWrapper.createDiv({
			cls: "setting-item-name", 
			attr: { style: "margin-bottom: 8px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;" } 
		});
		colorHeader.createSpan({ text: this.translate('modalColorLabel') });
		this.colorLabelEl = colorHeader.createSpan({ 
			cls: "annotation-color-label", 
			attr: { style: "font-weight: normal; font-size: 0.9em; color: var(--text-muted);" } 
		});

		const colorRow = colorWrapper.createDiv({ cls: "annotation-color-row" });
		const colorContainer = colorRow.createDiv({ cls: "annotation-color-container" });
		const btnContainer = colorRow.createDiv({ cls: "modal-button-container inline" });

		// 渲染颜色选项圆点
		COLOR_OPTIONS.forEach(opt => {
			const colorLabel = this.translate(opt.labelKey);
			const colorItem = colorContainer.createDiv({ 
				cls: "annotation-color-item",
				attr: { "aria-label": colorLabel, "title": colorLabel, "tabindex": "0" } // 支持键盘 Tab 聚焦
			});
			colorItem.style.backgroundColor = opt.hex;

			// 检查是否为当前选中颜色
			if (opt.value === this.selectedColor) {
				colorItem.addClass("is-active");
				this.updateColorLabel(colorLabel);
			}

			// 选中逻辑
			const selectAction = () => {
				// 移除其他选中状态
				colorContainer.querySelectorAll(".annotation-color-item").forEach(el => el.removeClass("is-active"));
				// 选中当前
				colorItem.addClass("is-active");
				// 更新状态
				this.selectedColor = opt.value;
				this.updateColorLabel(colorLabel);
			};

			// 鼠标点击
			colorItem.addEventListener("click", selectAction);

			// 键盘操作 (Enter 或 Space)
			colorItem.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					selectAction();
				}
			});
		});

		inputEl.addEventListener("keydown", (e) => this.handleInputKeydown(e, inputEl, adjustHeight));

		// 确定按钮
		const submitBtn = btnContainer.createEl("button", { text: this.translate('modalConfirm'), cls: "mod-cta" });
		submitBtn.addEventListener("click", () => {
			this.submit(inputEl.value);
		});
	}

	updateColorLabel(label: string) {
		if (this.colorLabelEl) {
			this.colorLabelEl.setText(`${this.translate('modalColorCurrent')}${label}`);
		}
	}

	private insertNewline(inputEl: HTMLTextAreaElement, adjustHeight: () => void) {
		const start = inputEl.selectionStart ?? inputEl.value.length;
		const end = inputEl.selectionEnd ?? start;
		inputEl.setRangeText("\n", start, end, "end");
		adjustHeight();
	}

	private handleInputKeydown(e: KeyboardEvent, inputEl: HTMLTextAreaElement, adjustHeight: () => void) {
		if (e.key !== "Enter") return;

		if (isShortcutEvent(e, this.submitShortcut)) {
			e.preventDefault();
			this.submit(inputEl.value);
			return;
		}

		if (isShortcutEvent(e, this.newlineShortcut)) {
			e.preventDefault();
			this.insertNewline(inputEl, adjustHeight);
			return;
		}

		e.preventDefault();
	}

	submit(value: string) {
		this.onSubmit(value, this.selectedColor);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// --- 批量修复确认弹窗 ---
class BatchFixConfirmModal extends Modal {
	filesToFix: TFile[];
	onConfirm: () => void;
	translate: TranslateFn;

	constructor(app: App, filesToFix: TFile[], onConfirm: () => void, translate: TranslateFn) {
		super(app);
		this.filesToFix = filesToFix;
		this.onConfirm = onConfirm;
		this.translate = translate;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: this.translate('batchTitle') });

		contentEl.createEl("p", { 
			text: this.translate('batchSummary', this.filesToFix.length) 
		});
		
		contentEl.createEl("p", { 
			text: this.translate('batchWarning'),
			cls: "mod-warning"
		});

		// 移除了文件列表预览区域

		const btnContainer = contentEl.createDiv({ cls: "modal-button-container", attr: { style: "display: flex; justify-content: flex-end; gap: 10px;" } });
		
		const cancelBtn = btnContainer.createEl("button", { text: this.translate('batchCancel') });
		cancelBtn.addEventListener("click", () => this.close());

		const confirmBtn = btnContainer.createEl("button", { text: this.translate('batchConfirm', this.filesToFix.length), cls: "mod-cta" });
		confirmBtn.addEventListener("click", () => {
			this.close();
			this.onConfirm();
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}

// --- CodeMirror 6 扩展 (保持不变) ---
const livePreviewAnnotationPlugin = ViewPlugin.fromClass(class {
	decorations: DecorationSet;
	private lastCollapsedCursorAnnotationRange: AnnotationOffsetRange | null;
	private normalizeTimer: number | null = null;
	private isApplyingNormalization = false;

	constructor(view: EditorView) {
		this.lastCollapsedCursorAnnotationRange = getCollapsedCursorAnnotationRange(view);
		this.decorations = this.buildDecorations(view);
	}

	destroy() {
		this.clearNormalizeTimer();
	}

	update(update: ViewUpdate) {
		const currentCollapsedCursorAnnotationRange = getCollapsedCursorAnnotationRange(update.view);

		if (this.isApplyingNormalization && update.docChanged) {
			this.isApplyingNormalization = false;
		}

		if (forcedExpandedAnnotationRange && update.selectionSet && !update.docChanged) {
			const selection = update.state.selection.main;
			if (!isSelectionInsideRange(selection.from, selection.to, forcedExpandedAnnotationRange)) {
				setForcedExpandedAnnotationRange(null);
			}
		}

		this.updateAutoNormalization(update, currentCollapsedCursorAnnotationRange);
		this.lastCollapsedCursorAnnotationRange = currentCollapsedCursorAnnotationRange;

		if (update.docChanged || update.viewportChanged || update.selectionSet) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	private clearNormalizeTimer() {
		if (this.normalizeTimer !== null) {
			window.clearTimeout(this.normalizeTimer);
			this.normalizeTimer = null;
		}
	}

	private updateAutoNormalization(update: ViewUpdate, currentRange: AnnotationOffsetRange | null) {
		if (!autoNormalizeAfterExitEnabled) {
			this.clearNormalizeTimer();
			return;
		}

		if (!update.docChanged && !update.selectionSet) return;

		const selection = update.state.selection.main;
		const action = getAutoNormalizeAction({
			previousRange: this.lastCollapsedCursorAnnotationRange,
			currentRange,
			selectionEmpty: selection.empty,
			selectionSet: update.selectionSet,
			docChanged: update.docChanged,
			hasPendingTimer: this.normalizeTimer !== null,
		});

		if (action === "cancel") {
			this.clearNormalizeTimer();
			return;
		}

		if (action === "schedule") {
			this.scheduleNormalization(update.view);
		}
	}

	private scheduleNormalization(view: EditorView) {
		this.clearNormalizeTimer();
		this.normalizeTimer = window.setTimeout(() => {
			this.normalizeTimer = null;
			void this.applyNormalization(view);
		}, AUTO_NORMALIZE_IDLE_MS);
	}

	private applyNormalization(view: EditorView) {
		if (!autoNormalizeAfterExitEnabled) return false;

		const selection = view.state.selection.main;
		if (!selection.empty) return false;
		if (getCollapsedCursorAnnotationRange(view) !== null) return false;

		const docText = view.state.doc.toString();
		if (!docText.includes('data-note="')) return false;

		const { text, changed, cursorOffset } = normalizeTextWithCursor(docText, selection.head);
		if (!changed) return false;

		this.isApplyingNormalization = true;
		view.dispatch({
			changes: { from: 0, to: docText.length, insert: text },
			selection: { anchor: cursorOffset },
		});
		return true;
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
			const colorClass = match[1] || "";
			const noteContent = match[2];
			const visibleText = match[3];
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
			const isForcedExpanded = forcedExpandedAnnotationRange !== null &&
				startPos === forcedExpandedAnnotationRange.from &&
				endPos === forcedExpandedAnnotationRange.to;

			if (isCursorInside || isForcedExpanded) continue;

			builder.add(openingTagFrom, openingTagTo, Decoration.replace({}));
			builder.add(contentFrom, contentTo, Decoration.mark({
				class: buildAnnotationClass(colorClass),
				attributes: { "data-note": noteText }
			}));
			builder.add(closingTagFrom, closingTagTo, Decoration.replace({}));
		}

		return builder.finish();
	}
}, {
	decorations: v => v.decorations
});
