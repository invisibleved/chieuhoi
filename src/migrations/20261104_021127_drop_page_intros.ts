import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_intros_home_village_images" CASCADE;
  DROP TABLE "page_intros_home_village_images_locales" CASCADE;
  DROP TABLE "page_intros_lang_hoi_media" CASCADE;
  DROP TABLE "page_intros_lang_hoi_media_locales" CASCADE;
  DROP TABLE "page_intros_lang_hoi_facts" CASCADE;
  DROP TABLE "page_intros_lang_hoi_facts_locales" CASCADE;
  DROP TABLE "lh_founder_sents" CASCADE;
  DROP TABLE "lh_founder_sents_locales" CASCADE;
  DROP TABLE "lh_founder_paras" CASCADE;
  DROP TABLE "page_intros_lang_hoi_founder_conflict" CASCADE;
  DROP TABLE "page_intros_lang_hoi_founder_conflict_locales" CASCADE;
  DROP TABLE "lh_heritage_sents" CASCADE;
  DROP TABLE "lh_heritage_sents_locales" CASCADE;
  DROP TABLE "page_intros_cau_chuyen_media" CASCADE;
  DROP TABLE "page_intros_cau_chuyen_media_locales" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_media" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_media_locales" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_tools" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_tools_locales" CASCADE;
  DROP TABLE "ndc_compare" CASCADE;
  DROP TABLE "ndc_compare_locales" CASCADE;
  DROP TABLE "page_intros_con_nguoi_media" CASCADE;
  DROP TABLE "page_intros_con_nguoi_media_locales" CASCADE;
  DROP TABLE "page_intros_san_pham_media" CASCADE;
  DROP TABLE "page_intros_san_pham_media_locales" CASCADE;
  DROP TABLE "page_intros" CASCADE;
  DROP TABLE "page_intros_locales" CASCADE;
  DROP TABLE "page_intros_rels" CASCADE;
  DROP TABLE "_page_intros_v_version_home_village_images" CASCADE;
  DROP TABLE "_page_intros_v_version_home_village_images_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_media" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_facts" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_facts_locales" CASCADE;
  DROP TABLE "_lh_founder_sents_v" CASCADE;
  DROP TABLE "_lh_founder_sents_v_locales" CASCADE;
  DROP TABLE "_lh_founder_paras_v" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_founder_conflict" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_founder_conflict_locales" CASCADE;
  DROP TABLE "_lh_heritage_sents_v" CASCADE;
  DROP TABLE "_lh_heritage_sents_v_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_cau_chuyen_media" CASCADE;
  DROP TABLE "_page_intros_v_version_cau_chuyen_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_media" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_tools" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_tools_locales" CASCADE;
  DROP TABLE "_ndc_compare_v" CASCADE;
  DROP TABLE "_ndc_compare_v_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_con_nguoi_media" CASCADE;
  DROP TABLE "_page_intros_v_version_con_nguoi_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_san_pham_media" CASCADE;
  DROP TABLE "_page_intros_v_version_san_pham_media_locales" CASCADE;
  DROP TABLE "_page_intros_v" CASCADE;
  DROP TABLE "_page_intros_v_locales" CASCADE;
  DROP TABLE "_page_intros_v_rels" CASCADE;
  DROP TYPE "public"."enum_page_intros_lang_hoi_media_slot";
  DROP TYPE "public"."enum_page_intros_cau_chuyen_media_slot";
  DROP TYPE "public"."enum_page_intros_nghe_det_chieu_media_slot";
  DROP TYPE "public"."enum_page_intros_con_nguoi_media_slot";
  DROP TYPE "public"."enum_page_intros_san_pham_media_slot";
  DROP TYPE "public"."enum_page_intros_status";
  DROP TYPE "public"."enum__page_intros_v_version_lang_hoi_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_cau_chuyen_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_nghe_det_chieu_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_con_nguoi_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_san_pham_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_status";
  DROP TYPE "public"."enum__page_intros_v_published_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_intros_lang_hoi_media_slot" AS ENUM('hero', 'life-1', 'life-2', 'life-3');
  CREATE TYPE "public"."enum_page_intros_cau_chuyen_media_slot" AS ENUM('next-village', 'next-craft');
  CREATE TYPE "public"."enum_page_intros_nghe_det_chieu_media_slot" AS ENUM('hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products');
  CREATE TYPE "public"."enum_page_intros_con_nguoi_media_slot" AS ENUM('related-people');
  CREATE TYPE "public"."enum_page_intros_san_pham_media_slot" AS ENUM('next-pattern');
  CREATE TYPE "public"."enum_page_intros_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__page_intros_v_version_lang_hoi_media_slot" AS ENUM('hero', 'life-1', 'life-2', 'life-3');
  CREATE TYPE "public"."enum__page_intros_v_version_cau_chuyen_media_slot" AS ENUM('next-village', 'next-craft');
  CREATE TYPE "public"."enum__page_intros_v_version_nghe_det_chieu_media_slot" AS ENUM('hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products');
  CREATE TYPE "public"."enum__page_intros_v_version_con_nguoi_media_slot" AS ENUM('related-people');
  CREATE TYPE "public"."enum__page_intros_v_version_san_pham_media_slot" AS ENUM('next-pattern');
  CREATE TYPE "public"."enum__page_intros_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__page_intros_v_published_locale" AS ENUM('vi');
  CREATE TABLE "page_intros_home_village_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "page_intros_home_village_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_lang_hoi_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_page_intros_lang_hoi_media_slot",
  	"image_id" integer
  );
  
  CREATE TABLE "page_intros_lang_hoi_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_lang_hoi_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_intros_lang_hoi_facts_locales" (
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
  
  CREATE TABLE "lh_founder_sents" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean
  );
  
  CREATE TABLE "lh_founder_sents_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "lh_founder_paras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_intros_lang_hoi_founder_conflict" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean
  );
  
  CREATE TABLE "page_intros_lang_hoi_founder_conflict_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "lh_heritage_sents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean
  );
  
  CREATE TABLE "lh_heritage_sents_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_cau_chuyen_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_page_intros_cau_chuyen_media_slot",
  	"image_id" integer
  );
  
  CREATE TABLE "page_intros_cau_chuyen_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_nghe_det_chieu_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_page_intros_nghe_det_chieu_media_slot",
  	"image_id" integer
  );
  
  CREATE TABLE "page_intros_nghe_det_chieu_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_nghe_det_chieu_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note_hide_on_mobile" boolean
  );
  
  CREATE TABLE "page_intros_nghe_det_chieu_tools_locales" (
  	"name" varchar,
  	"note_text" varchar,
  	"note_mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ndc_compare" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "ndc_compare_locales" (
  	"aspect" varchar,
  	"hand" varchar,
  	"machine" varchar,
  	"mobile" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_con_nguoi_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_page_intros_con_nguoi_media_slot",
  	"image_id" integer
  );
  
  CREATE TABLE "page_intros_con_nguoi_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros_san_pham_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_page_intros_san_pham_media_slot",
  	"image_id" integer
  );
  
  CREATE TABLE "page_intros_san_pham_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "page_intros" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"home_hero_image_id" integer,
  	"home_hero_inset_id" integer,
  	"nghe_det_chieu_hand_text_hide_on_mobile" boolean,
  	"nghe_det_chieu_hand_note_hide_on_mobile" boolean,
  	"nghe_det_chieu_machine_text_hide_on_mobile" boolean,
  	"nghe_det_chieu_machine_note_hide_on_mobile" boolean,
  	"_status" "enum_page_intros_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_intros_locales" (
  	"home_eyebrow" varchar,
  	"home_title" varchar,
  	"home_lead" varchar,
  	"home_hero_title" varchar,
  	"home_hero_caption" varchar,
  	"lang_hoi_eyebrow" varchar,
  	"lang_hoi_title" varchar,
  	"lang_hoi_lead" varchar,
  	"lang_hoi_founder_conflict_editor_note" varchar,
  	"lang_hoi_founder_no_portrait" varchar,
  	"lang_hoi_location_text" varchar,
  	"lang_hoi_location_editor_note" varchar,
  	"lang_hoi_heritage_editor_note" varchar,
  	"cau_chuyen_eyebrow" varchar,
  	"cau_chuyen_title" varchar,
  	"cau_chuyen_lead" varchar,
  	"nghe_det_chieu_eyebrow" varchar,
  	"nghe_det_chieu_title" varchar,
  	"nghe_det_chieu_lead" varchar,
  	"nghe_det_chieu_hand_title" varchar,
  	"nghe_det_chieu_hand_text_text" varchar,
  	"nghe_det_chieu_hand_text_mobile_text" varchar,
  	"nghe_det_chieu_hand_note_text" varchar,
  	"nghe_det_chieu_hand_note_mobile_text" varchar,
  	"nghe_det_chieu_machine_title" varchar,
  	"nghe_det_chieu_machine_text_text" varchar,
  	"nghe_det_chieu_machine_text_mobile_text" varchar,
  	"nghe_det_chieu_machine_note_text" varchar,
  	"nghe_det_chieu_machine_note_mobile_text" varchar,
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
  
  CREATE TABLE "page_intros_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_page_intros_v_version_home_village_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_home_village_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_lang_hoi_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__page_intros_v_version_lang_hoi_media_slot",
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_lang_hoi_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_lang_hoi_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_lang_hoi_facts_locales" (
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
  
  CREATE TABLE "_lh_founder_sents_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lh_founder_sents_v_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_lh_founder_paras_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_lang_hoi_founder_conflict" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_lang_hoi_founder_conflict_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_lh_heritage_sents_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lh_heritage_sents_v_locales" (
  	"text" varchar,
  	"mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_cau_chuyen_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__page_intros_v_version_cau_chuyen_media_slot",
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_cau_chuyen_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_nghe_det_chieu_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__page_intros_v_version_nghe_det_chieu_media_slot",
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_nghe_det_chieu_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_nghe_det_chieu_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note_hide_on_mobile" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_nghe_det_chieu_tools_locales" (
  	"name" varchar,
  	"note_text" varchar,
  	"note_mobile_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_ndc_compare_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ndc_compare_v_locales" (
  	"aspect" varchar,
  	"hand" varchar,
  	"machine" varchar,
  	"mobile" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_con_nguoi_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__page_intros_v_version_con_nguoi_media_slot",
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_con_nguoi_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v_version_san_pham_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__page_intros_v_version_san_pham_media_slot",
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_intros_v_version_san_pham_media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_page_intros_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_home_hero_image_id" integer,
  	"version_home_hero_inset_id" integer,
  	"version_nghe_det_chieu_hand_text_hide_on_mobile" boolean,
  	"version_nghe_det_chieu_hand_note_hide_on_mobile" boolean,
  	"version_nghe_det_chieu_machine_text_hide_on_mobile" boolean,
  	"version_nghe_det_chieu_machine_note_hide_on_mobile" boolean,
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
  	"version_home_hero_caption" varchar,
  	"version_lang_hoi_eyebrow" varchar,
  	"version_lang_hoi_title" varchar,
  	"version_lang_hoi_lead" varchar,
  	"version_lang_hoi_founder_conflict_editor_note" varchar,
  	"version_lang_hoi_founder_no_portrait" varchar,
  	"version_lang_hoi_location_text" varchar,
  	"version_lang_hoi_location_editor_note" varchar,
  	"version_lang_hoi_heritage_editor_note" varchar,
  	"version_cau_chuyen_eyebrow" varchar,
  	"version_cau_chuyen_title" varchar,
  	"version_cau_chuyen_lead" varchar,
  	"version_nghe_det_chieu_eyebrow" varchar,
  	"version_nghe_det_chieu_title" varchar,
  	"version_nghe_det_chieu_lead" varchar,
  	"version_nghe_det_chieu_hand_title" varchar,
  	"version_nghe_det_chieu_hand_text_text" varchar,
  	"version_nghe_det_chieu_hand_text_mobile_text" varchar,
  	"version_nghe_det_chieu_hand_note_text" varchar,
  	"version_nghe_det_chieu_hand_note_mobile_text" varchar,
  	"version_nghe_det_chieu_machine_title" varchar,
  	"version_nghe_det_chieu_machine_text_text" varchar,
  	"version_nghe_det_chieu_machine_text_mobile_text" varchar,
  	"version_nghe_det_chieu_machine_note_text" varchar,
  	"version_nghe_det_chieu_machine_note_mobile_text" varchar,
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
  
  CREATE TABLE "_page_intros_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  ALTER TABLE "page_intros_home_village_images" ADD CONSTRAINT "page_intros_home_village_images_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_home_village_images" ADD CONSTRAINT "page_intros_home_village_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_home_village_images_locales" ADD CONSTRAINT "page_intros_home_village_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_home_village_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_media" ADD CONSTRAINT "page_intros_lang_hoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_media" ADD CONSTRAINT "page_intros_lang_hoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_media_locales" ADD CONSTRAINT "page_intros_lang_hoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_lang_hoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_facts" ADD CONSTRAINT "page_intros_lang_hoi_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_facts_locales" ADD CONSTRAINT "page_intros_lang_hoi_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_lang_hoi_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_founder_sents" ADD CONSTRAINT "lh_founder_sents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lh_founder_paras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_founder_sents_locales" ADD CONSTRAINT "lh_founder_sents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lh_founder_sents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_founder_paras" ADD CONSTRAINT "lh_founder_paras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_founder_conflict" ADD CONSTRAINT "page_intros_lang_hoi_founder_conflict_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_founder_conflict_locales" ADD CONSTRAINT "page_intros_lang_hoi_founder_conflict_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_lang_hoi_founder_conflict"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_heritage_sents" ADD CONSTRAINT "lh_heritage_sents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_heritage_sents_locales" ADD CONSTRAINT "lh_heritage_sents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lh_heritage_sents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_cau_chuyen_media" ADD CONSTRAINT "page_intros_cau_chuyen_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_cau_chuyen_media" ADD CONSTRAINT "page_intros_cau_chuyen_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_cau_chuyen_media_locales" ADD CONSTRAINT "page_intros_cau_chuyen_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_cau_chuyen_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_media" ADD CONSTRAINT "page_intros_nghe_det_chieu_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_media" ADD CONSTRAINT "page_intros_nghe_det_chieu_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_media_locales" ADD CONSTRAINT "page_intros_nghe_det_chieu_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_nghe_det_chieu_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_tools" ADD CONSTRAINT "page_intros_nghe_det_chieu_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_tools_locales" ADD CONSTRAINT "page_intros_nghe_det_chieu_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_nghe_det_chieu_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ndc_compare" ADD CONSTRAINT "ndc_compare_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ndc_compare_locales" ADD CONSTRAINT "ndc_compare_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ndc_compare"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_con_nguoi_media" ADD CONSTRAINT "page_intros_con_nguoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_con_nguoi_media" ADD CONSTRAINT "page_intros_con_nguoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_con_nguoi_media_locales" ADD CONSTRAINT "page_intros_con_nguoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_con_nguoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_san_pham_media" ADD CONSTRAINT "page_intros_san_pham_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_san_pham_media" ADD CONSTRAINT "page_intros_san_pham_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_san_pham_media_locales" ADD CONSTRAINT "page_intros_san_pham_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_san_pham_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros" ADD CONSTRAINT "page_intros_home_hero_image_id_archive_assets_id_fk" FOREIGN KEY ("home_hero_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros" ADD CONSTRAINT "page_intros_home_hero_inset_id_archive_assets_id_fk" FOREIGN KEY ("home_hero_inset_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_locales" ADD CONSTRAINT "page_intros_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_rels" ADD CONSTRAINT "page_intros_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_rels" ADD CONSTRAINT "page_intros_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_home_village_images" ADD CONSTRAINT "_page_intros_v_version_home_village_images_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_home_village_images" ADD CONSTRAINT "_page_intros_v_version_home_village_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_home_village_images_locales" ADD CONSTRAINT "_page_intros_v_version_home_village_images_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_home_village_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_media" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_media" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_media_locales" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_lang_hoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_facts" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_facts_locales" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_lang_hoi_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_founder_sents_v" ADD CONSTRAINT "_lh_founder_sents_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lh_founder_paras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_founder_sents_v_locales" ADD CONSTRAINT "_lh_founder_sents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lh_founder_sents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_founder_paras_v" ADD CONSTRAINT "_lh_founder_paras_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_founder_conflict" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_founder_conflict_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_founder_conflict_locales" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_founder_conflict_locales__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_lang_hoi_founder_conflict"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_heritage_sents_v" ADD CONSTRAINT "_lh_heritage_sents_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_heritage_sents_v_locales" ADD CONSTRAINT "_lh_heritage_sents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lh_heritage_sents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_cau_chuyen_media" ADD CONSTRAINT "_page_intros_v_version_cau_chuyen_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_cau_chuyen_media" ADD CONSTRAINT "_page_intros_v_version_cau_chuyen_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_cau_chuyen_media_locales" ADD CONSTRAINT "_page_intros_v_version_cau_chuyen_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_cau_chuyen_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_media" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_media" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_media_locales" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_media_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_nghe_det_chieu_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_tools" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_tools_locales" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_tools_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_nghe_det_chieu_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ndc_compare_v" ADD CONSTRAINT "_ndc_compare_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ndc_compare_v_locales" ADD CONSTRAINT "_ndc_compare_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ndc_compare_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media" ADD CONSTRAINT "_page_intros_v_version_con_nguoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media" ADD CONSTRAINT "_page_intros_v_version_con_nguoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media_locales" ADD CONSTRAINT "_page_intros_v_version_con_nguoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_con_nguoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_san_pham_media" ADD CONSTRAINT "_page_intros_v_version_san_pham_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_san_pham_media" ADD CONSTRAINT "_page_intros_v_version_san_pham_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_san_pham_media_locales" ADD CONSTRAINT "_page_intros_v_version_san_pham_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_san_pham_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v" ADD CONSTRAINT "_page_intros_v_version_home_hero_image_id_archive_assets_id_fk" FOREIGN KEY ("version_home_hero_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v" ADD CONSTRAINT "_page_intros_v_version_home_hero_inset_id_archive_assets_id_fk" FOREIGN KEY ("version_home_hero_inset_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_locales" ADD CONSTRAINT "_page_intros_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_rels" ADD CONSTRAINT "_page_intros_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_rels" ADD CONSTRAINT "_page_intros_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_intros_home_village_images_order_idx" ON "page_intros_home_village_images" USING btree ("_order");
  CREATE INDEX "page_intros_home_village_images_parent_id_idx" ON "page_intros_home_village_images" USING btree ("_parent_id");
  CREATE INDEX "page_intros_home_village_images_image_idx" ON "page_intros_home_village_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_home_village_images_locales_locale_parent_id_uni" ON "page_intros_home_village_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_home_village_images_locales_parent_id_idx" ON "page_intros_home_village_images_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_lang_hoi_media_order_idx" ON "page_intros_lang_hoi_media" USING btree ("_order");
  CREATE INDEX "page_intros_lang_hoi_media_parent_id_idx" ON "page_intros_lang_hoi_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_lang_hoi_media_image_idx" ON "page_intros_lang_hoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_lang_hoi_media_locales_locale_parent_id_unique" ON "page_intros_lang_hoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_lang_hoi_media_locales_parent_id_idx" ON "page_intros_lang_hoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_lang_hoi_facts_order_idx" ON "page_intros_lang_hoi_facts" USING btree ("_order");
  CREATE INDEX "page_intros_lang_hoi_facts_parent_id_idx" ON "page_intros_lang_hoi_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "page_intros_lang_hoi_facts_locales_locale_parent_id_unique" ON "page_intros_lang_hoi_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_lang_hoi_facts_locales_parent_id_idx" ON "page_intros_lang_hoi_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "lh_founder_sents_order_idx" ON "lh_founder_sents" USING btree ("_order");
  CREATE INDEX "lh_founder_sents_parent_id_idx" ON "lh_founder_sents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "lh_founder_sents_locales_locale_parent_id_unique" ON "lh_founder_sents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "lh_founder_sents_locales_parent_id_idx" ON "lh_founder_sents_locales" USING btree ("_parent_id");
  CREATE INDEX "lh_founder_paras_order_idx" ON "lh_founder_paras" USING btree ("_order");
  CREATE INDEX "lh_founder_paras_parent_id_idx" ON "lh_founder_paras" USING btree ("_parent_id");
  CREATE INDEX "page_intros_lang_hoi_founder_conflict_order_idx" ON "page_intros_lang_hoi_founder_conflict" USING btree ("_order");
  CREATE INDEX "page_intros_lang_hoi_founder_conflict_parent_id_idx" ON "page_intros_lang_hoi_founder_conflict" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "page_intros_lang_hoi_founder_conflict_locales_locale_parent_" ON "page_intros_lang_hoi_founder_conflict_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_lang_hoi_founder_conflict_locales_parent_id_idx" ON "page_intros_lang_hoi_founder_conflict_locales" USING btree ("_parent_id");
  CREATE INDEX "lh_heritage_sents_order_idx" ON "lh_heritage_sents" USING btree ("_order");
  CREATE INDEX "lh_heritage_sents_parent_id_idx" ON "lh_heritage_sents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "lh_heritage_sents_locales_locale_parent_id_unique" ON "lh_heritage_sents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "lh_heritage_sents_locales_parent_id_idx" ON "lh_heritage_sents_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_cau_chuyen_media_order_idx" ON "page_intros_cau_chuyen_media" USING btree ("_order");
  CREATE INDEX "page_intros_cau_chuyen_media_parent_id_idx" ON "page_intros_cau_chuyen_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_cau_chuyen_media_image_idx" ON "page_intros_cau_chuyen_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_cau_chuyen_media_locales_locale_parent_id_unique" ON "page_intros_cau_chuyen_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_cau_chuyen_media_locales_parent_id_idx" ON "page_intros_cau_chuyen_media_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_media_order_idx" ON "page_intros_nghe_det_chieu_media" USING btree ("_order");
  CREATE INDEX "page_intros_nghe_det_chieu_media_parent_id_idx" ON "page_intros_nghe_det_chieu_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_media_image_idx" ON "page_intros_nghe_det_chieu_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_nghe_det_chieu_media_locales_locale_parent_id_un" ON "page_intros_nghe_det_chieu_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_media_locales_parent_id_idx" ON "page_intros_nghe_det_chieu_media_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_tools_order_idx" ON "page_intros_nghe_det_chieu_tools" USING btree ("_order");
  CREATE INDEX "page_intros_nghe_det_chieu_tools_parent_id_idx" ON "page_intros_nghe_det_chieu_tools" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "page_intros_nghe_det_chieu_tools_locales_locale_parent_id_un" ON "page_intros_nghe_det_chieu_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_tools_locales_parent_id_idx" ON "page_intros_nghe_det_chieu_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "ndc_compare_order_idx" ON "ndc_compare" USING btree ("_order");
  CREATE INDEX "ndc_compare_parent_id_idx" ON "ndc_compare" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ndc_compare_locales_locale_parent_id_unique" ON "ndc_compare_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ndc_compare_locales_parent_id_idx" ON "ndc_compare_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_con_nguoi_media_order_idx" ON "page_intros_con_nguoi_media" USING btree ("_order");
  CREATE INDEX "page_intros_con_nguoi_media_parent_id_idx" ON "page_intros_con_nguoi_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_con_nguoi_media_image_idx" ON "page_intros_con_nguoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_con_nguoi_media_locales_locale_parent_id_unique" ON "page_intros_con_nguoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_con_nguoi_media_locales_parent_id_idx" ON "page_intros_con_nguoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_san_pham_media_order_idx" ON "page_intros_san_pham_media" USING btree ("_order");
  CREATE INDEX "page_intros_san_pham_media_parent_id_idx" ON "page_intros_san_pham_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_san_pham_media_image_idx" ON "page_intros_san_pham_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_san_pham_media_locales_locale_parent_id_unique" ON "page_intros_san_pham_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_san_pham_media_locales_parent_id_idx" ON "page_intros_san_pham_media_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_home_home_hero_image_idx" ON "page_intros" USING btree ("home_hero_image_id");
  CREATE INDEX "page_intros_home_home_hero_inset_idx" ON "page_intros" USING btree ("home_hero_inset_id");
  CREATE INDEX "page_intros__status_idx" ON "page_intros" USING btree ("_status");
  CREATE UNIQUE INDEX "page_intros_locales_locale_parent_id_unique" ON "page_intros_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_locales_parent_id_idx" ON "page_intros_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_rels_order_idx" ON "page_intros_rels" USING btree ("order");
  CREATE INDEX "page_intros_rels_parent_idx" ON "page_intros_rels" USING btree ("parent_id");
  CREATE INDEX "page_intros_rels_path_idx" ON "page_intros_rels" USING btree ("path");
  CREATE INDEX "page_intros_rels_sources_id_idx" ON "page_intros_rels" USING btree ("sources_id");
  CREATE INDEX "_page_intros_v_version_home_village_images_order_idx" ON "_page_intros_v_version_home_village_images" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_home_village_images_parent_id_idx" ON "_page_intros_v_version_home_village_images" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_home_village_images_image_idx" ON "_page_intros_v_version_home_village_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_home_village_images_locales_locale_pa" ON "_page_intros_v_version_home_village_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_home_village_images_locales_paren_idx" ON "_page_intros_v_version_home_village_images_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_order_idx" ON "_page_intros_v_version_lang_hoi_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_parent_id_idx" ON "_page_intros_v_version_lang_hoi_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_image_idx" ON "_page_intros_v_version_lang_hoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_lang_hoi_media_locales_locale_parent_" ON "_page_intros_v_version_lang_hoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_locales_parent_id_idx" ON "_page_intros_v_version_lang_hoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_facts_order_idx" ON "_page_intros_v_version_lang_hoi_facts" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_lang_hoi_facts_parent_id_idx" ON "_page_intros_v_version_lang_hoi_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_lang_hoi_facts_locales_locale_parent_" ON "_page_intros_v_version_lang_hoi_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_facts_locales_parent_id_idx" ON "_page_intros_v_version_lang_hoi_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "_lh_founder_sents_v_order_idx" ON "_lh_founder_sents_v" USING btree ("_order");
  CREATE INDEX "_lh_founder_sents_v_parent_id_idx" ON "_lh_founder_sents_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_lh_founder_sents_v_locales_locale_parent_id_unique" ON "_lh_founder_sents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_lh_founder_sents_v_locales_parent_id_idx" ON "_lh_founder_sents_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_lh_founder_paras_v_order_idx" ON "_lh_founder_paras_v" USING btree ("_order");
  CREATE INDEX "_lh_founder_paras_v_parent_id_idx" ON "_lh_founder_paras_v" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_founder_conflict_order_idx" ON "_page_intros_v_version_lang_hoi_founder_conflict" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_lang_hoi_founder_conflict_parent_id_idx" ON "_page_intros_v_version_lang_hoi_founder_conflict" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_lang_hoi_founder_conflict_locales_loc" ON "_page_intros_v_version_lang_hoi_founder_conflict_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_founder_conflict_locales_idx" ON "_page_intros_v_version_lang_hoi_founder_conflict_locales" USING btree ("_parent_id");
  CREATE INDEX "_lh_heritage_sents_v_order_idx" ON "_lh_heritage_sents_v" USING btree ("_order");
  CREATE INDEX "_lh_heritage_sents_v_parent_id_idx" ON "_lh_heritage_sents_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_lh_heritage_sents_v_locales_locale_parent_id_unique" ON "_lh_heritage_sents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_lh_heritage_sents_v_locales_parent_id_idx" ON "_lh_heritage_sents_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_order_idx" ON "_page_intros_v_version_cau_chuyen_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_parent_id_idx" ON "_page_intros_v_version_cau_chuyen_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_image_idx" ON "_page_intros_v_version_cau_chuyen_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_cau_chuyen_media_locales_locale_paren" ON "_page_intros_v_version_cau_chuyen_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_locales_parent_i_idx" ON "_page_intros_v_version_cau_chuyen_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_order_idx" ON "_page_intros_v_version_nghe_det_chieu_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_parent_id_idx" ON "_page_intros_v_version_nghe_det_chieu_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_image_idx" ON "_page_intros_v_version_nghe_det_chieu_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_nghe_det_chieu_media_locales_locale_p" ON "_page_intros_v_version_nghe_det_chieu_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_locales_pare_idx" ON "_page_intros_v_version_nghe_det_chieu_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_tools_order_idx" ON "_page_intros_v_version_nghe_det_chieu_tools" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_tools_parent_id_idx" ON "_page_intros_v_version_nghe_det_chieu_tools" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_nghe_det_chieu_tools_locales_locale_p" ON "_page_intros_v_version_nghe_det_chieu_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_tools_locales_pare_idx" ON "_page_intros_v_version_nghe_det_chieu_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "_ndc_compare_v_order_idx" ON "_ndc_compare_v" USING btree ("_order");
  CREATE INDEX "_ndc_compare_v_parent_id_idx" ON "_ndc_compare_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_ndc_compare_v_locales_locale_parent_id_unique" ON "_ndc_compare_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_ndc_compare_v_locales_parent_id_idx" ON "_ndc_compare_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_order_idx" ON "_page_intros_v_version_con_nguoi_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_parent_id_idx" ON "_page_intros_v_version_con_nguoi_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_image_idx" ON "_page_intros_v_version_con_nguoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_con_nguoi_media_locales_locale_parent" ON "_page_intros_v_version_con_nguoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_locales_parent_id_idx" ON "_page_intros_v_version_con_nguoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_san_pham_media_order_idx" ON "_page_intros_v_version_san_pham_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_san_pham_media_parent_id_idx" ON "_page_intros_v_version_san_pham_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_san_pham_media_image_idx" ON "_page_intros_v_version_san_pham_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_san_pham_media_locales_locale_parent_" ON "_page_intros_v_version_san_pham_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_san_pham_media_locales_parent_id_idx" ON "_page_intros_v_version_san_pham_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_home_version_home_hero_image_idx" ON "_page_intros_v" USING btree ("version_home_hero_image_id");
  CREATE INDEX "_page_intros_v_version_home_version_home_hero_inset_idx" ON "_page_intros_v" USING btree ("version_home_hero_inset_id");
  CREATE INDEX "_page_intros_v_version_version__status_idx" ON "_page_intros_v" USING btree ("version__status");
  CREATE INDEX "_page_intros_v_created_at_idx" ON "_page_intros_v" USING btree ("created_at");
  CREATE INDEX "_page_intros_v_updated_at_idx" ON "_page_intros_v" USING btree ("updated_at");
  CREATE INDEX "_page_intros_v_snapshot_idx" ON "_page_intros_v" USING btree ("snapshot");
  CREATE INDEX "_page_intros_v_published_locale_idx" ON "_page_intros_v" USING btree ("published_locale");
  CREATE INDEX "_page_intros_v_latest_idx" ON "_page_intros_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_page_intros_v_locales_locale_parent_id_unique" ON "_page_intros_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_locales_parent_id_idx" ON "_page_intros_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_rels_order_idx" ON "_page_intros_v_rels" USING btree ("order");
  CREATE INDEX "_page_intros_v_rels_parent_idx" ON "_page_intros_v_rels" USING btree ("parent_id");
  CREATE INDEX "_page_intros_v_rels_path_idx" ON "_page_intros_v_rels" USING btree ("path");
  CREATE INDEX "_page_intros_v_rels_sources_id_idx" ON "_page_intros_v_rels" USING btree ("sources_id");`)
}
