'use client';

import {
	compileInteractive,
	startingValues,
	workOutValues,
	type ControlValues,
	type CreateInteractiveInput,
} from '@orbi/shared';
import { useCallback, useMemo, useState } from 'react';

// An interactive tool's state (US-42): the value of each control, and every value
// worked out from them. It starts from the AI's values each time the chat opens.
// A formula that cannot be read throws here, so the card shows its error.
export function useInteractive(tool: CreateInteractiveInput) {
	const compiled = useMemo(() => compileInteractive(tool), [tool]);
	const start = useMemo(() => startingValues(tool), [tool]);
	const [controls, setControls] = useState<ControlValues>(start);
	const scope = useMemo(
		() => workOutValues(compiled, controls),
		[compiled, controls]
	);
	const setControl = useCallback(
		(name: string, value: number) =>
			setControls((current) => ({ ...current, [name]: value })),
		[]
	);
	const reset = useCallback(() => setControls(start), [start]);
	const moved = tool.controls.some(
		({ name }) => controls[name] !== start[name]
	);
	return { compiled, controls, scope, setControl, reset, moved };
}

export type InteractiveState = ReturnType<typeof useInteractive>;
