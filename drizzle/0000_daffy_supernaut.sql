CREATE TYPE "public"."payout_method" AS ENUM('bkash', 'nagad', 'rocket', 'beftn', 'rtgs');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('requested', 'processing', 'settled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."tip_provider" AS ENUM('bkash', 'nagad', 'rocket', 'sslcommerz', 'card');--> statement-breakpoint
CREATE TYPE "public"."tip_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"handle" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"payout_method_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"amount_paisa" integer NOT NULL,
	"method" "payout_method" NOT NULL,
	"status" "payout_status" DEFAULT 'requested' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"supporter_name" text,
	"supporter_email" text,
	"amount_paisa" integer NOT NULL,
	"message" text,
	"message_is_public" boolean DEFAULT false NOT NULL,
	"provider" "tip_provider",
	"provider_ref" text,
	"status" "tip_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tips" ADD CONSTRAINT "tips_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "creators_user_id_unique" ON "creators" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creators_handle_unique" ON "creators" USING btree ("handle");