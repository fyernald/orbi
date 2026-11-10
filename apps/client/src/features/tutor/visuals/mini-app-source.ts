import { miniAppCode, type CreateMiniAppInput } from '@orbi/shared';

// The mini-app as one HTML file, for Copy source. The libraries are named, not
// linked: the sandbox serves its own pinned copies of them.
export function miniAppSource(tool: CreateMiniAppInput): string {
	const { html, css, js, libraries } = miniAppCode(tool);
	return [
		`<!-- ${tool.title.replaceAll('--', '-')} -->`,
		libraries.length > 0 && `<!-- uses: ${libraries.join(', ')} -->`,
		css && `<style>\n${css}\n</style>`,
		html,
		`<script>\n${js}\n</script>`,
	]
		.filter(Boolean)
		.join('\n\n');
}
