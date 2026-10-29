CREATE TYPE "public"."course_color" AS ENUM('blue', 'teal', 'green', 'amber', 'red');--> statement-breakpoint
CREATE TYPE "public"."course_goal" AS ENUM('exam_prep', 'keep_up', 'self_study');--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "color" "course_color" DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "goal" "course_goal" DEFAULT 'keep_up' NOT NULL;