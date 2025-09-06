CREATE TABLE "user_settings" (
	"userId" text PRIMARY KEY NOT NULL,
	"bio" text,
	"website" text,
	"preferred_tone" text DEFAULT 'professional',
	"default_tags" text[] DEFAULT '{}',
	"auto_generate_urls" boolean DEFAULT true,
	"include_reading_time" boolean DEFAULT false,
	"default_publish_time" text DEFAULT '09:00',
	"auto_schedule" boolean DEFAULT true,
	"notifications" json DEFAULT '{"publishSuccess":true,"publishErrors":true,"dailyDigest":false,"weeklyReport":true}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "analytics" CASCADE;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;