CREATE TYPE "public"."ai_provider" AS ENUM('google', 'anthropic');--> statement-breakpoint
CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."question_source" AS ENUM('ai', 'manual');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice');--> statement-breakpoint
CREATE TYPE "public"."tutor_action" AS ENUM('ask', 'questions', 'flashcards', 'mockExam');--> statement-breakpoint
CREATE TABLE "chat" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_user_id_id_key" UNIQUE("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"parts" jsonb NOT NULL,
	"topic_id" uuid,
	"action" "tutor_action",
	"model_id" varchar(100),
	"notes_used" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"topic_id" uuid NOT NULL,
	"type" "question_type" DEFAULT 'multiple_choice' NOT NULL,
	"text" text NOT NULL,
	"choices" jsonb NOT NULL,
	"correct_choice" integer NOT NULL,
	"explanation" text,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"source" "question_source" NOT NULL,
	"ai_provider" "ai_provider",
	"ai_model" varchar(100),
	"chat_message_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_text_not_empty" CHECK ("question"."text" ~ '\S'),
	CONSTRAINT "question_correct_choice_in_range" CHECK ("question"."correct_choice" >= 0 and "question"."correct_choice" < jsonb_array_length("question"."choices")),
	CONSTRAINT "question_ai_has_model" CHECK ("question"."source" <> 'ai' or ("question"."ai_provider" is not null and "question"."ai_model" is not null))
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_course_fk" FOREIGN KEY ("user_id","course_id") REFERENCES "public"."course"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_fk" FOREIGN KEY ("user_id","chat_id") REFERENCES "public"."chat"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_topic_fk" FOREIGN KEY ("user_id","topic_id") REFERENCES "public"."topic"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_course_id_idx" ON "chat" USING btree ("course_id","updated_at");--> statement-breakpoint
CREATE INDEX "chat_message_chat_id_idx" ON "chat_message" USING btree ("chat_id","created_at");--> statement-breakpoint
CREATE INDEX "question_topic_id_idx" ON "question" USING btree ("topic_id","status");--> statement-breakpoint
CREATE INDEX "question_user_id_idx" ON "question" USING btree ("user_id");