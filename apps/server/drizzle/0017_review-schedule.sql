CREATE TABLE "review_item" (
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"ease" double precision DEFAULT 2.5 NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_item_pkey" PRIMARY KEY("user_id","question_id"),
	CONSTRAINT "review_item_repetitions_min" CHECK ("review_item"."repetitions" >= 0),
	CONSTRAINT "review_item_interval_days_min" CHECK ("review_item"."interval_days" >= 0),
	CONSTRAINT "review_item_ease_min" CHECK ("review_item"."ease" >= 1.3)
);
--> statement-breakpoint
ALTER TABLE "review_item" ADD CONSTRAINT "review_item_question_fk" FOREIGN KEY ("user_id","question_id") REFERENCES "public"."question"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_item_due_at_idx" ON "review_item" USING btree ("user_id","due_at");