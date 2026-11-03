'use client';

import type { ComponentProps, CSSProperties } from 'react';
import { TableCopyDropdown, TableDownloadDropdown } from 'streamdown';
import { cn } from '@/lib/utils';

// Streamdown passes the tree node too; it is not an HTML attribute
type TableElementProps<Tag extends 'table' | 'thead' | 'th' | 'td'> =
	ComponentProps<Tag> & { node?: unknown };

// like the other small buttons in the chat
const toolButton =
	'flex size-7 items-center justify-center rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40';

// The markdown's column alignment arrives as an inline text-align. Text columns keep
// a readable width and let the table scroll, instead of squeezing into a few words
// per line.
const alignClass = (style: CSSProperties | undefined) =>
	style?.textAlign === 'right'
		? 'text-right tabular-nums'
		: style?.textAlign === 'center'
			? 'text-center'
			: 'min-w-32 text-left';

// A table in Orbi's reply. A wide one scrolls sideways inside the message, not the
// chat. Copy and download stay in place while it streams, so nothing shifts.
export function ChatTable({
	node: _node,
	className,
	...props
}: TableElementProps<'table'>) {
	return (
		// Streamdown's copy and download menus find the table through this wrapper
		<div data-streamdown="table-wrapper" className="my-4 flex flex-col gap-1">
			<div className="flex justify-end gap-0.5">
				<TableCopyDropdown className={toolButton} />
				<TableDownloadDropdown className={toolButton} />
			</div>
			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<table
					className={cn('w-full border-collapse text-sm', className)}
					{...props}
				/>
			</div>
		</div>
	);
}

export function ChatTableHead({
	node: _node,
	className,
	...props
}: TableElementProps<'thead'>) {
	return <thead className={cn('bg-muted/70', className)} {...props} />;
}

export function ChatTableHeaderCell({
	node: _node,
	style,
	className,
	...props
}: TableElementProps<'th'>) {
	return (
		<th
			scope="col"
			className={cn(
				'border-b border-border px-3 py-2 font-medium whitespace-nowrap text-foreground',
				alignClass(style),
				className
			)}
			style={style}
			{...props}
		/>
	);
}

export function ChatTableCell({
	node: _node,
	style,
	className,
	...props
}: TableElementProps<'td'>) {
	return (
		<td
			className={cn('px-3 py-2 align-top', alignClass(style), className)}
			style={style}
			{...props}
		/>
	);
}
