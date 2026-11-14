'use client';

import { useState } from 'react';
import { useUsageBlock, useUsageNotice } from '../hooks';
import { UsageNotice } from './usage-notice';

// The notice by the message box. A hidden notice stays hidden until the next
// level (75%, then 90%, then over the limit), so it never nags. Once a limit is
// used up it says why nothing can be sent and when that changes.
export function ComposerUsageNotice() {
	const block = useUsageBlock();
	const notice = useUsageNotice();
	const [hiddenLevel, setHiddenLevel] = useState<string | null>(null);
	if (block) return <UsageNotice level="blocked" text={block} />;
	if (!notice || notice.level === hiddenLevel) return null;

	return (
		<UsageNotice
			level={notice.level}
			text={notice.text}
			onDismiss={() => setHiddenLevel(notice.level)}
		/>
	);
}
