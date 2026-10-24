// for the Docker health check: answers without calling the API or rendering a page
export function GET() {
	return Response.json({ status: 'ok' });
}
