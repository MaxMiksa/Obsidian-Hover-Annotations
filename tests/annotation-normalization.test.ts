import * as assert from "node:assert/strict";
import test = require("node:test");

import {
	getAutoNormalizeAction,
	normalizeAnnotationsInText,
	normalizeTextWithCursor,
} from "../annotation-normalization";

test("normalizeAnnotationsInText escapes raw newlines inside data-note", () => {
	const input = '<span class="ob-comment" data-note="line 1\nline 2">hello</span>';
	assert.deepEqual(
		normalizeAnnotationsInText(input),
		{
			text: '<span class="ob-comment" data-note="line 1&#10;line 2">hello</span>',
			changed: true,
		}
	);
});

test("normalizeAnnotationsInText leaves already escaped notes unchanged", () => {
	const input = '<span class="ob-comment" data-note="line 1&#10;line 2">hello</span>';
	assert.deepEqual(
		normalizeAnnotationsInText(input),
		{
			text: input,
			changed: false,
		}
	);
});

test("normalizeTextWithCursor shifts cursor when replacement happens before it", () => {
	const input = '<span class="ob-comment" data-note="line 1\nline 2">hello</span> tail';
	const originalCursor = input.length;
	const result = normalizeTextWithCursor(input, originalCursor);

	assert.equal(result.text, '<span class="ob-comment" data-note="line 1&#10;line 2">hello</span> tail');
	assert.equal(result.changed, true);
	assert.equal(result.cursorOffset, originalCursor + 4);
});

test("normalizeTextWithCursor preserves logical cursor position inside data-note", () => {
	const input = '<span class="ob-comment" data-note="ab\ncd">hello</span>';
	const cursorOffset = input.indexOf("\n") + 1;
	const result = normalizeTextWithCursor(input, cursorOffset);

	assert.equal(result.text, '<span class="ob-comment" data-note="ab&#10;cd">hello</span>');
	assert.equal(result.changed, true);
	assert.equal(
		result.cursorOffset,
		'<span class="ob-comment" data-note="ab&#10;'.length
	);
});

test("getAutoNormalizeAction schedules once the cursor exits an annotation", () => {
	assert.equal(
		getAutoNormalizeAction({
			previousRange: { from: 10, to: 30 },
			currentRange: null,
			selectionEmpty: true,
			selectionSet: true,
			docChanged: false,
			hasPendingTimer: false,
		}),
		"schedule"
	);
});

test("getAutoNormalizeAction reschedules while user stays outside annotation but keeps editing", () => {
	assert.equal(
		getAutoNormalizeAction({
			previousRange: null,
			currentRange: null,
			selectionEmpty: true,
			selectionSet: false,
			docChanged: true,
			hasPendingTimer: true,
		}),
		"schedule"
	);
});

test("getAutoNormalizeAction cancels when the cursor re-enters annotation source", () => {
	assert.equal(
		getAutoNormalizeAction({
			previousRange: null,
			currentRange: { from: 10, to: 30 },
			selectionEmpty: true,
			selectionSet: true,
			docChanged: false,
			hasPendingTimer: true,
		}),
		"cancel"
	);
});

test("getAutoNormalizeAction cancels when selection is not collapsed", () => {
	assert.equal(
		getAutoNormalizeAction({
			previousRange: { from: 10, to: 30 },
			currentRange: null,
			selectionEmpty: false,
			selectionSet: true,
			docChanged: false,
			hasPendingTimer: true,
		}),
		"cancel"
	);
});

test("getAutoNormalizeAction ignores unrelated updates outside annotations", () => {
	assert.equal(
		getAutoNormalizeAction({
			previousRange: null,
			currentRange: null,
			selectionEmpty: true,
			selectionSet: false,
			docChanged: true,
			hasPendingTimer: false,
		}),
		"noop"
	);
});
