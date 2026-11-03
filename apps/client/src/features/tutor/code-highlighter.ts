import type { CodePluginOptions } from '@streamdown/code';
import type { CodeHighlighterPlugin } from 'streamdown';

// a type import only: the plugin itself loads later
type Themes = NonNullable<CodePluginOptions['themes']>;

// clearly coloured, and every colour keeps at least 4.5:1 contrast on Orbi's card in
// both modes; [light, dark]
export const CODE_THEMES: Themes = [
	'github-light-default',
	'github-dark-default',
];

type LoadPlugin = (themes: Themes) => Promise<CodeHighlighterPlugin>;

const loadCodePlugin: LoadPlugin = async (themes) => {
	const { createCodePlugin } = await import('@streamdown/code');
	return createCodePlugin({ themes });
};

// Streamdown's code highlighter, loaded the first time a code block needs it, so the
// chat does not load Shiki up front. Shiki then loads each language on first use.
// Until it is ready a block shows as plain text, and colours itself when it is.
export function lazyCodeHighlighter(
	themes: Themes,
	load: LoadPlugin = loadCodePlugin
): CodeHighlighterPlugin {
	let plugin: CodeHighlighterPlugin | undefined;
	let loading: Promise<CodeHighlighterPlugin> | undefined;
	const ready = () =>
		(loading ??= load(themes).then((loaded) => (plugin = loaded)));

	return {
		name: 'shiki',
		type: 'code-highlighter',
		getThemes: () => themes,
		getSupportedLanguages: () => plugin?.getSupportedLanguages() ?? [],
		// unknown languages are shown as plain text by the plugin itself
		supportsLanguage: (language) => plugin?.supportsLanguage(language) ?? true,
		highlight(options, callback) {
			if (plugin) return plugin.highlight(options, callback);
			void ready().then((loaded) => {
				const result = loaded.highlight(options, callback);
				if (result) callback?.(result);
			});
			return null;
		},
	};
}
