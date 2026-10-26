import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('vi');
  CREATE TYPE "public"."enum_users_role" AS ENUM('editor', 'reviewer');
  CREATE TYPE "public"."enum_timeline_events_confidence" AS ENUM('press', 'oral', 'pending');
  CREATE TYPE "public"."enum_timeline_events_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_timeline_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__timeline_events_v_version_confidence" AS ENUM('press', 'oral', 'pending');
  CREATE TYPE "public"."enum__timeline_events_v_version_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__timeline_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__timeline_events_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_archive_assets_category" AS ENUM('village', 'weaving', 'people', 'products', 'memory', 'history');
  CREATE TYPE "public"."enum_archive_assets_era" AS ENUM('old', 'now');
  CREATE TYPE "public"."enum_archive_assets_rights" AS ENUM('unknown', 'permitted', 'restricted');
  CREATE TYPE "public"."enum_archive_assets_subject_consent" AS ENUM('not_applicable', 'pending', 'given');
  CREATE TYPE "public"."enum_craft_steps_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_craft_steps_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__craft_steps_v_version_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__craft_steps_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__craft_steps_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_products_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_products_group" AS ENUM('traditional', 'contemporary');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__products_v_version_group" AS ENUM('traditional', 'contemporary');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_stories_workflow" AS ENUM('idea', 'draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_stories_category" AS ENUM('history', 'village-memory', 'traditional-craft', 'people', 'life-today');
  CREATE TYPE "public"."enum_stories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stories_v_version_workflow" AS ENUM('idea', 'draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__stories_v_version_category" AS ENUM('history', 'village-memory', 'traditional-craft', 'people', 'life-today');
  CREATE TYPE "public"."enum__stories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stories_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_people_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_people_category" AS ENUM('artisan', 'craft-family', 'craft-keeper', 'young-generation', 'village-bound');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_version_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__people_v_version_category" AS ENUM('artisan', 'craft-family', 'craft-keeper', 'young-generation', 'village-bound');
  CREATE TYPE "public"."enum__people_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_makers_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_makers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__makers_v_version_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__makers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__makers_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_published_locale" AS ENUM('vi');
  CREATE TYPE "public"."enum_page_intros_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__page_intros_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__page_intros_v_published_locale" AS ENUM('vi');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_id" varchar NOT NULL,
  	"publisher" varchar,
  	"title" varchar NOT NULL,
  	"url" varchar,
  	"date" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "timeline_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"order" numeric,
  	"confidence" "enum_timeline_events_confidence" DEFAULT 'pending',
  	"workflow" "enum_timeline_events_workflow" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_timeline_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "timeline_events_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "timeline_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_timeline_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_label" varchar,
  	"version_order" numeric,
  	"version_confidence" "enum__timeline_events_v_version_confidence" DEFAULT 'pending',
  	"version_workflow" "enum__timeline_events_v_version_workflow" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__timeline_events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__timeline_events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_timeline_events_v_locales" (
  	"version_title" varchar,
  	"version_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_timeline_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "archive_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"category" "enum_archive_assets_category",
  	"era" "enum_archive_assets_era",
  	"taken_at" varchar,
  	"related_label" varchar,
  	"related_href" varchar,
  	"photographer" varchar,
  	"owner" varchar,
  	"source" varchar,
  	"rights" "enum_archive_assets_rights" DEFAULT 'unknown' NOT NULL,
  	"subject_consent" "enum_archive_assets_subject_consent" DEFAULT 'pending' NOT NULL,
  	"source_file" varchar,
  	"in_archive" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_full_url" varchar,
  	"sizes_full_width" numeric,
  	"sizes_full_height" numeric,
  	"sizes_full_mime_type" varchar,
  	"sizes_full_filesize" numeric,
  	"sizes_full_filename" varchar
  );
  
  CREATE TABLE "archive_assets_locales" (
  	"title" varchar,
  	"description" varchar,
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "craft_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow" "enum_craft_steps_workflow" DEFAULT 'draft',
  	"n" numeric,
  	"image_id" integer,
  	"focus_x" numeric,
  	"focus_y" numeric,
  	"verified_by" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_craft_steps_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "craft_steps_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"tools" varchar,
  	"shot_needed" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_craft_steps_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow" "enum__craft_steps_v_version_workflow" DEFAULT 'draft',
  	"version_n" numeric,
  	"version_image_id" integer,
  	"version_focus_x" numeric,
  	"version_focus_y" numeric,
  	"version_verified_by" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__craft_steps_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__craft_steps_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_craft_steps_v_locales" (
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_body" varchar,
  	"version_tools" varchar,
  	"version_shot_needed" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_annotations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"n" numeric,
  	"x" numeric,
  	"y" numeric,
  	"source_id" integer
  );
  
  CREATE TABLE "products_annotations_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow" "enum_products_workflow" DEFAULT 'draft',
  	"slug" varchar,
  	"group" "enum_products_group",
  	"type_confirmed" boolean DEFAULT false,
  	"maker_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"code" varchar,
  	"name" varchar,
  	"summary" varchar,
  	"material" varchar,
  	"technique" varchar,
  	"size" varchar,
  	"care" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"archive_assets_id" integer
  );
  
  CREATE TABLE "_products_v_version_annotations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"n" numeric,
  	"x" numeric,
  	"y" numeric,
  	"source_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_annotations_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow" "enum__products_v_version_workflow" DEFAULT 'draft',
  	"version_slug" varchar,
  	"version_group" "enum__products_v_version_group",
  	"version_type_confirmed" boolean DEFAULT false,
  	"version_maker_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_code" varchar,
  	"version_name" varchar,
  	"version_summary" varchar,
  	"version_material" varchar,
  	"version_technique" varchar,
  	"version_size" varchar,
  	"version_care" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"archive_assets_id" integer
  );
  
  CREATE TABLE "stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow" "enum_stories_workflow" DEFAULT 'draft',
  	"slug" varchar,
  	"category" "enum_stories_category",
  	"cover_id" integer,
  	"editor" varchar,
  	"reading_minutes" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_stories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "stories_locales" (
  	"title" varchar,
  	"sapo" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow" "enum__stories_v_version_workflow" DEFAULT 'draft',
  	"version_slug" varchar,
  	"version_category" "enum__stories_v_version_category",
  	"version_cover_id" integer,
  	"version_editor" varchar,
  	"version_reading_minutes" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__stories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__stories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_stories_v_locales" (
  	"version_title" varchar,
  	"version_sapo" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_stories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow" "enum_people_workflow" DEFAULT 'draft',
  	"slug" varchar,
  	"category" "enum_people_category",
  	"years_in_craft" varchar,
  	"portrait_id" integer,
  	"quote_source_id" integer,
  	"consent_name" boolean DEFAULT false,
  	"consent_photo" boolean DEFAULT false,
  	"consent_quote" boolean DEFAULT false,
  	"reviewed_by_subject" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_people_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "people_locales" (
  	"name" varchar,
  	"role" varchar,
  	"note" varchar,
  	"story" jsonb,
  	"quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_people_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow" "enum__people_v_version_workflow" DEFAULT 'draft',
  	"version_slug" varchar,
  	"version_category" "enum__people_v_version_category",
  	"version_years_in_craft" varchar,
  	"version_portrait_id" integer,
  	"version_quote_source_id" integer,
  	"version_consent_name" boolean DEFAULT false,
  	"version_consent_photo" boolean DEFAULT false,
  	"version_consent_quote" boolean DEFAULT false,
  	"version_reviewed_by_subject" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__people_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__people_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_people_v_locales" (
  	"version_name" varchar,
  	"version_role" varchar,
  	"version_note" varchar,
  	"version_story" jsonb,
  	"version_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "makers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow" "enum_makers_workflow" DEFAULT 'draft',
  	"contact" varchar,
  	"verified" boolean DEFAULT false,
  	"public_consent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_makers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "makers_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_makers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow" "enum__makers_v_version_workflow" DEFAULT 'draft',
  	"version_contact" varchar,
  	"version_verified" boolean DEFAULT false,
  	"version_public_consent" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__makers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__makers_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_makers_v_locales" (
  	"version_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"sources_id" integer,
  	"timeline_events_id" integer,
  	"archive_assets_id" integer,
  	"craft_steps_id" integer,
  	"products_id" integer,
  	"stories_id" integer,
  	"people_id" integer,
  	"makers_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"tagline" varchar,
  	"description" varchar,
  	"address" varchar,
  	"address_note" varchar,
  	"visit_info" varchar,
  	"copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__site_settings_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_address" varchar,
  	"version_address_note" varchar,
  	"version_visit_info" varchar,
  	"version_copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_intros" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_page_intros_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_intros_locales" (
  	"home_eyebrow" varchar,
  	"home_title" varchar,
  	"home_lead" varchar,
  	"home_hero_title" varchar,
  	"lang_hoi_eyebrow" varchar,
  	"lang_hoi_title" varchar,
  	"lang_hoi_lead" varchar,
  	"cau_chuyen_eyebrow" varchar,
  	"cau_chuyen_title" varchar,
  	"cau_chuyen_lead" varchar,
  	"nghe_det_chieu_eyebrow" varchar,
  	"nghe_det_chieu_title" varchar,
  	"nghe_det_chieu_lead" varchar,
  	"con_nguoi_eyebrow" varchar,
  	"con_nguoi_title" varchar,
  	"con_nguoi_lead" varchar,
  	"san_pham_eyebrow" varchar,
  	"san_pham_title" varchar,
  	"san_pham_lead" varchar,
  	"thu_vien_eyebrow" varchar,
  	"thu_vien_title" varchar,
  	"thu_vien_lead" varchar,
  	"ket_noi_eyebrow" varchar,
  	"ket_noi_title" varchar,
  	"ket_noi_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__page_intros_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__page_intros_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_page_intros_v_locales" (
  	"version_home_eyebrow" varchar,
  	"version_home_title" varchar,
  	"version_home_lead" varchar,
  	"version_home_hero_title" varchar,
  	"version_lang_hoi_eyebrow" varchar,
  	"version_lang_hoi_title" varchar,
  	"version_lang_hoi_lead" varchar,
  	"version_cau_chuyen_eyebrow" varchar,
  	"version_cau_chuyen_title" varchar,
  	"version_cau_chuyen_lead" varchar,
  	"version_nghe_det_chieu_eyebrow" varchar,
  	"version_nghe_det_chieu_title" varchar,
  	"version_nghe_det_chieu_lead" varchar,
  	"version_con_nguoi_eyebrow" varchar,
  	"version_con_nguoi_title" varchar,
  	"version_con_nguoi_lead" varchar,
  	"version_san_pham_eyebrow" varchar,
  	"version_san_pham_title" varchar,
  	"version_san_pham_lead" varchar,
  	"version_thu_vien_eyebrow" varchar,
  	"version_thu_vien_title" varchar,
  	"version_thu_vien_lead" varchar,
  	"version_ket_noi_eyebrow" varchar,
  	"version_ket_noi_title" varchar,
  	"version_ket_noi_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timeline_events_locales" ADD CONSTRAINT "timeline_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timeline_events_rels" ADD CONSTRAINT "timeline_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timeline_events_rels" ADD CONSTRAINT "timeline_events_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timeline_events_v" ADD CONSTRAINT "_timeline_events_v_parent_id_timeline_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."timeline_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timeline_events_v_locales" ADD CONSTRAINT "_timeline_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timeline_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timeline_events_v_rels" ADD CONSTRAINT "_timeline_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_timeline_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timeline_events_v_rels" ADD CONSTRAINT "_timeline_events_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "archive_assets_locales" ADD CONSTRAINT "archive_assets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archive_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "craft_steps" ADD CONSTRAINT "craft_steps_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "craft_steps_locales" ADD CONSTRAINT "craft_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."craft_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_craft_steps_v" ADD CONSTRAINT "_craft_steps_v_parent_id_craft_steps_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."craft_steps"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_craft_steps_v" ADD CONSTRAINT "_craft_steps_v_version_image_id_archive_assets_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_craft_steps_v_locales" ADD CONSTRAINT "_craft_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_craft_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_annotations" ADD CONSTRAINT "products_annotations_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_annotations" ADD CONSTRAINT "products_annotations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_annotations_locales" ADD CONSTRAINT "products_annotations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_annotations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_maker_id_makers_id_fk" FOREIGN KEY ("maker_id") REFERENCES "public"."makers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_archive_assets_fk" FOREIGN KEY ("archive_assets_id") REFERENCES "public"."archive_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_annotations" ADD CONSTRAINT "_products_v_version_annotations_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_annotations" ADD CONSTRAINT "_products_v_version_annotations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_annotations_locales" ADD CONSTRAINT "_products_v_version_annotations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_annotations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_maker_id_makers_id_fk" FOREIGN KEY ("version_maker_id") REFERENCES "public"."makers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_archive_assets_fk" FOREIGN KEY ("archive_assets_id") REFERENCES "public"."archive_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_cover_id_archive_assets_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_locales" ADD CONSTRAINT "stories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_parent_id_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_cover_id_archive_assets_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v_locales" ADD CONSTRAINT "_stories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_portrait_id_archive_assets_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_quote_source_id_sources_id_fk" FOREIGN KEY ("quote_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_parent_id_people_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_portrait_id_archive_assets_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_quote_source_id_sources_id_fk" FOREIGN KEY ("version_quote_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v_locales" ADD CONSTRAINT "_people_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "makers_locales" ADD CONSTRAINT "makers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."makers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_makers_v" ADD CONSTRAINT "_makers_v_parent_id_makers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."makers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_makers_v_locales" ADD CONSTRAINT "_makers_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_makers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_timeline_events_fk" FOREIGN KEY ("timeline_events_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_archive_assets_fk" FOREIGN KEY ("archive_assets_id") REFERENCES "public"."archive_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_craft_steps_fk" FOREIGN KEY ("craft_steps_id") REFERENCES "public"."craft_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_makers_fk" FOREIGN KEY ("makers_id") REFERENCES "public"."makers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_locales" ADD CONSTRAINT "page_intros_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_locales" ADD CONSTRAINT "_page_intros_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "sources_source_id_idx" ON "sources" USING btree ("source_id");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "timeline_events_updated_at_idx" ON "timeline_events" USING btree ("updated_at");
  CREATE INDEX "timeline_events_created_at_idx" ON "timeline_events" USING btree ("created_at");
  CREATE INDEX "timeline_events__status_idx" ON "timeline_events" USING btree ("_status");
  CREATE UNIQUE INDEX "timeline_events_locales_locale_parent_id_unique" ON "timeline_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "timeline_events_locales_parent_id_idx" ON "timeline_events_locales" USING btree ("_parent_id");
  CREATE INDEX "timeline_events_rels_order_idx" ON "timeline_events_rels" USING btree ("order");
  CREATE INDEX "timeline_events_rels_parent_idx" ON "timeline_events_rels" USING btree ("parent_id");
  CREATE INDEX "timeline_events_rels_path_idx" ON "timeline_events_rels" USING btree ("path");
  CREATE INDEX "timeline_events_rels_sources_id_idx" ON "timeline_events_rels" USING btree ("sources_id");
  CREATE INDEX "_timeline_events_v_parent_idx" ON "_timeline_events_v" USING btree ("parent_id");
  CREATE INDEX "_timeline_events_v_version_version_updated_at_idx" ON "_timeline_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_timeline_events_v_version_version_created_at_idx" ON "_timeline_events_v" USING btree ("version_created_at");
  CREATE INDEX "_timeline_events_v_version_version__status_idx" ON "_timeline_events_v" USING btree ("version__status");
  CREATE INDEX "_timeline_events_v_created_at_idx" ON "_timeline_events_v" USING btree ("created_at");
  CREATE INDEX "_timeline_events_v_updated_at_idx" ON "_timeline_events_v" USING btree ("updated_at");
  CREATE INDEX "_timeline_events_v_snapshot_idx" ON "_timeline_events_v" USING btree ("snapshot");
  CREATE INDEX "_timeline_events_v_published_locale_idx" ON "_timeline_events_v" USING btree ("published_locale");
  CREATE INDEX "_timeline_events_v_latest_idx" ON "_timeline_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_timeline_events_v_locales_locale_parent_id_unique" ON "_timeline_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_timeline_events_v_locales_parent_id_idx" ON "_timeline_events_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_timeline_events_v_rels_order_idx" ON "_timeline_events_v_rels" USING btree ("order");
  CREATE INDEX "_timeline_events_v_rels_parent_idx" ON "_timeline_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_timeline_events_v_rels_path_idx" ON "_timeline_events_v_rels" USING btree ("path");
  CREATE INDEX "_timeline_events_v_rels_sources_id_idx" ON "_timeline_events_v_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "archive_assets_code_idx" ON "archive_assets" USING btree ("code");
  CREATE INDEX "archive_assets_updated_at_idx" ON "archive_assets" USING btree ("updated_at");
  CREATE INDEX "archive_assets_created_at_idx" ON "archive_assets" USING btree ("created_at");
  CREATE UNIQUE INDEX "archive_assets_filename_idx" ON "archive_assets" USING btree ("filename");
  CREATE INDEX "archive_assets_sizes_thumb_sizes_thumb_filename_idx" ON "archive_assets" USING btree ("sizes_thumb_filename");
  CREATE INDEX "archive_assets_sizes_card_sizes_card_filename_idx" ON "archive_assets" USING btree ("sizes_card_filename");
  CREATE INDEX "archive_assets_sizes_wide_sizes_wide_filename_idx" ON "archive_assets" USING btree ("sizes_wide_filename");
  CREATE INDEX "archive_assets_sizes_full_sizes_full_filename_idx" ON "archive_assets" USING btree ("sizes_full_filename");
  CREATE UNIQUE INDEX "archive_assets_locales_locale_parent_id_unique" ON "archive_assets_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "archive_assets_locales_parent_id_idx" ON "archive_assets_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "craft_steps_n_idx" ON "craft_steps" USING btree ("n");
  CREATE INDEX "craft_steps_image_idx" ON "craft_steps" USING btree ("image_id");
  CREATE INDEX "craft_steps_updated_at_idx" ON "craft_steps" USING btree ("updated_at");
  CREATE INDEX "craft_steps_created_at_idx" ON "craft_steps" USING btree ("created_at");
  CREATE INDEX "craft_steps__status_idx" ON "craft_steps" USING btree ("_status");
  CREATE UNIQUE INDEX "craft_steps_locales_locale_parent_id_unique" ON "craft_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "craft_steps_locales_parent_id_idx" ON "craft_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_craft_steps_v_parent_idx" ON "_craft_steps_v" USING btree ("parent_id");
  CREATE INDEX "_craft_steps_v_version_version_n_idx" ON "_craft_steps_v" USING btree ("version_n");
  CREATE INDEX "_craft_steps_v_version_version_image_idx" ON "_craft_steps_v" USING btree ("version_image_id");
  CREATE INDEX "_craft_steps_v_version_version_updated_at_idx" ON "_craft_steps_v" USING btree ("version_updated_at");
  CREATE INDEX "_craft_steps_v_version_version_created_at_idx" ON "_craft_steps_v" USING btree ("version_created_at");
  CREATE INDEX "_craft_steps_v_version_version__status_idx" ON "_craft_steps_v" USING btree ("version__status");
  CREATE INDEX "_craft_steps_v_created_at_idx" ON "_craft_steps_v" USING btree ("created_at");
  CREATE INDEX "_craft_steps_v_updated_at_idx" ON "_craft_steps_v" USING btree ("updated_at");
  CREATE INDEX "_craft_steps_v_snapshot_idx" ON "_craft_steps_v" USING btree ("snapshot");
  CREATE INDEX "_craft_steps_v_published_locale_idx" ON "_craft_steps_v" USING btree ("published_locale");
  CREATE INDEX "_craft_steps_v_latest_idx" ON "_craft_steps_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_craft_steps_v_locales_locale_parent_id_unique" ON "_craft_steps_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_craft_steps_v_locales_parent_id_idx" ON "_craft_steps_v_locales" USING btree ("_parent_id");
  CREATE INDEX "products_annotations_order_idx" ON "products_annotations" USING btree ("_order");
  CREATE INDEX "products_annotations_parent_id_idx" ON "products_annotations" USING btree ("_parent_id");
  CREATE INDEX "products_annotations_source_idx" ON "products_annotations" USING btree ("source_id");
  CREATE UNIQUE INDEX "products_annotations_locales_locale_parent_id_unique" ON "products_annotations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_annotations_locales_parent_id_idx" ON "products_annotations_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_maker_idx" ON "products" USING btree ("maker_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_locales_parent_id_idx" ON "products_locales" USING btree ("_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_archive_assets_id_idx" ON "products_rels" USING btree ("archive_assets_id");
  CREATE INDEX "_products_v_version_annotations_order_idx" ON "_products_v_version_annotations" USING btree ("_order");
  CREATE INDEX "_products_v_version_annotations_parent_id_idx" ON "_products_v_version_annotations" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_annotations_source_idx" ON "_products_v_version_annotations" USING btree ("source_id");
  CREATE UNIQUE INDEX "_products_v_version_annotations_locales_locale_parent_id_uni" ON "_products_v_version_annotations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_annotations_locales_parent_id_idx" ON "_products_v_version_annotations_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_maker_idx" ON "_products_v" USING btree ("version_maker_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_locales_parent_id_idx" ON "_products_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_archive_assets_id_idx" ON "_products_v_rels" USING btree ("archive_assets_id");
  CREATE UNIQUE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");
  CREATE INDEX "stories_cover_idx" ON "stories" USING btree ("cover_id");
  CREATE INDEX "stories_updated_at_idx" ON "stories" USING btree ("updated_at");
  CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");
  CREATE INDEX "stories__status_idx" ON "stories" USING btree ("_status");
  CREATE UNIQUE INDEX "stories_locales_locale_parent_id_unique" ON "stories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "stories_locales_parent_id_idx" ON "stories_locales" USING btree ("_parent_id");
  CREATE INDEX "stories_rels_order_idx" ON "stories_rels" USING btree ("order");
  CREATE INDEX "stories_rels_parent_idx" ON "stories_rels" USING btree ("parent_id");
  CREATE INDEX "stories_rels_path_idx" ON "stories_rels" USING btree ("path");
  CREATE INDEX "stories_rels_sources_id_idx" ON "stories_rels" USING btree ("sources_id");
  CREATE INDEX "_stories_v_parent_idx" ON "_stories_v" USING btree ("parent_id");
  CREATE INDEX "_stories_v_version_version_slug_idx" ON "_stories_v" USING btree ("version_slug");
  CREATE INDEX "_stories_v_version_version_cover_idx" ON "_stories_v" USING btree ("version_cover_id");
  CREATE INDEX "_stories_v_version_version_updated_at_idx" ON "_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_stories_v_version_version_created_at_idx" ON "_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_stories_v_version_version__status_idx" ON "_stories_v" USING btree ("version__status");
  CREATE INDEX "_stories_v_created_at_idx" ON "_stories_v" USING btree ("created_at");
  CREATE INDEX "_stories_v_updated_at_idx" ON "_stories_v" USING btree ("updated_at");
  CREATE INDEX "_stories_v_snapshot_idx" ON "_stories_v" USING btree ("snapshot");
  CREATE INDEX "_stories_v_published_locale_idx" ON "_stories_v" USING btree ("published_locale");
  CREATE INDEX "_stories_v_latest_idx" ON "_stories_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_stories_v_locales_locale_parent_id_unique" ON "_stories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_stories_v_locales_parent_id_idx" ON "_stories_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_rels_order_idx" ON "_stories_v_rels" USING btree ("order");
  CREATE INDEX "_stories_v_rels_parent_idx" ON "_stories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_stories_v_rels_path_idx" ON "_stories_v_rels" USING btree ("path");
  CREATE INDEX "_stories_v_rels_sources_id_idx" ON "_stories_v_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE INDEX "people_portrait_idx" ON "people" USING btree ("portrait_id");
  CREATE INDEX "people_quote_source_idx" ON "people" USING btree ("quote_source_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people__status_idx" ON "people" USING btree ("_status");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_locales_parent_id_idx" ON "people_locales" USING btree ("_parent_id");
  CREATE INDEX "_people_v_parent_idx" ON "_people_v" USING btree ("parent_id");
  CREATE INDEX "_people_v_version_version_slug_idx" ON "_people_v" USING btree ("version_slug");
  CREATE INDEX "_people_v_version_version_portrait_idx" ON "_people_v" USING btree ("version_portrait_id");
  CREATE INDEX "_people_v_version_version_quote_source_idx" ON "_people_v" USING btree ("version_quote_source_id");
  CREATE INDEX "_people_v_version_version_updated_at_idx" ON "_people_v" USING btree ("version_updated_at");
  CREATE INDEX "_people_v_version_version_created_at_idx" ON "_people_v" USING btree ("version_created_at");
  CREATE INDEX "_people_v_version_version__status_idx" ON "_people_v" USING btree ("version__status");
  CREATE INDEX "_people_v_created_at_idx" ON "_people_v" USING btree ("created_at");
  CREATE INDEX "_people_v_updated_at_idx" ON "_people_v" USING btree ("updated_at");
  CREATE INDEX "_people_v_snapshot_idx" ON "_people_v" USING btree ("snapshot");
  CREATE INDEX "_people_v_published_locale_idx" ON "_people_v" USING btree ("published_locale");
  CREATE INDEX "_people_v_latest_idx" ON "_people_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_people_v_locales_locale_parent_id_unique" ON "_people_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_people_v_locales_parent_id_idx" ON "_people_v_locales" USING btree ("_parent_id");
  CREATE INDEX "makers_updated_at_idx" ON "makers" USING btree ("updated_at");
  CREATE INDEX "makers_created_at_idx" ON "makers" USING btree ("created_at");
  CREATE INDEX "makers__status_idx" ON "makers" USING btree ("_status");
  CREATE UNIQUE INDEX "makers_locales_locale_parent_id_unique" ON "makers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "makers_locales_parent_id_idx" ON "makers_locales" USING btree ("_parent_id");
  CREATE INDEX "_makers_v_parent_idx" ON "_makers_v" USING btree ("parent_id");
  CREATE INDEX "_makers_v_version_version_updated_at_idx" ON "_makers_v" USING btree ("version_updated_at");
  CREATE INDEX "_makers_v_version_version_created_at_idx" ON "_makers_v" USING btree ("version_created_at");
  CREATE INDEX "_makers_v_version_version__status_idx" ON "_makers_v" USING btree ("version__status");
  CREATE INDEX "_makers_v_created_at_idx" ON "_makers_v" USING btree ("created_at");
  CREATE INDEX "_makers_v_updated_at_idx" ON "_makers_v" USING btree ("updated_at");
  CREATE INDEX "_makers_v_snapshot_idx" ON "_makers_v" USING btree ("snapshot");
  CREATE INDEX "_makers_v_published_locale_idx" ON "_makers_v" USING btree ("published_locale");
  CREATE INDEX "_makers_v_latest_idx" ON "_makers_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_makers_v_locales_locale_parent_id_unique" ON "_makers_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_makers_v_locales_parent_id_idx" ON "_makers_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_timeline_events_id_idx" ON "payload_locked_documents_rels" USING btree ("timeline_events_id");
  CREATE INDEX "payload_locked_documents_rels_archive_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("archive_assets_id");
  CREATE INDEX "payload_locked_documents_rels_craft_steps_id_idx" ON "payload_locked_documents_rels" USING btree ("craft_steps_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("stories_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_makers_id_idx" ON "payload_locked_documents_rels" USING btree ("makers_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_snapshot_idx" ON "_site_settings_v" USING btree ("snapshot");
  CREATE INDEX "_site_settings_v_published_locale_idx" ON "_site_settings_v" USING btree ("published_locale");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_locales_parent_id_idx" ON "_site_settings_v_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros__status_idx" ON "page_intros" USING btree ("_status");
  CREATE UNIQUE INDEX "page_intros_locales_locale_parent_id_unique" ON "page_intros_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_locales_parent_id_idx" ON "page_intros_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_version__status_idx" ON "_page_intros_v" USING btree ("version__status");
  CREATE INDEX "_page_intros_v_created_at_idx" ON "_page_intros_v" USING btree ("created_at");
  CREATE INDEX "_page_intros_v_updated_at_idx" ON "_page_intros_v" USING btree ("updated_at");
  CREATE INDEX "_page_intros_v_snapshot_idx" ON "_page_intros_v" USING btree ("snapshot");
  CREATE INDEX "_page_intros_v_published_locale_idx" ON "_page_intros_v" USING btree ("published_locale");
  CREATE INDEX "_page_intros_v_latest_idx" ON "_page_intros_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_page_intros_v_locales_locale_parent_id_unique" ON "_page_intros_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_locales_parent_id_idx" ON "_page_intros_v_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "timeline_events" CASCADE;
  DROP TABLE "timeline_events_locales" CASCADE;
  DROP TABLE "timeline_events_rels" CASCADE;
  DROP TABLE "_timeline_events_v" CASCADE;
  DROP TABLE "_timeline_events_v_locales" CASCADE;
  DROP TABLE "_timeline_events_v_rels" CASCADE;
  DROP TABLE "archive_assets" CASCADE;
  DROP TABLE "archive_assets_locales" CASCADE;
  DROP TABLE "craft_steps" CASCADE;
  DROP TABLE "craft_steps_locales" CASCADE;
  DROP TABLE "_craft_steps_v" CASCADE;
  DROP TABLE "_craft_steps_v_locales" CASCADE;
  DROP TABLE "products_annotations" CASCADE;
  DROP TABLE "products_annotations_locales" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_annotations" CASCADE;
  DROP TABLE "_products_v_version_annotations_locales" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "stories" CASCADE;
  DROP TABLE "stories_locales" CASCADE;
  DROP TABLE "stories_rels" CASCADE;
  DROP TABLE "_stories_v" CASCADE;
  DROP TABLE "_stories_v_locales" CASCADE;
  DROP TABLE "_stories_v_rels" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "_people_v" CASCADE;
  DROP TABLE "_people_v_locales" CASCADE;
  DROP TABLE "makers" CASCADE;
  DROP TABLE "makers_locales" CASCADE;
  DROP TABLE "_makers_v" CASCADE;
  DROP TABLE "_makers_v_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "page_intros" CASCADE;
  DROP TABLE "page_intros_locales" CASCADE;
  DROP TABLE "_page_intros_v" CASCADE;
  DROP TABLE "_page_intros_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_timeline_events_confidence";
  DROP TYPE "public"."enum_timeline_events_workflow";
  DROP TYPE "public"."enum_timeline_events_status";
  DROP TYPE "public"."enum__timeline_events_v_version_confidence";
  DROP TYPE "public"."enum__timeline_events_v_version_workflow";
  DROP TYPE "public"."enum__timeline_events_v_version_status";
  DROP TYPE "public"."enum__timeline_events_v_published_locale";
  DROP TYPE "public"."enum_archive_assets_category";
  DROP TYPE "public"."enum_archive_assets_era";
  DROP TYPE "public"."enum_archive_assets_rights";
  DROP TYPE "public"."enum_archive_assets_subject_consent";
  DROP TYPE "public"."enum_craft_steps_workflow";
  DROP TYPE "public"."enum_craft_steps_status";
  DROP TYPE "public"."enum__craft_steps_v_version_workflow";
  DROP TYPE "public"."enum__craft_steps_v_version_status";
  DROP TYPE "public"."enum__craft_steps_v_published_locale";
  DROP TYPE "public"."enum_products_workflow";
  DROP TYPE "public"."enum_products_group";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_workflow";
  DROP TYPE "public"."enum__products_v_version_group";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_stories_workflow";
  DROP TYPE "public"."enum_stories_category";
  DROP TYPE "public"."enum_stories_status";
  DROP TYPE "public"."enum__stories_v_version_workflow";
  DROP TYPE "public"."enum__stories_v_version_category";
  DROP TYPE "public"."enum__stories_v_version_status";
  DROP TYPE "public"."enum__stories_v_published_locale";
  DROP TYPE "public"."enum_people_workflow";
  DROP TYPE "public"."enum_people_category";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum__people_v_version_workflow";
  DROP TYPE "public"."enum__people_v_version_category";
  DROP TYPE "public"."enum__people_v_version_status";
  DROP TYPE "public"."enum__people_v_published_locale";
  DROP TYPE "public"."enum_makers_workflow";
  DROP TYPE "public"."enum_makers_status";
  DROP TYPE "public"."enum__makers_v_version_workflow";
  DROP TYPE "public"."enum__makers_v_version_status";
  DROP TYPE "public"."enum__makers_v_published_locale";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum__site_settings_v_published_locale";
  DROP TYPE "public"."enum_page_intros_status";
  DROP TYPE "public"."enum__page_intros_v_version_status";
  DROP TYPE "public"."enum__page_intros_v_published_locale";`)
}
