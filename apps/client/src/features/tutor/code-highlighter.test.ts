import type { CodeHighlighterPlugin } from 'streamdown';
import { describe, expect, it, vi } from 'vitest';
import { CODE_THEMES, lazyCodeHighlighter } from './code-highlighter';

type HighlightResult = NonNullable<
	ReturnType<CodeHighlighterPlugin['highlight']>
>;

const result = { tokens: [] } as unknown as HighlightResult;
const options = {
	code: 'print(1)',
	language: 'python',
	themes: CODE_THEMES,
};

function fakePlugin(
	highlight: CodeHighlighterPlugin['highlight']
): CodeHighlighterPlugin {
	return {
		name: 'shiki',
		type: 'code-highlighter',
		getThemes: () => CODE_THEMES,
		getSupportedLanguages: () => ['python'],
		supportsLanguage: (language) => language === 'python',
		highlight,
	};
}

describe('lazyCodeHighlighter', () => {
	it('loads nothing until a code block needs colours', () => {
		const load = vi.fn();
		lazyCodeHighlighter(CODE_THEMES, load);
		expect(load).not.toHaveBeenCalled();
	});

	it('loads the plugin once and hands the colours to the callback', async () => {
		const plugin = fakePlugin(() => result);
		const load = vi.fn(async () => plugin);
		const highlighter = lazyCodeHighlighter(CODE_THEMES, load);
		const callback = vi.fn();

		expect(highlighter.highlight(options, callback)).toBeNull();
		highlighter.highlight(options, vi.fn());
		await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(result));
		expect(load).toHaveBeenCalledTimes(1);
		expect(load).toHaveBeenCalledWith(CODE_THEMES);
	});

	it('asks the loaded plugin directly after that', async () => {
		const highlight = vi.fn(() => result);
		const highlighter = lazyCodeHighlighter(CODE_THEMES, async () =>
			fakePlugin(highlight)
		);
		const callback = vi.fn();
		highlighter.highlight(options, callback);
		await vi.waitFor(() => expect(callback).toHaveBeenCalled());

		expect(highlighter.highlight(options)).toBe(result);
		expect(highlighter.supportsLanguage('cobol')).toBe(false);
	});

	it('treats every language as supported before it has loaded', () => {
		const highlighter = lazyCodeHighlighter(CODE_THEMES, vi.fn());
		expect(highlighter.supportsLanguage('sql')).toBe(true);
	});
});
