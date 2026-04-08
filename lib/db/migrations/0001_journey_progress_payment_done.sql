ALTER TABLE "journey_progress" DROP COLUMN "total_score";
--> statement-breakpoint
ALTER TABLE "journey_progress" ADD COLUMN "payment_done" boolean DEFAULT false NOT NULL;
