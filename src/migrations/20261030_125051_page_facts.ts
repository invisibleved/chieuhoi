import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  
  CREATE TABLE "page_intros_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
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
  
  CREATE TABLE "_page_intros_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  ALTER TABLE "page_intros" ADD COLUMN "nghe_det_chieu_hand_text_hide_on_mobile" boolean;
  ALTER TABLE "page_intros" ADD COLUMN "nghe_det_chieu_hand_note_hide_on_mobile" boolean;
  ALTER TABLE "page_intros" ADD COLUMN "nghe_det_chieu_machine_text_hide_on_mobile" boolean;
  ALTER TABLE "page_intros" ADD COLUMN "nghe_det_chieu_machine_note_hide_on_mobile" boolean;
  ALTER TABLE "page_intros_locales" ADD COLUMN "lang_hoi_founder_conflict_editor_note" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "lang_hoi_founder_no_portrait" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "lang_hoi_location_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "lang_hoi_location_editor_note" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "lang_hoi_heritage_editor_note" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_hand_title" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_hand_text_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_hand_text_mobile_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_hand_note_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_hand_note_mobile_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_machine_title" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_machine_text_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_machine_text_mobile_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_machine_note_text" varchar;
  ALTER TABLE "page_intros_locales" ADD COLUMN "nghe_det_chieu_machine_note_mobile_text" varchar;
  ALTER TABLE "_page_intros_v" ADD COLUMN "version_nghe_det_chieu_hand_text_hide_on_mobile" boolean;
  ALTER TABLE "_page_intros_v" ADD COLUMN "version_nghe_det_chieu_hand_note_hide_on_mobile" boolean;
  ALTER TABLE "_page_intros_v" ADD COLUMN "version_nghe_det_chieu_machine_text_hide_on_mobile" boolean;
  ALTER TABLE "_page_intros_v" ADD COLUMN "version_nghe_det_chieu_machine_note_hide_on_mobile" boolean;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_lang_hoi_founder_conflict_editor_note" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_lang_hoi_founder_no_portrait" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_lang_hoi_location_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_lang_hoi_location_editor_note" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_lang_hoi_heritage_editor_note" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_hand_title" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_hand_text_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_hand_text_mobile_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_hand_note_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_hand_note_mobile_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_machine_title" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_machine_text_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_machine_text_mobile_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_machine_note_text" varchar;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_nghe_det_chieu_machine_note_mobile_text" varchar;
  ALTER TABLE "page_intros_lang_hoi_facts" ADD CONSTRAINT "page_intros_lang_hoi_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_facts_locales" ADD CONSTRAINT "page_intros_lang_hoi_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_lang_hoi_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_founder_sents" ADD CONSTRAINT "lh_founder_sents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lh_founder_paras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_founder_sents_locales" ADD CONSTRAINT "lh_founder_sents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lh_founder_sents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_founder_paras" ADD CONSTRAINT "lh_founder_paras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_founder_conflict" ADD CONSTRAINT "page_intros_lang_hoi_founder_conflict_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_founder_conflict_locales" ADD CONSTRAINT "page_intros_lang_hoi_founder_conflict_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_lang_hoi_founder_conflict"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_heritage_sents" ADD CONSTRAINT "lh_heritage_sents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lh_heritage_sents_locales" ADD CONSTRAINT "lh_heritage_sents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lh_heritage_sents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_tools" ADD CONSTRAINT "page_intros_nghe_det_chieu_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_tools_locales" ADD CONSTRAINT "page_intros_nghe_det_chieu_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_nghe_det_chieu_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ndc_compare" ADD CONSTRAINT "ndc_compare_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ndc_compare_locales" ADD CONSTRAINT "ndc_compare_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ndc_compare"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_rels" ADD CONSTRAINT "page_intros_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_rels" ADD CONSTRAINT "page_intros_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_facts" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_facts_locales" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_lang_hoi_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_founder_sents_v" ADD CONSTRAINT "_lh_founder_sents_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lh_founder_paras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_founder_sents_v_locales" ADD CONSTRAINT "_lh_founder_sents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lh_founder_sents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_founder_paras_v" ADD CONSTRAINT "_lh_founder_paras_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_founder_conflict" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_founder_conflict_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_founder_conflict_locales" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_founder_conflict_locales__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_lang_hoi_founder_conflict"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_heritage_sents_v" ADD CONSTRAINT "_lh_heritage_sents_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lh_heritage_sents_v_locales" ADD CONSTRAINT "_lh_heritage_sents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lh_heritage_sents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_tools" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_tools_locales" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_tools_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_nghe_det_chieu_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ndc_compare_v" ADD CONSTRAINT "_ndc_compare_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ndc_compare_v_locales" ADD CONSTRAINT "_ndc_compare_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ndc_compare_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_rels" ADD CONSTRAINT "_page_intros_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_rels" ADD CONSTRAINT "_page_intros_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "page_intros_nghe_det_chieu_tools_order_idx" ON "page_intros_nghe_det_chieu_tools" USING btree ("_order");
  CREATE INDEX "page_intros_nghe_det_chieu_tools_parent_id_idx" ON "page_intros_nghe_det_chieu_tools" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "page_intros_nghe_det_chieu_tools_locales_locale_parent_id_un" ON "page_intros_nghe_det_chieu_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_tools_locales_parent_id_idx" ON "page_intros_nghe_det_chieu_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "ndc_compare_order_idx" ON "ndc_compare" USING btree ("_order");
  CREATE INDEX "ndc_compare_parent_id_idx" ON "ndc_compare" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ndc_compare_locales_locale_parent_id_unique" ON "ndc_compare_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ndc_compare_locales_parent_id_idx" ON "ndc_compare_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_rels_order_idx" ON "page_intros_rels" USING btree ("order");
  CREATE INDEX "page_intros_rels_parent_idx" ON "page_intros_rels" USING btree ("parent_id");
  CREATE INDEX "page_intros_rels_path_idx" ON "page_intros_rels" USING btree ("path");
  CREATE INDEX "page_intros_rels_sources_id_idx" ON "page_intros_rels" USING btree ("sources_id");
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
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_tools_order_idx" ON "_page_intros_v_version_nghe_det_chieu_tools" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_tools_parent_id_idx" ON "_page_intros_v_version_nghe_det_chieu_tools" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_nghe_det_chieu_tools_locales_locale_p" ON "_page_intros_v_version_nghe_det_chieu_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_tools_locales_pare_idx" ON "_page_intros_v_version_nghe_det_chieu_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "_ndc_compare_v_order_idx" ON "_ndc_compare_v" USING btree ("_order");
  CREATE INDEX "_ndc_compare_v_parent_id_idx" ON "_ndc_compare_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_ndc_compare_v_locales_locale_parent_id_unique" ON "_ndc_compare_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_ndc_compare_v_locales_parent_id_idx" ON "_ndc_compare_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_rels_order_idx" ON "_page_intros_v_rels" USING btree ("order");
  CREATE INDEX "_page_intros_v_rels_parent_idx" ON "_page_intros_v_rels" USING btree ("parent_id");
  CREATE INDEX "_page_intros_v_rels_path_idx" ON "_page_intros_v_rels" USING btree ("path");
  CREATE INDEX "_page_intros_v_rels_sources_id_idx" ON "_page_intros_v_rels" USING btree ("sources_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_intros_lang_hoi_facts" CASCADE;
  DROP TABLE "page_intros_lang_hoi_facts_locales" CASCADE;
  DROP TABLE "lh_founder_sents" CASCADE;
  DROP TABLE "lh_founder_sents_locales" CASCADE;
  DROP TABLE "lh_founder_paras" CASCADE;
  DROP TABLE "page_intros_lang_hoi_founder_conflict" CASCADE;
  DROP TABLE "page_intros_lang_hoi_founder_conflict_locales" CASCADE;
  DROP TABLE "lh_heritage_sents" CASCADE;
  DROP TABLE "lh_heritage_sents_locales" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_tools" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_tools_locales" CASCADE;
  DROP TABLE "ndc_compare" CASCADE;
  DROP TABLE "ndc_compare_locales" CASCADE;
  DROP TABLE "page_intros_rels" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_facts" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_facts_locales" CASCADE;
  DROP TABLE "_lh_founder_sents_v" CASCADE;
  DROP TABLE "_lh_founder_sents_v_locales" CASCADE;
  DROP TABLE "_lh_founder_paras_v" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_founder_conflict" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_founder_conflict_locales" CASCADE;
  DROP TABLE "_lh_heritage_sents_v" CASCADE;
  DROP TABLE "_lh_heritage_sents_v_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_tools" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_tools_locales" CASCADE;
  DROP TABLE "_ndc_compare_v" CASCADE;
  DROP TABLE "_ndc_compare_v_locales" CASCADE;
  DROP TABLE "_page_intros_v_rels" CASCADE;
  ALTER TABLE "page_intros" DROP COLUMN "nghe_det_chieu_hand_text_hide_on_mobile";
  ALTER TABLE "page_intros" DROP COLUMN "nghe_det_chieu_hand_note_hide_on_mobile";
  ALTER TABLE "page_intros" DROP COLUMN "nghe_det_chieu_machine_text_hide_on_mobile";
  ALTER TABLE "page_intros" DROP COLUMN "nghe_det_chieu_machine_note_hide_on_mobile";
  ALTER TABLE "page_intros_locales" DROP COLUMN "lang_hoi_founder_conflict_editor_note";
  ALTER TABLE "page_intros_locales" DROP COLUMN "lang_hoi_founder_no_portrait";
  ALTER TABLE "page_intros_locales" DROP COLUMN "lang_hoi_location_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "lang_hoi_location_editor_note";
  ALTER TABLE "page_intros_locales" DROP COLUMN "lang_hoi_heritage_editor_note";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_hand_title";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_hand_text_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_hand_text_mobile_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_hand_note_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_hand_note_mobile_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_machine_title";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_machine_text_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_machine_text_mobile_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_machine_note_text";
  ALTER TABLE "page_intros_locales" DROP COLUMN "nghe_det_chieu_machine_note_mobile_text";
  ALTER TABLE "_page_intros_v" DROP COLUMN "version_nghe_det_chieu_hand_text_hide_on_mobile";
  ALTER TABLE "_page_intros_v" DROP COLUMN "version_nghe_det_chieu_hand_note_hide_on_mobile";
  ALTER TABLE "_page_intros_v" DROP COLUMN "version_nghe_det_chieu_machine_text_hide_on_mobile";
  ALTER TABLE "_page_intros_v" DROP COLUMN "version_nghe_det_chieu_machine_note_hide_on_mobile";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_lang_hoi_founder_conflict_editor_note";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_lang_hoi_founder_no_portrait";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_lang_hoi_location_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_lang_hoi_location_editor_note";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_lang_hoi_heritage_editor_note";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_hand_title";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_hand_text_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_hand_text_mobile_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_hand_note_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_hand_note_mobile_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_machine_title";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_machine_text_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_machine_text_mobile_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_machine_note_text";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_nghe_det_chieu_machine_note_mobile_text";`)
}
