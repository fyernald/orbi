CREATE TYPE "public"."note_kind" AS ENUM('note', 'pdf_text');--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "kind" "note_kind" DEFAULT 'note' NOT NULL;