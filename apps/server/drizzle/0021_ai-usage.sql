CREATE TABLE "ai_usage" (
	"user_id" text PRIMARY KEY NOT NULL,
	"hour_started_at" timestamp with time zone NOT NULL,
	"hour_credits" bigint NOT NULL,
	"week_started_at" timestamp with time zone NOT NULL,
	"week_credits" bigint NOT NULL,
	"total_credits" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_usage_credits_min" CHECK ("ai_usage"."hour_credits" >= 0 and "ai_usage"."week_credits" >= 0 and "ai_usage"."total_credits" >= 0)
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;