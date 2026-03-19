export type ModalShortcut = "" | "enter" | "shift-enter" | "ctrl-enter";

export interface ShortcutEventLike {
	key: string;
	shiftKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
}

type ShortcutTranslator = (key: string, param?: string) => string;

const VALID_SHORTCUTS: ModalShortcut[] = ["", "enter", "shift-enter", "ctrl-enter"];
const DEFAULT_NEWLINE_SHORTCUT: ModalShortcut = "enter";
const DEFAULT_SUBMIT_SHORTCUT: ModalShortcut = "";

function isValidShortcut(value: unknown): value is ModalShortcut {
	return typeof value === "string" && VALID_SHORTCUTS.includes(value as ModalShortcut);
}

export function normalizeShortcutSettings(input: {
	submitShortcut?: unknown;
	newlineShortcut?: unknown;
}): {
	submitShortcut: ModalShortcut;
	newlineShortcut: ModalShortcut;
	changed: boolean;
} {
	const originalSubmit = input.submitShortcut;
	const originalNewline = input.newlineShortcut;

	const submitShortcut = isValidShortcut(originalSubmit) ? originalSubmit : DEFAULT_SUBMIT_SHORTCUT;
	let newlineShortcut = isValidShortcut(originalNewline) && originalNewline !== ""
		? originalNewline
		: DEFAULT_NEWLINE_SHORTCUT;

	let nextSubmit = submitShortcut;
	if (nextSubmit !== "" && nextSubmit === newlineShortcut) {
		nextSubmit = DEFAULT_SUBMIT_SHORTCUT;
	}

	if (newlineShortcut === "") {
		newlineShortcut = DEFAULT_NEWLINE_SHORTCUT;
	}

	return {
		submitShortcut: nextSubmit,
		newlineShortcut,
		changed: nextSubmit !== originalSubmit || newlineShortcut !== originalNewline,
	};
}

export function getShortcutLabel(t: ShortcutTranslator, shortcut: ModalShortcut): string {
	switch (shortcut) {
		case "enter":
			return t("modalShortcutEnter");
		case "shift-enter":
			return t("modalShortcutShiftEnter");
		case "ctrl-enter":
			return t("modalShortcutCtrlEnter");
		default:
			return t("modalShortcutNone");
	}
}

export function formatModalKeyHint(
	t: ShortcutTranslator,
	submitShortcut: ModalShortcut,
	newlineShortcut: ModalShortcut
): string {
	const parts: string[] = [];
	if (submitShortcut) {
		parts.push(`${t("modalHintSubmitPrefix")}${getShortcutLabel(t, submitShortcut)}`);
	}
	parts.push(`${t("modalHintNewlinePrefix")}${getShortcutLabel(t, newlineShortcut)}`);
	return parts.join(t("modalHintSeparator"));
}

export function isShortcutEvent(evt: ShortcutEventLike, shortcut: ModalShortcut): boolean {
	if (!shortcut || evt.key !== "Enter" || evt.altKey) return false;

	const shiftKey = !!evt.shiftKey;
	const ctrlLike = !!evt.ctrlKey || !!evt.metaKey;

	switch (shortcut) {
		case "enter":
			return !shiftKey && !ctrlLike;
		case "shift-enter":
			return shiftKey && !ctrlLike;
		case "ctrl-enter":
			return !shiftKey && ctrlLike;
		default:
			return false;
	}
}
