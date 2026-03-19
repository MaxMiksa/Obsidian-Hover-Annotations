export const COMMENT_REGEX = /<span class="ob-comment(?:\s+([\w-]+))?" data-note="([\s\S]*?)">([\s\S]*?)<\/span>/g;

function buildAnnotationClass(color: string): string {
	return color ? "ob-comment " + color : "ob-comment";
}

export function escapeDataNote(note: string): string {
	return note
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/'/g, "&#39;")
		.replace(/`/g, "&#96;")
		.replace(/\|/g, "&#124;")
		.replace(/\r?\n/g, "&#10;");
}

export function decodeDataNote(note: string): string {
	return note
		.replace(/&#10;/g, "\n")
		.replace(/&#13;/g, "\r")
		.replace(/&#96;/g, "`")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, "\"")
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<")
		.replace(/&#124;/g, "|")
		.replace(/&amp;/g, "&");
}

export function normalizeAnnotationsInText(text: string): { text: string; changed: boolean } {
	const { text: normalizedText, changed } = normalizeTextWithCursor(text, text.length);
	return { text: normalizedText, changed };
}

function normalizeCursorInsideRawNote(rawNote: string, relativeOffset: number): number {
	const prefix = rawNote.slice(0, relativeOffset);
	return escapeDataNote(decodeDataNote(prefix)).length;
}

export function normalizeTextWithCursor(text: string, cursorOffset: number): {
	text: string;
	changed: boolean;
	cursorOffset: number;
} {
	COMMENT_REGEX.lastIndex = 0;
	let result = "";
	let lastIndex = 0;
	let changed = false;
	let nextCursorOffset = cursorOffset;
	let match;

	while ((match = COMMENT_REGEX.exec(text)) !== null) {
		const fullMatch = match[0];
		const colorClass = match[1] || "";
		const rawNote = match[2];
		const visibleText = match[3];

		const safeNote = escapeDataNote(decodeDataNote(rawNote));
		const replacement = `<span class="${buildAnnotationClass(colorClass)}" data-note="${safeNote}">${visibleText}</span>`;

		const matchStart = match.index;
		const matchEnd = matchStart + fullMatch.length;
		const delta = replacement.length - fullMatch.length;

		if (cursorOffset > matchEnd) {
			nextCursorOffset += delta;
		} else if (cursorOffset >= matchStart && cursorOffset <= matchEnd) {
			const openingPrefix = fullMatch.indexOf('data-note="') + 'data-note="'.length;
			const noteStart = openingPrefix;
			const noteEnd = noteStart + rawNote.length;
			const relativeOffset = cursorOffset - matchStart;

			if (relativeOffset > noteStart && relativeOffset <= noteEnd) {
				const noteRelativeOffset = relativeOffset - noteStart;
				nextCursorOffset = matchStart + openingPrefix + normalizeCursorInsideRawNote(rawNote, noteRelativeOffset);
			} else if (relativeOffset > noteEnd) {
				nextCursorOffset += delta;
			}
		}

		result += text.slice(lastIndex, matchStart) + replacement;
		lastIndex = matchStart + fullMatch.length;
		if (replacement !== fullMatch) changed = true;
	}

	result += text.slice(lastIndex);
	return {
		text: changed ? result : text,
		changed,
		cursorOffset: changed ? nextCursorOffset : cursorOffset,
	};
}
