CREATE TABLE "blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"name" text NOT NULL,
	"nff_code" text NOT NULL,
	"age_group" text NOT NULL,
	"duration_weeks" integer DEFAULT 3 NOT NULL,
	"learning_objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"coaching_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"core_exercise_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_group_variants" (
	"exercise_id" text NOT NULL,
	"group" text NOT NULL,
	"space_modifier" text NOT NULL,
	"touch_limit" integer,
	"defender_count" integer NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "exercise_group_variants_exercise_id_group_pk" PRIMARY KEY("exercise_id","group")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"nff_code" text NOT NULL,
	"source_url" text,
	"players_min" integer NOT NULL,
	"players_max" integer NOT NULL,
	"duration_min" integer NOT NULL,
	"area" text NOT NULL,
	"age_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"coaching_points" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"fiks_id" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"venue" text,
	"tournament" text NOT NULL,
	"format" text NOT NULL,
	"duration" text NOT NULL,
	"groups" jsonb,
	"result" jsonb,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"year" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_group_variants" (
	"session_id" text NOT NULL,
	"group" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"space_modifier" text NOT NULL,
	"touch_limit" integer,
	"defender_count" integer NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "session_group_variants_session_id_group_pk" PRIMARY KEY("session_id","group")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"week_id" text NOT NULL,
	"date" text NOT NULL,
	"day_of_week" text NOT NULL,
	"resistance_level" text NOT NULL,
	"rondo_format" text NOT NULL,
	"sjef_over_ballen_focus" text NOT NULL,
	"tema_exercise_id" text NOT NULL,
	"kamptilpasset_spill" jsonb NOT NULL,
	"oppsummering" text DEFAULT '' NOT NULL,
	"coaching_focus" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"has_rrr" boolean DEFAULT false NOT NULL,
	"rrr_description" text
);
--> statement-breakpoint
CREATE TABLE "weeks" (
	"id" text PRIMARY KEY NOT NULL,
	"block_id" text NOT NULL,
	"number" integer NOT NULL,
	"focus" text NOT NULL,
	"date_range" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_group_variants" ADD CONSTRAINT "exercise_group_variants_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_group_variants" ADD CONSTRAINT "session_group_variants_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_week_id_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;