import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_intros_con_nguoi_media_slot" AS ENUM('related-people');
  CREATE TYPE "public"."enum__page_intros_v_version_con_nguoi_media_slot" AS ENUM('related-people');
  CREATE TABLE "people_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "people_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_people_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_people_v_version_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  ALTER TABLE "people" ADD COLUMN "hamlet" varchar;
  ALTER TABLE "people" ADD COLUMN "recorded_by" varchar;
  ALTER TABLE "people" ADD COLUMN "recorded_at" varchar;
  ALTER TABLE "people" ADD COLUMN "related_step_id" integer;
  ALTER TABLE "people" ADD COLUMN "related_product_id" integer;
  ALTER TABLE "people_locales" ADD COLUMN "intro" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_hamlet" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_recorded_by" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_recorded_at" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_related_step_id" integer;
  ALTER TABLE "_people_v" ADD COLUMN "version_related_product_id" integer;
  ALTER TABLE "_people_v_locales" ADD COLUMN "version_intro" varchar;
  ALTER TABLE "people_gallery" ADD CONSTRAINT "people_gallery_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_gallery" ADD CONSTRAINT "people_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_gallery_locales" ADD CONSTRAINT "people_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v_version_gallery" ADD CONSTRAINT "_people_v_version_gallery_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v_version_gallery" ADD CONSTRAINT "_people_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v_version_gallery_locales" ADD CONSTRAINT "_people_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_con_nguoi_media" ADD CONSTRAINT "page_intros_con_nguoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_con_nguoi_media" ADD CONSTRAINT "page_intros_con_nguoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_con_nguoi_media_locales" ADD CONSTRAINT "page_intros_con_nguoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_con_nguoi_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media" ADD CONSTRAINT "_page_intros_v_version_con_nguoi_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media" ADD CONSTRAINT "_page_intros_v_version_con_nguoi_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media_locales" ADD CONSTRAINT "_page_intros_v_version_con_nguoi_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_con_nguoi_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "people_gallery_order_idx" ON "people_gallery" USING btree ("_order");
  CREATE INDEX "people_gallery_parent_id_idx" ON "people_gallery" USING btree ("_parent_id");
  CREATE INDEX "people_gallery_image_idx" ON "people_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "people_gallery_locales_locale_parent_id_unique" ON "people_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_gallery_locales_parent_id_idx" ON "people_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "_people_v_version_gallery_order_idx" ON "_people_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_people_v_version_gallery_parent_id_idx" ON "_people_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_people_v_version_gallery_image_idx" ON "_people_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_people_v_version_gallery_locales_locale_parent_id_unique" ON "_people_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_people_v_version_gallery_locales_parent_id_idx" ON "_people_v_version_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "page_intros_con_nguoi_media_order_idx" ON "page_intros_con_nguoi_media" USING btree ("_order");
  CREATE INDEX "page_intros_con_nguoi_media_parent_id_idx" ON "page_intros_con_nguoi_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_con_nguoi_media_image_idx" ON "page_intros_con_nguoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_con_nguoi_media_locales_locale_parent_id_unique" ON "page_intros_con_nguoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_con_nguoi_media_locales_parent_id_idx" ON "page_intros_con_nguoi_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_order_idx" ON "_page_intros_v_version_con_nguoi_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_parent_id_idx" ON "_page_intros_v_version_con_nguoi_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_image_idx" ON "_page_intros_v_version_con_nguoi_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_con_nguoi_media_locales_locale_parent" ON "_page_intros_v_version_con_nguoi_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_con_nguoi_media_locales_parent_id_idx" ON "_page_intros_v_version_con_nguoi_media_locales" USING btree ("_parent_id");
  ALTER TABLE "people" ADD CONSTRAINT "people_related_step_id_craft_steps_id_fk" FOREIGN KEY ("related_step_id") REFERENCES "public"."craft_steps"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_related_product_id_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_related_step_id_craft_steps_id_fk" FOREIGN KEY ("version_related_step_id") REFERENCES "public"."craft_steps"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_related_product_id_products_id_fk" FOREIGN KEY ("version_related_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "people_related_step_idx" ON "people" USING btree ("related_step_id");
  CREATE INDEX "people_related_product_idx" ON "people" USING btree ("related_product_id");
  CREATE INDEX "_people_v_version_version_related_step_idx" ON "_people_v" USING btree ("version_related_step_id");
  CREATE INDEX "_people_v_version_version_related_product_idx" ON "_people_v" USING btree ("version_related_product_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "people_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_gallery_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v_version_gallery_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_intros_con_nguoi_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_intros_con_nguoi_media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_intros_v_version_con_nguoi_media_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "people_gallery" CASCADE;
  DROP TABLE "people_gallery_locales" CASCADE;
  DROP TABLE "_people_v_version_gallery" CASCADE;
  DROP TABLE "_people_v_version_gallery_locales" CASCADE;
  DROP TABLE "page_intros_con_nguoi_media" CASCADE;
  DROP TABLE "page_intros_con_nguoi_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_con_nguoi_media" CASCADE;
  DROP TABLE "_page_intros_v_version_con_nguoi_media_locales" CASCADE;
  ALTER TABLE "people" DROP CONSTRAINT "people_related_step_id_craft_steps_id_fk";
  
  ALTER TABLE "people" DROP CONSTRAINT "people_related_product_id_products_id_fk";
  
  ALTER TABLE "_people_v" DROP CONSTRAINT "_people_v_version_related_step_id_craft_steps_id_fk";
  
  ALTER TABLE "_people_v" DROP CONSTRAINT "_people_v_version_related_product_id_products_id_fk";
  
  DROP INDEX "people_related_step_idx";
  DROP INDEX "people_related_product_idx";
  DROP INDEX "_people_v_version_version_related_step_idx";
  DROP INDEX "_people_v_version_version_related_product_idx";
  ALTER TABLE "people" DROP COLUMN "hamlet";
  ALTER TABLE "people" DROP COLUMN "recorded_by";
  ALTER TABLE "people" DROP COLUMN "recorded_at";
  ALTER TABLE "people" DROP COLUMN "related_step_id";
  ALTER TABLE "people" DROP COLUMN "related_product_id";
  ALTER TABLE "people_locales" DROP COLUMN "intro";
  ALTER TABLE "_people_v" DROP COLUMN "version_hamlet";
  ALTER TABLE "_people_v" DROP COLUMN "version_recorded_by";
  ALTER TABLE "_people_v" DROP COLUMN "version_recorded_at";
  ALTER TABLE "_people_v" DROP COLUMN "version_related_step_id";
  ALTER TABLE "_people_v" DROP COLUMN "version_related_product_id";
  ALTER TABLE "_people_v_locales" DROP COLUMN "version_intro";
  DROP TYPE "public"."enum_page_intros_con_nguoi_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_con_nguoi_media_slot";`)
}
