// keys typed into a field belong to that field, not to the page shortcuts
export const isTyping = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable ||
		['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// Enter already does something on these: submits from a field, presses a button, opens a link
export const handlesEnter = (target: EventTarget | null) =>
	isTyping(target) ||
	(target instanceof HTMLElement && ['BUTTON', 'A'].includes(target.tagName));
