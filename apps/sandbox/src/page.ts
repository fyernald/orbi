// The host page. It is empty until the chat page sends a mini-app to run
// (src/host/main.ts). Its origin is opaque (sandboxed), so scripts load with CORS:
// without it the browser hides their error messages as "Script error."
export const HOST_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Orbi mini-app</title>
<script src="/host.js" crossorigin="anonymous"></script>
</head>
<body></body>
</html>
`;
