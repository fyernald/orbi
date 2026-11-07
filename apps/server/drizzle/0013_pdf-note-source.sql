ALTER TABLE "chat_message" ADD COLUMN "attachments" jsonb;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "source_name" varchar(255);--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "source_hash" varchar(64);--> statement-breakpoint
CREATE INDEX "note_source_hash_idx" ON "note" USING btree ("topic_id","source_hash");