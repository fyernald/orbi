ALTER TABLE "question" ADD CONSTRAINT "question_user_id_id_key" UNIQUE("user_id","id");--> statement-breakpoint
CREATE TYPE "public"."answer_context" AS ENUM('chat', 'session');--> statement-breakpoint
CREATE TABLE "answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"choice" integer NOT NULL,
	"correct" boolean NOT NULL,
	"context" "answer_context" NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_fk" FOREIGN KEY ("user_id","question_id") REFERENCES "public"."question"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answer_chat_once_idx" ON "answer" USING btree ("question_id") WHERE "answer"."context" = 'chat';--> statement-breakpoint
CREATE INDEX "answer_user_id_idx" ON "answer" USING btree ("user_id","answered_at");
