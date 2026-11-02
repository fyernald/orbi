'use client';

import { useState } from 'react';

// a side sheet about one topic, like its notes or its questions. The topic stays
// set while the sheet closes, so it can slide out with its content
export function useTopicSheet() {
	const [topicId, setTopicId] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	const openFor = (id: string) => {
		setTopicId(id);
		setOpen(true);
	};

	return { topicId, open, setOpen, openFor };
}
