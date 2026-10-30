CREATE TYPE "public"."explanation_style" AS ENUM('short', 'step_by_step', 'examples');--> statement-breakpoint
CREATE TYPE "public"."profile_use" AS ENUM('exam_prep', 'keep_up', 'learn_new', 'hard_topics', 'research', 'revise_notes');--> statement-breakpoint
CREATE TYPE "public"."study_time" AS ENUM('morning', 'afternoon', 'evening', 'night');--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "uses" "profile_use"[] DEFAULT '{}'::profile_use[] NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "explanation_style" "explanation_style";--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "daily_minutes" integer;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "study_time" "study_time";--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "onboarded_at" timestamp with time zone;