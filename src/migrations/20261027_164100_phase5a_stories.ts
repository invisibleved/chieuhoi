import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_intros_cau_chuyen_media_slot" AS ENUM('next-village', 'next-craft');
  CREATE TYPE "public"."enum__page_intros_v_version_cau_chuyen_media_slot" AS ENUM('next-village', 'next-craft');
  CREATE TABLE "stories_review_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "stories_review_checklist_locales" (
  	"item" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_stories_v_version_review_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_stories_v_version_review_checklist_locales" (
  	"item" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  ALTER TABLE "stories" ADD COLUMN "published_at" varchar;
  ALTER TABLE "stories_locales" ADD COLUMN "cover_caption" varchar;
  ALTER TABLE "_stories_v" ADD COLUMN "version_published_at" varchar;
  ALTER TABLE "_stories_v_locales" ADD COLUMN "version_cover_caption" varchar;
  ALTER TABLE "stories_review_checklist" ADD CONSTRAINT "stories_review_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_review_checklist_locales" ADD CONSTRAINT "stories_review_checklist_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories_review_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_review_checklist" ADD CONSTRAINT "_stories_v_version_review_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_review_checklist_locales" ADD CONSTRAINT "_stories_v_version_review_checklist_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v_version_review_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_cau_chuyen_media" ADD CONSTRAINT "page_intros_cau_chuyen_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_cau_chuyen_media" ADD CONSTRAINT "page_intros_cau_chuyen_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_cau_chuyen_media_locales" ADD CONSTRAINT "page_intros_cau_chuyen_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_cau_chuyen_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_cau_chuyen_media" ADD CONSTRAINT "_page_intros_v_version_cau_chuyen_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_cau_chuyen_media" ADD CONSTRAINT "_page_intros_v_version_cau_chuyen_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_cau_chuyen_media_locales" ADD CONSTRAINT "_page_intros_v_version_cau_chuyen_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_cau_chuyen_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "stories_review_checklist_order_idx" ON "stories_review_checklist" USING btree ("_order");
  CREATE INDEX "stories_review_checklist_parent_id_idx" ON "stories_review_checklist" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "stories_review_checklist_locales_locale_parent_id_unique" ON "stories_review_checklist_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "stories_review_checklist_locales_parent_id_idx" ON "stories_review_checklist_locales" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_version_review_checklist_order_idx" ON "_stories_v_version_review_checklist" USING btree ("_order");
  CREATE INDEX "_stories_v_version_review_checklist_parent_id_idx" ON "_stories_v_version_review_checklist" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_stories_v_version_review_checklist_locales_locale_parent_id" ON "_stories_v_version_review_checklist_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_stories_v_version_review_checklist_locales_parent_id_idx" ON "_stories_v_version_review_checklist_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_cau_chuyen_media_order_idx" ON "page_intros_cau_chuyen_media" USING btree ("_order");
  CREATE INDEX "page_intros_cau_chuyen_media_parent_id_idx" ON "page_intros_cau_chuyen_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_cau_chuyen_media_image_idx" ON "page_intros_cau_chuyen_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_cau_chuyen_media_locales_locale_parent_id_unique" ON "page_intros_cau_chuyen_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_cau_chuyen_media_locales_parent_id_idx" ON "page_intros_cau_chuyen_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_order_idx" ON "_page_intros_v_version_cau_chuyen_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_parent_id_idx" ON "_page_intros_v_version_cau_chuyen_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_image_idx" ON "_page_intros_v_version_cau_chuyen_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_cau_chuyen_media_locales_locale_paren" ON "_page_intros_v_version_cau_chuyen_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_cau_chuyen_media_locales_parent_i_idx" ON "_page_intros_v_version_cau_chuyen_media_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "stories_review_checklist" CASCADE;
  DROP TABLE "stories_review_checklist_locales" CASCADE;
  DROP TABLE "_stories_v_version_review_checklist" CASCADE;
  DROP TABLE "_stories_v_version_review_checklist_locales" CASCADE;
  DROP TABLE "page_intros_cau_chuyen_media" CASCADE;
  DROP TABLE "page_intros_cau_chuyen_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_cau_chuyen_media" CASCADE;
  DROP TABLE "_page_intros_v_version_cau_chuyen_media_locales" CASCADE;
  ALTER TABLE "stories" DROP COLUMN "published_at";
  ALTER TABLE "stories_locales" DROP COLUMN "cover_caption";
  ALTER TABLE "_stories_v" DROP COLUMN "version_published_at";
  ALTER TABLE "_stories_v_locales" DROP COLUMN "version_cover_caption";
  DROP TYPE "public"."enum_page_intros_cau_chuyen_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_cau_chuyen_media_slot";`)
}
