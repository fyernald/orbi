CREATE TYPE "public"."report_reason" AS ENUM('wrong_answer', 'unclear', 'not_in_notes', 'other');--> statement-breakpoint
CREATE TABLE "question_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"comment" text,
	"ai_provider" "ai_provider",
	"ai_model" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_report" ADD CONSTRAINT "question_report_question_fk" FOREIGN KEY ("user_id","question_id") REFERENCES "public"."question"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_report_question_id_idx" ON "question_report" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_report_user_id_idx" ON "question_report" USING btree ("user_id");