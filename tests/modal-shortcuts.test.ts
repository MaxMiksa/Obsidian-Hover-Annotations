import * as assert from "node:assert/strict";
import test = require("node:test");

import {
	formatModalKeyHint,
	getShortcutLabel,
	isShortcutEvent,
	normalizeShortcutSettings,
	type ModalShortcut,
} from "../modal-shortcuts";

const t = (key: string, param?: string): string => {
	const labels: Record<string, string> = {
		modalShortcutNone: "None",
		modalShortcutEnter: "Enter",
		modalShortcutShiftEnter: "Shift+Enter",
		modalShortcutCtrlEnter: "Ctrl+Enter",
		modalHintSubmitPrefix: "Submit: ",
		modalHintNewlinePrefix: "Newline: ",
		modalHintSeparator: "; ",
	};
	return key === "modalShortcutLabel" ? `${param}` : labels[key];
};

test("formatModalKeyHint omits submit hint when unset", () => {
	assert.equal(
		formatModalKeyHint(t, "", "enter"),
		"Newline: Enter"
	);
});

test("formatModalKeyHint includes submit and newline hints when both configured", () => {
	assert.equal(
		formatModalKeyHint(t, "ctrl-enter", "shift-enter"),
		"Submit: Ctrl+Enter; Newline: Shift+Enter"
	);
});

test("getShortcutLabel renders all supported options", () => {
	const cases: [ModalShortcut, string][] = [
		["", "None"],
		["enter", "Enter"],
		["shift-enter", "Shift+Enter"],
		["ctrl-enter", "Ctrl+Enter"],
	];

	for (const [value, expected] of cases) {
		assert.equal(getShortcutLabel(t, value), expected);
	}
});

test("isShortcutEvent matches Enter variants correctly", () => {
	assert.equal(isShortcutEvent({ key: "Enter", shiftKey: false, ctrlKey: false, metaKey: false }, "enter"), true);
	assert.equal(isShortcutEvent({ key: "Enter", shiftKey: true, ctrlKey: false, metaKey: false }, "enter"), false);
	assert.equal(isShortcutEvent({ key: "Enter", shiftKey: true, ctrlKey: false, metaKey: false }, "shift-enter"), true);
	assert.equal(isShortcutEvent({ key: "Enter", shiftKey: false, ctrlKey: true, metaKey: false }, "ctrl-enter"), true);
	assert.equal(isShortcutEvent({ key: "Enter", shiftKey: false, ctrlKey: false, metaKey: true }, "ctrl-enter"), true);
});

test("normalizeShortcutSettings clears submit shortcut when it conflicts", () => {
	assert.deepEqual(
		normalizeShortcutSettings({
			submitShortcut: "enter",
			newlineShortcut: "enter",
		}),
		{
			submitShortcut: "",
			newlineShortcut: "enter",
			changed: true,
		}
	);
});
