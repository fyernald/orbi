import { ChatSkeleton } from '@/features/tutor/components/chat/chat-skeleton';

// the chat's shape, with the composer's place kept, while its messages load
export function ChatLoading() {
	return (
		<div
			role="status"
			aria-label="Loading the chat"
			className="flex min-h-0 flex-1 flex-col"
		>
			<div className="min-h-0 flex-1 overflow-hidden">
				<ChatSkeleton className="mx-auto w-full max-w-chat px-5 py-8" />
			</div>
			<div className="shrink-0 px-4 pb-4">
				<div className="mx-auto h-34 w-full max-w-chat animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none" />
			</div>
		</div>
	);
}
