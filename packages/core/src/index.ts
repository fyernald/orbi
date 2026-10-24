// Pure TypeScript business logic: no React, no Fastify, no database code.
// The mastery score (Sprint 3) and the SM-2 scheduler (Sprint 3) will live here.

export interface GeneratedQuestion {
	question: string;
	correctAnswer: string;
	/** Wrong answers, for multiple-choice questions. */
	distractors?: string[];
}

export interface GenerateQuestionsInput {
	topicName: string;
	notes: string;
	count: number;
}

/**
 * Hides which AI provider creates the questions (Gemini today, anything else later).
 * The first version of this interface is refined in Sprint 2 (US-04).
 */
export interface QuestionGenerator {
	generate(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]>;
}
