CREATE TABLE "answer_explanation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"choice" integer NOT NULL,
	"text" text NOT NULL,
	"ai_provider" "ai_provider" NOT NULL,
	"ai_model" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answer_explanation_text_not_empty" CHECK ("answer_explanation"."text" ~ '\S')
);
--> statement-breakpoint
ALTER TABLE "answer_explanation" ADD CONSTRAINT "answer_explanation_question_fk" FOREIGN KEY ("user_id","question_id") REFERENCES "public"."question"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answer_explanation_choice_idx" ON "answer_explanation" USING btree ("user_id","question_id","choice");