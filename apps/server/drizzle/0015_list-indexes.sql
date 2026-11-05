DROP INDEX "note_topic_id_idx";--> statement-breakpoint
DROP INDEX "question_user_id_idx";--> statement-breakpoint
CREATE INDEX "note_topic_created_at_idx" ON "note" USING btree ("topic_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "question_user_status_idx" ON "question" USING btree ("user_id","status","created_at");