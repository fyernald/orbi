'use client';

import { useState } from 'react';
import { useModels } from './hooks';

// The model a box uses: the student's default until they pick another one here.
// Empty while the models load, or when the server has none.
export function useModelChoice() {
	const models = useModels();
	const [picked, setPicked] = useState<string>();
	const modelId = picked ?? models.data?.defaultModelId ?? '';
	return {
		models: models.data?.models ?? [],
		modelId,
		setModelId: setPicked,
	};
}
