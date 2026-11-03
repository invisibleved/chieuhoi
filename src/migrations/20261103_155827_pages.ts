import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_media_slot" AS ENUM('hero', 'hand', 'machine', 'next-people', 'next-stories', 'next-products', 'life-1', 'life-2', 'life-3', 'next-village', 'next-craft', 'related-people', 'next-pattern');
  CREATE TYPE "public"."enum_pages_slug" AS ENUM('home', 'lang-hoi', 'cau-chuyen', 'nghe-det-chieu', 'con-nguoi', 'san-pham', 'thu-vien', 'ket-noi');
  CREATE TYPE "public"."enum_pages_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_media_slot" AS ENUM('hero', 'hand', 'machine', 'next-people', 'next-stories', 'next-products', 'life-1', 'life-2', 'life-3', 'next-village', 'next-craft', 'related-people', 'next-pattern');
  CREATE TYPE "public"."enum__pages_v_version_slug" AS ENUM('home', 'lang-hoi', 'cau-chuyen', 'nghe-det-chieu', 'con-nguoi', 'san-pham', 'thu-vien', 'ket-noi');
  CREATE TYPE "public"."enum__pages_v_version_workflow" AS ENUM('draft', 'in_review', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('vi');
  CREATE TABLE "pages_village_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_village_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_pages_media_slot",
  	"image_id" integer
  );
  
  CREATE TABLE "pages_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_facts_locales" (
  	"term" varchar,
  	"detail" varchar,
  	"detail_mobile" varchar,
  	"note" varchar,
  	"note_mobile" varchar,
  	"editor_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pg_lh_founder_sents" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean
  );
  
  CREATE TABLE "pg_lh_founder_sents_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pg_lh_founder_paras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_founder_conflict" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean
  );
  
  CREATE TABLE "pages_founder_conflict_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pg_lh_heritage_sents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean
  );
  
  CREATE TABLE "pg_lh_heritage_sents_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"note_hide_on_mobile" boolean
  );
  
  CREATE TABLE "pages_tools_locales" (
  	"name" varchar,
  	"note_text" varchar,
  	"note_mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pg_ndc_compare" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pg_ndc_compare_locales" (
  	"aspect" varchar,
  	"hand" varchar,
  	"machine" varchar,
  	"mobile" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_pages_slug",
  	"workflow" "enum_pages_workflow" DEFAULT 'draft',
  	"hero_image_id" integer,
  	"hero_inset_id" integer,
  	"hand_text_hide_on_mobile" boolean,
  	"hand_note_hide_on_mobile" boolean,
  	"machine_text_hide_on_mobile" boolean,
  	"machine_note_hide_on_mobile" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"lead" varchar,
  	"hero_title" varchar,
  	"hero_caption" varchar,
  	"founder_conflict_editor_note" varchar,
  	"founder_no_portrait" varchar,
  	"location_text" varchar,
  	"location_editor_note" varchar,
  	"heritage_editor_note" varchar,
  	"hand_title" varchar,
  	"hand_text_text" varchar,
  	"hand_text_mobile_text" varchar,
  	"hand_note_text" varchar,
  	"hand_note_mobile_text" varchar,
  	"machine_title" varchar,
  	"machine_text_text" varchar,
  	"machine_text_mobile_text" varchar,
  	"machine_note_text" varchar,
  	"machine_note_mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_pages_v_version_village_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_village_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__pages_v_version_media_slot",
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_facts_locales" (
  	"term" varchar,
  	"detail" varchar,
  	"detail_mobile" varchar,
  	"note" varchar,
  	"note_mobile" varchar,
  	"editor_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pg_lh_founder_sents_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pg_lh_founder_sents_v_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pg_lh_founder_paras_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_founder_conflict" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_founder_conflict_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pg_lh_heritage_sents_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pg_lh_heritage_sents_v_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"note_hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_tools_locales" (
  	"name" varchar,
  	"note_text" varchar,
  	"note_mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pg_ndc_compare_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pg_ndc_compare_v_locales" (
  	"aspect" varchar,
  	"hand" varchar,
  	"machine" varchar,
  	"mobile" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__pages_v_version_slug",
  	"version_workflow" "enum__pages_v_version_workflow" DEFAULT 'draft',
  	"version_hero_image_id" integer,
  	"version_hero_inset_id" integer,
  	"version_hand_text_hide_on_mobile" boolean,
  	"version_hand_note_hide_on_mobile" boolean,
  	"version_machine_text_hide_on_mobile" boolean,
  	"version_machine_note_hide_on_mobile" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_hero_title" varchar,
  	"version_hero_caption" varchar,
  	"version_founder_conflict_editor_note" varchar,
  	"version_founder_no_portrait" varchar,
  	"version_location_text" varchar,
  	"version_location_editor_note" varchar,
  	"version_heritage_editor_note" varchar,
  	"version_hand_title" varchar,
  	"version_hand_text_text" varchar,
  	"version_hand_text_mobile_text" varchar,
  	"version_hand_note_text" varchar,
  	"version_hand_note_mobile_text" varchar,
  	"version_machine_title" varchar,
  	"version_machine_text_text" varchar,
  	"version_machine_text_mobile_text" varchar,
  	"version_machine_note_text" varchar,
  	"version_machine_note_mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_village_images" ADD CONSTRAINT "pages_village_images_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_village_images" ADD CONSTRAINT "pages_village_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_village_images_locales" ADD CONSTRAINT "pages_village_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_village_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_media" ADD CONSTRAINT "pages_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media" ADD CONSTRAINT "pages_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_media_locales" ADD CONSTRAINT "pages_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_facts" ADD CONSTRAINT "pages_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_facts_locales" ADD CONSTRAINT "pages_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_lh_founder_sents" ADD CONSTRAINT "pg_lh_founder_sents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pg_lh_founder_paras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_lh_founder_sents_locales" ADD CONSTRAINT "pg_lh_founder_sents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pg_lh_founder_sents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_lh_founder_paras" ADD CONSTRAINT "pg_lh_founder_paras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_founder_conflict" ADD CONSTRAINT "pages_founder_conflict_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_founder_conflict_locales" ADD CONSTRAINT "pages_founder_conflict_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_founder_conflict"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_lh_heritage_sents" ADD CONSTRAINT "pg_lh_heritage_sents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_lh_heritage_sents_locales" ADD CONSTRAINT "pg_lh_heritage_sents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pg_lh_heritage_sents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_tools" ADD CONSTRAINT "pages_tools_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_tools" ADD CONSTRAINT "pages_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_tools_locales" ADD CONSTRAINT "pages_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_ndc_compare" ADD CONSTRAINT "pg_ndc_compare_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pg_ndc_compare_locales" ADD CONSTRAINT "pg_ndc_compare_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pg_ndc_compare"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_archive_assets_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_inset_id_archive_assets_id_fk" FOREIGN KEY ("hero_inset_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_village_images" ADD CONSTRAINT "_pages_v_version_village_images_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_village_images" ADD CONSTRAINT "_pages_v_version_village_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_village_images_locales" ADD CONSTRAINT "_pages_v_version_village_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_village_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_media" ADD CONSTRAINT "_pages_v_version_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_media" ADD CONSTRAINT "_pages_v_version_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_media_locales" ADD CONSTRAINT "_pages_v_version_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_facts" ADD CONSTRAINT "_pages_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_facts_locales" ADD CONSTRAINT "_pages_v_version_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_lh_founder_sents_v" ADD CONSTRAINT "_pg_lh_founder_sents_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pg_lh_founder_paras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_lh_founder_sents_v_locales" ADD CONSTRAINT "_pg_lh_founder_sents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pg_lh_founder_sents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_lh_founder_paras_v" ADD CONSTRAINT "_pg_lh_founder_paras_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_founder_conflict" ADD CONSTRAINT "_pages_v_version_founder_conflict_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_founder_conflict_locales" ADD CONSTRAINT "_pages_v_version_founder_conflict_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_founder_conflict"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_lh_heritage_sents_v" ADD CONSTRAINT "_pg_lh_heritage_sents_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_lh_heritage_sents_v_locales" ADD CONSTRAINT "_pg_lh_heritage_sents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pg_lh_heritage_sents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_tools" ADD CONSTRAINT "_pages_v_version_tools_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_tools" ADD CONSTRAINT "_pages_v_version_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_tools_locales" ADD CONSTRAINT "_pages_v_version_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_ndc_compare_v" ADD CONSTRAINT "_pg_ndc_compare_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pg_ndc_compare_v_locales" ADD CONSTRAINT "_pg_ndc_compare_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pg_ndc_compare_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_archive_assets_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_inset_id_archive_assets_id_fk" FOREIGN KEY ("version_hero_inset_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_village_images_order_idx" ON "pages_village_images" USING btree ("_order");
  CREATE INDEX "pages_village_images_parent_id_idx" ON "pages_village_images" USING btree ("_parent_id");
  CREATE INDEX "pages_village_images_image_idx" ON "pages_village_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_village_images_locales_locale_parent_id_unique" ON "pages_village_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_village_images_locales_parent_id_idx" ON "pages_village_images_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_media_order_idx" ON "pages_media" USING btree ("_order");
  CREATE INDEX "pages_media_parent_id_idx" ON "pages_media" USING btree ("_parent_id");
  CREATE INDEX "pages_media_image_idx" ON "pages_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_media_locales_locale_parent_id_unique" ON "pages_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_media_locales_parent_id_idx" ON "pages_media_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_facts_order_idx" ON "pages_facts" USING btree ("_order");
  CREATE INDEX "pages_facts_parent_id_idx" ON "pages_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_facts_locales_locale_parent_id_unique" ON "pages_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_facts_locales_parent_id_idx" ON "pages_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "pg_lh_founder_sents_order_idx" ON "pg_lh_founder_sents" USING btree ("_order");
  CREATE INDEX "pg_lh_founder_sents_parent_id_idx" ON "pg_lh_founder_sents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pg_lh_founder_sents_locales_locale_parent_id_unique" ON "pg_lh_founder_sents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pg_lh_founder_sents_locales_parent_id_idx" ON "pg_lh_founder_sents_locales" USING btree ("_parent_id");
  CREATE INDEX "pg_lh_founder_paras_order_idx" ON "pg_lh_founder_paras" USING btree ("_order");
  CREATE INDEX "pg_lh_founder_paras_parent_id_idx" ON "pg_lh_founder_paras" USING btree ("_parent_id");
  CREATE INDEX "pages_founder_conflict_order_idx" ON "pages_founder_conflict" USING btree ("_order");
  CREATE INDEX "pages_founder_conflict_parent_id_idx" ON "pages_founder_conflict" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_founder_conflict_locales_locale_parent_id_unique" ON "pages_founder_conflict_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_founder_conflict_locales_parent_id_idx" ON "pages_founder_conflict_locales" USING btree ("_parent_id");
  CREATE INDEX "pg_lh_heritage_sents_order_idx" ON "pg_lh_heritage_sents" USING btree ("_order");
  CREATE INDEX "pg_lh_heritage_sents_parent_id_idx" ON "pg_lh_heritage_sents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pg_lh_heritage_sents_locales_locale_parent_id_unique" ON "pg_lh_heritage_sents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pg_lh_heritage_sents_locales_parent_id_idx" ON "pg_lh_heritage_sents_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_tools_order_idx" ON "pages_tools" USING btree ("_order");
  CREATE INDEX "pages_tools_parent_id_idx" ON "pages_tools" USING btree ("_parent_id");
  CREATE INDEX "pages_tools_image_idx" ON "pages_tools" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_tools_locales_locale_parent_id_unique" ON "pages_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_tools_locales_parent_id_idx" ON "pages_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "pg_ndc_compare_order_idx" ON "pg_ndc_compare" USING btree ("_order");
  CREATE INDEX "pg_ndc_compare_parent_id_idx" ON "pg_ndc_compare" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pg_ndc_compare_locales_locale_parent_id_unique" ON "pg_ndc_compare_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pg_ndc_compare_locales_parent_id_idx" ON "pg_ndc_compare_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_hero_inset_idx" ON "pages" USING btree ("hero_inset_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_sources_id_idx" ON "pages_rels" USING btree ("sources_id");
  CREATE INDEX "_pages_v_version_village_images_order_idx" ON "_pages_v_version_village_images" USING btree ("_order");
  CREATE INDEX "_pages_v_version_village_images_parent_id_idx" ON "_pages_v_version_village_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_village_images_image_idx" ON "_pages_v_version_village_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_version_village_images_locales_locale_parent_id_uni" ON "_pages_v_version_village_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_village_images_locales_parent_id_idx" ON "_pages_v_version_village_images_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_media_order_idx" ON "_pages_v_version_media" USING btree ("_order");
  CREATE INDEX "_pages_v_version_media_parent_id_idx" ON "_pages_v_version_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_media_image_idx" ON "_pages_v_version_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_version_media_locales_locale_parent_id_unique" ON "_pages_v_version_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_media_locales_parent_id_idx" ON "_pages_v_version_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_facts_order_idx" ON "_pages_v_version_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_version_facts_parent_id_idx" ON "_pages_v_version_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_facts_locales_locale_parent_id_unique" ON "_pages_v_version_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_facts_locales_parent_id_idx" ON "_pages_v_version_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "_pg_lh_founder_sents_v_order_idx" ON "_pg_lh_founder_sents_v" USING btree ("_order");
  CREATE INDEX "_pg_lh_founder_sents_v_parent_id_idx" ON "_pg_lh_founder_sents_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pg_lh_founder_sents_v_locales_locale_parent_id_unique" ON "_pg_lh_founder_sents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pg_lh_founder_sents_v_locales_parent_id_idx" ON "_pg_lh_founder_sents_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pg_lh_founder_paras_v_order_idx" ON "_pg_lh_founder_paras_v" USING btree ("_order");
  CREATE INDEX "_pg_lh_founder_paras_v_parent_id_idx" ON "_pg_lh_founder_paras_v" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_founder_conflict_order_idx" ON "_pages_v_version_founder_conflict" USING btree ("_order");
  CREATE INDEX "_pages_v_version_founder_conflict_parent_id_idx" ON "_pages_v_version_founder_conflict" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_founder_conflict_locales_locale_parent_id_u" ON "_pages_v_version_founder_conflict_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_founder_conflict_locales_parent_id_idx" ON "_pages_v_version_founder_conflict_locales" USING btree ("_parent_id");
  CREATE INDEX "_pg_lh_heritage_sents_v_order_idx" ON "_pg_lh_heritage_sents_v" USING btree ("_order");
  CREATE INDEX "_pg_lh_heritage_sents_v_parent_id_idx" ON "_pg_lh_heritage_sents_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pg_lh_heritage_sents_v_locales_locale_parent_id_unique" ON "_pg_lh_heritage_sents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pg_lh_heritage_sents_v_locales_parent_id_idx" ON "_pg_lh_heritage_sents_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_tools_order_idx" ON "_pages_v_version_tools" USING btree ("_order");
  CREATE INDEX "_pages_v_version_tools_parent_id_idx" ON "_pages_v_version_tools" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_tools_image_idx" ON "_pages_v_version_tools" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_version_tools_locales_locale_parent_id_unique" ON "_pages_v_version_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_tools_locales_parent_id_idx" ON "_pages_v_version_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "_pg_ndc_compare_v_order_idx" ON "_pg_ndc_compare_v" USING btree ("_order");
  CREATE INDEX "_pg_ndc_compare_v_parent_id_idx" ON "_pg_ndc_compare_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pg_ndc_compare_v_locales_locale_parent_id_unique" ON "_pg_ndc_compare_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pg_ndc_compare_v_locales_parent_id_idx" ON "_pg_ndc_compare_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_hero_inset_idx" ON "_pages_v" USING btree ("version_hero_inset_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_sources_id_idx" ON "_pages_v_rels" USING btree ("sources_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_village_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_village_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_lh_founder_sents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_lh_founder_sents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_lh_founder_paras" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_founder_conflict" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_founder_conflict_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_lh_heritage_sents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_lh_heritage_sents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_tools_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_ndc_compare" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pg_ndc_compare_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_village_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_village_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_lh_founder_sents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_lh_founder_sents_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_lh_founder_paras_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_founder_conflict" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_founder_conflict_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_lh_heritage_sents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_lh_heritage_sents_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_tools_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_ndc_compare_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pg_ndc_compare_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_village_images" CASCADE;
  DROP TABLE "pages_village_images_locales" CASCADE;
  DROP TABLE "pages_media" CASCADE;
  DROP TABLE "pages_media_locales" CASCADE;
  DROP TABLE "pages_facts" CASCADE;
  DROP TABLE "pages_facts_locales" CASCADE;
  DROP TABLE "pg_lh_founder_sents" CASCADE;
  DROP TABLE "pg_lh_founder_sents_locales" CASCADE;
  DROP TABLE "pg_lh_founder_paras" CASCADE;
  DROP TABLE "pages_founder_conflict" CASCADE;
  DROP TABLE "pages_founder_conflict_locales" CASCADE;
  DROP TABLE "pg_lh_heritage_sents" CASCADE;
  DROP TABLE "pg_lh_heritage_sents_locales" CASCADE;
  DROP TABLE "pages_tools" CASCADE;
  DROP TABLE "pages_tools_locales" CASCADE;
  DROP TABLE "pg_ndc_compare" CASCADE;
  DROP TABLE "pg_ndc_compare_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_village_images" CASCADE;
  DROP TABLE "_pages_v_version_village_images_locales" CASCADE;
  DROP TABLE "_pages_v_version_media" CASCADE;
  DROP TABLE "_pages_v_version_media_locales" CASCADE;
  DROP TABLE "_pages_v_version_facts" CASCADE;
  DROP TABLE "_pages_v_version_facts_locales" CASCADE;
  DROP TABLE "_pg_lh_founder_sents_v" CASCADE;
  DROP TABLE "_pg_lh_founder_sents_v_locales" CASCADE;
  DROP TABLE "_pg_lh_founder_paras_v" CASCADE;
  DROP TABLE "_pages_v_version_founder_conflict" CASCADE;
  DROP TABLE "_pages_v_version_founder_conflict_locales" CASCADE;
  DROP TABLE "_pg_lh_heritage_sents_v" CASCADE;
  DROP TABLE "_pg_lh_heritage_sents_v_locales" CASCADE;
  DROP TABLE "_pages_v_version_tools" CASCADE;
  DROP TABLE "_pages_v_version_tools_locales" CASCADE;
  DROP TABLE "_pg_ndc_compare_v" CASCADE;
  DROP TABLE "_pg_ndc_compare_v_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_media_slot";
  DROP TYPE "public"."enum_pages_slug";
  DROP TYPE "public"."enum_pages_workflow";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_media_slot";
  DROP TYPE "public"."enum__pages_v_version_slug";
  DROP TYPE "public"."enum__pages_v_version_workflow";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";`)
}
