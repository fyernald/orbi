import { MAX_PARALLEL_REPLIES } from '@orbi/shared';
import { createModelResolver } from './ai/model-resolver';
import type { ModelRegistry } from './ai/models';
import type { LogUsage } from './ai/usage';
import type { AppDeps } from './app';
import type { Db } from './db';
import { createBetaRepository } from './modules/beta/repository';
import { createBetaService, type BetaOptions } from './modules/beta/service';
import { createCourseRepository } from './modules/courses/repository';
import { createCourseService } from './modules/courses/service';
import { createKeyPointWriter } from './modules/notes/key-points/writer';
import { createNoteRepository } from './modules/notes/repository';
import { createNoteService } from './modules/notes/service';
import { createProfileRepository } from './modules/profile/repository';
import { createProfileService } from './modules/profile/service';
import { createQuestionRepository } from './modules/questions/repository';
import { createQuestionService } from './modules/questions/service';
import { createExplanationRepository } from './modules/tutor/explanation-repository';
import {
	createPlaceTaker,
	createReplyLimiter,
	type ReplyLimiter,
} from './modules/tutor/reply-limiter';
import { createTutorRepository } from './modules/tutor/repository';
import { createTutorService } from './modules/tutor/service';
import { createStepTracker } from './modules/tutor/step-tracker';
import type { UsageLimits } from './modules/usage/limits';
import { createUsageRepository } from './modules/usage/repository';
import { createUsageService } from './modules/usage/service';
import type { PdfReader } from './pdf/reader';

export type ServiceDeps = {
	db: Db;
	pdf: PdfReader;
	models: ModelRegistry;
	beta: BetaOptions;
	// by default the beta's limits
	usageLimits?: UsageLimits;
	limiter?: ReplyLimiter;
	logError?: (error: unknown) => void;
	logUsage?: LogUsage;
};

// Every repository and service, connected the same way for index.ts and the
// test app, so tests run the graph production runs. A new dependency goes here.
export function createServices({
	db,
	pdf,
	models,
	beta,
	usageLimits,
	limiter = createReplyLimiter(MAX_PARALLEL_REPLIES),
	logError = (error) => console.error(error),
	logUsage = () => {},
}: ServiceDeps): AppDeps['services'] {
	const usage = createUsageService({
		repo: createUsageRepository(db),
		limits: usageLimits,
	});
	const noteRepo = createNoteRepository(db);
	return {
		beta: createBetaService({
			repo: createBetaRepository(db),
			options: beta,
		}),
		courses: createCourseService({ repo: createCourseRepository(db) }),
		notes: createNoteService({ repo: noteRepo, pdf }),
		// shares the tutor's places, so key points and replies count together
		keyPoints: createKeyPointWriter({
			repo: noteRepo,
			resolveModel: createModelResolver(models),
			usage,
			takePlace: createPlaceTaker(limiter),
			trackStep: createStepTracker({ logUsage, usage, logError }),
			logError,
		}),
		profiles: createProfileService({
			repo: createProfileRepository(db),
			models,
		}),
		questions: createQuestionService({ repo: createQuestionRepository(db) }),
		tutor: createTutorService({
			repo: createTutorRepository(db),
			explanations: createExplanationRepository(db),
			models,
			usage,
			limiter,
			logError,
			logUsage,
		}),
		usage,
	};
}
