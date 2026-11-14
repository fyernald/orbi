import { ServiceUnavailableError, ValidationError } from '../errors';
import {
	MODEL_NOT_IN_LIST,
	type ModelOptions,
	type ModelRegistry,
	type ResolvedModel,
} from './models';

export type ResolveModel = (
	modelId: string,
	options: ModelOptions
) => ResolvedModel;

// The model the student picked, never another one: a model this server cannot
// call is refused, so the student can pick again
export function createModelResolver(models: ModelRegistry): ResolveModel {
	return (modelId, options) => {
		const resolved = models.resolve(modelId, options);
		if (resolved) return resolved;
		if (models.list().models.length === 0) {
			throw new ServiceUnavailableError(
				'The AI tutor is not set up on this server yet.'
			);
		}
		throw new ValidationError(MODEL_NOT_IN_LIST);
	};
}
