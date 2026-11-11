// Where mini-apps run (US-42 part 4): the sandbox page on an origin of its own
// (apps/sandbox), so their code can never reach this page, its cookies or the API.
// Put into the build (NEXT_PUBLIC_), because the browser needs it. In development
// it is the sandbox that pnpm dev starts; empty in a build means no mini-apps.
const DEV_SANDBOX_URL = 'http://localhost:3200/';

const configured =
	process.env.NEXT_PUBLIC_SANDBOX_URL ||
	(process.env.NODE_ENV === 'development' ? DEV_SANDBOX_URL : undefined);

const parse = (url: string | undefined) => {
	if (!url) return undefined;
	try {
		return new URL(url);
	} catch {
		return undefined;
	}
};

const sandbox = parse(configured);

// the address the frame opens, or undefined when this build has no sandbox
export const sandboxUrl = sandbox?.href;
// the only origin mini-app messages may come from, and the frames this page may show
export const sandboxOrigin = sandbox?.origin;
