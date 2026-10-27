import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_intros_lang_hoi_media_slot" AS ENUM('hero', 'life-1', 'life-2', 'life-3');
  CREATE TYPE "public"."enum_page_intros_nghe_det_chieu_media_slot" AS ENUM('hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products');
  CREATE TYPE "public"."enum__page_intros_v_version_lang_hoi_media_slot" AS ENUM('hero', 'life-1', 'life-2', 'life-3');
  CREATE TYPE "public"."enum__page_intros_v_version_nghe_det_chieu_media_slot" AS ENUM('hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products');
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
  
  ALTER TABLE "craft_steps_locales" ADD COLUMN "short_title" varchar;
  ALTER TABLE "craft_steps_locales" ADD COLUMN "to_record" varchar;
  ALTER TABLE "_craft_steps_v_locales" ADD COLUMN "version_short_title" varchar;
  ALTER TABLE "_craft_steps_v_locales" ADD COLUMN "version_to_record" varchar;
  ALTER TABLE "page_intros_lang_hoi_media" ADD CONSTRAINT "page_intros_lang_hoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_media" ADD CONSTRAINT "page_intros_lang_hoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_lang_hoi_media_locales" ADD CONSTRAINT "page_intros_lang_hoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_lang_hoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_media" ADD CONSTRAINT "page_intros_nghe_det_chieu_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_media" ADD CONSTRAINT "page_intros_nghe_det_chieu_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_nghe_det_chieu_media_locales" ADD CONSTRAINT "page_intros_nghe_det_chieu_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_nghe_det_chieu_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_media" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_media" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_lang_hoi_media_locales" ADD CONSTRAINT "_page_intros_v_version_lang_hoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_lang_hoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_media" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_media" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_nghe_det_chieu_media_locales" ADD CONSTRAINT "_page_intros_v_version_nghe_det_chieu_media_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_nghe_det_chieu_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_intros_lang_hoi_media_order_idx" ON "page_intros_lang_hoi_media" USING btree ("_order");
  CREATE INDEX "page_intros_lang_hoi_media_parent_id_idx" ON "page_intros_lang_hoi_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_lang_hoi_media_image_idx" ON "page_intros_lang_hoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_lang_hoi_media_locales_locale_parent_id_unique" ON "page_intros_lang_hoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_lang_hoi_media_locales_parent_id_idx" ON "page_intros_lang_hoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_media_order_idx" ON "page_intros_nghe_det_chieu_media" USING btree ("_order");
  CREATE INDEX "page_intros_nghe_det_chieu_media_parent_id_idx" ON "page_intros_nghe_det_chieu_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_media_image_idx" ON "page_intros_nghe_det_chieu_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_nghe_det_chieu_media_locales_locale_parent_id_un" ON "page_intros_nghe_det_chieu_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_nghe_det_chieu_media_locales_parent_id_idx" ON "page_intros_nghe_det_chieu_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_order_idx" ON "_page_intros_v_version_lang_hoi_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_parent_id_idx" ON "_page_intros_v_version_lang_hoi_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_image_idx" ON "_page_intros_v_version_lang_hoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_lang_hoi_media_locales_locale_parent_" ON "_page_intros_v_version_lang_hoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_lang_hoi_media_locales_parent_id_idx" ON "_page_intros_v_version_lang_hoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_order_idx" ON "_page_intros_v_version_nghe_det_chieu_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_parent_id_idx" ON "_page_intros_v_version_nghe_det_chieu_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_image_idx" ON "_page_intros_v_version_nghe_det_chieu_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_nghe_det_chieu_media_locales_locale_p" ON "_page_intros_v_version_nghe_det_chieu_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_nghe_det_chieu_media_locales_pare_idx" ON "_page_intros_v_version_nghe_det_chieu_media_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_intros_lang_hoi_media" CASCADE;
  DROP TABLE "page_intros_lang_hoi_media_locales" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_media" CASCADE;
  DROP TABLE "page_intros_nghe_det_chieu_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_media" CASCADE;
  DROP TABLE "_page_intros_v_version_lang_hoi_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_media" CASCADE;
  DROP TABLE "_page_intros_v_version_nghe_det_chieu_media_locales" CASCADE;
  ALTER TABLE "craft_steps_locales" DROP COLUMN "short_title";
  ALTER TABLE "craft_steps_locales" DROP COLUMN "to_record";
  ALTER TABLE "_craft_steps_v_locales" DROP COLUMN "version_short_title";
  ALTER TABLE "_craft_steps_v_locales" DROP COLUMN "version_to_record";
  DROP TYPE "public"."enum_page_intros_lang_hoi_media_slot";
  DROP TYPE "public"."enum_page_intros_nghe_det_chieu_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_lang_hoi_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_nghe_det_chieu_media_slot";`)
}
