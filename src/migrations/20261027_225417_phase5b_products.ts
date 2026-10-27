import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_intros_san_pham_media_slot" AS ENUM('next-pattern');
  CREATE TYPE "public"."enum__page_intros_v_version_san_pham_media_slot" AS ENUM('next-pattern');
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
  
  ALTER TABLE "products_annotations_locales" ADD COLUMN "short_title" varchar;
  ALTER TABLE "products_annotations_locales" ADD COLUMN "source_note" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "context" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "pattern" varchar;
  ALTER TABLE "_products_v_version_annotations_locales" ADD COLUMN "short_title" varchar;
  ALTER TABLE "_products_v_version_annotations_locales" ADD COLUMN "source_note" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_context" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_pattern" varchar;
  ALTER TABLE "page_intros_san_pham_media" ADD CONSTRAINT "page_intros_san_pham_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_san_pham_media" ADD CONSTRAINT "page_intros_san_pham_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_san_pham_media_locales" ADD CONSTRAINT "page_intros_san_pham_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_san_pham_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_san_pham_media" ADD CONSTRAINT "_page_intros_v_version_san_pham_media_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_san_pham_media" ADD CONSTRAINT "_page_intros_v_version_san_pham_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_san_pham_media_locales" ADD CONSTRAINT "_page_intros_v_version_san_pham_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_san_pham_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_intros_san_pham_media_order_idx" ON "page_intros_san_pham_media" USING btree ("_order");
  CREATE INDEX "page_intros_san_pham_media_parent_id_idx" ON "page_intros_san_pham_media" USING btree ("_parent_id");
  CREATE INDEX "page_intros_san_pham_media_image_idx" ON "page_intros_san_pham_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_san_pham_media_locales_locale_parent_id_unique" ON "page_intros_san_pham_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_san_pham_media_locales_parent_id_idx" ON "page_intros_san_pham_media_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_san_pham_media_order_idx" ON "_page_intros_v_version_san_pham_media" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_san_pham_media_parent_id_idx" ON "_page_intros_v_version_san_pham_media" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_san_pham_media_image_idx" ON "_page_intros_v_version_san_pham_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_san_pham_media_locales_locale_parent_" ON "_page_intros_v_version_san_pham_media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_san_pham_media_locales_parent_id_idx" ON "_page_intros_v_version_san_pham_media_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_intros_san_pham_media" CASCADE;
  DROP TABLE "page_intros_san_pham_media_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_san_pham_media" CASCADE;
  DROP TABLE "_page_intros_v_version_san_pham_media_locales" CASCADE;
  ALTER TABLE "products_annotations_locales" DROP COLUMN "short_title";
  ALTER TABLE "products_annotations_locales" DROP COLUMN "source_note";
  ALTER TABLE "products_locales" DROP COLUMN "context";
  ALTER TABLE "products_locales" DROP COLUMN "pattern";
  ALTER TABLE "_products_v_version_annotations_locales" DROP COLUMN "short_title";
  ALTER TABLE "_products_v_version_annotations_locales" DROP COLUMN "source_note";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_context";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_pattern";
  DROP TYPE "public"."enum_page_intros_san_pham_media_slot";
  DROP TYPE "public"."enum__page_intros_v_version_san_pham_media_slot";`)
}
