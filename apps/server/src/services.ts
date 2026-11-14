import type { TokenBudget } from './ai/budget';
import type { ModelRegistry } from './ai/models';
import type { LogUsage } from './ai/usage';
import type { AppDeps } from './app';
import type { Db } from './db';
import { createBetaRepository } from './modules/beta/repository';
import { createBetaService, type BetaOptions } from './modules/beta/service';
import { createCourseRepository } from './modules/courses/repository';
import { createCourseService } from './modules/courses/service';
import { createNoteRepository } from './modules/notes/repository';
import { createNoteService } from './modules/notes/service';
import { createProfileRepository } from './modules/profile/repository';
import { createProfileService } from './modules/profile/service';
import { createQuestionRepository } from './modules/questions/repository';
import { createQuestionService } from './modules/questions/service';
import type { ReplyLimiter } from './modules/tutor/reply-limiter';
import { createExplanationRepository } from './modules/tutor/explanation-repository';
import { createTutorRepository } from './modules/tutor/repository';
import { createTutorService } from './modules/tutor/service';
import type { PdfReader } from './pdf/reader';

export type ServiceDeps = {
	db: Db;
	pdf: PdfReader;
	models: ModelRegistry;
	beta: BetaOptions;
	budget?: TokenBudget;
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
	budget,
	limiter,
	logError,
	logUsage,
}: ServiceDeps): AppDeps['services'] {
	return {
		beta: createBetaService({
			repo: createBetaRepository(db),
			options: beta,
		}),
		courses: createCourseService({ repo: createCourseRepository(db) }),
		notes: createNoteService({ repo: createNoteRepository(db), pdf }),
		profiles: createProfileService({
			repo: createProfileRepository(db),
			models,
		}),
		questions: createQuestionService({ repo: createQuestionRepository(db) }),
		tutor: createTutorService({
			repo: createTutorRepository(db),
			explanations: createExplanationRepository(db),
			models,
			budget,
			limiter,
			logError,
			logUsage,
		}),
	};
}
