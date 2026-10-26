import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "page_intros" ADD COLUMN "home_hero_image_id" integer;
  ALTER TABLE "page_intros" ADD COLUMN "home_hero_inset_id" integer;
  ALTER TABLE "page_intros_locales" ADD COLUMN "home_hero_caption" varchar;
  ALTER TABLE "_page_intros_v" ADD COLUMN "version_home_hero_image_id" integer;
  ALTER TABLE "_page_intros_v" ADD COLUMN "version_home_hero_inset_id" integer;
  ALTER TABLE "_page_intros_v_locales" ADD COLUMN "version_home_hero_caption" varchar;
  ALTER TABLE "page_intros_home_village_images" ADD CONSTRAINT "page_intros_home_village_images_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros_home_village_images" ADD CONSTRAINT "page_intros_home_village_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_intros_home_village_images_locales" ADD CONSTRAINT "page_intros_home_village_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_intros_home_village_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_home_village_images" ADD CONSTRAINT "_page_intros_v_version_home_village_images_image_id_archive_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_home_village_images" ADD CONSTRAINT "_page_intros_v_version_home_village_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_intros_v_version_home_village_images_locales" ADD CONSTRAINT "_page_intros_v_version_home_village_images_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_page_intros_v_version_home_village_images"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_intros_home_village_images_order_idx" ON "page_intros_home_village_images" USING btree ("_order");
  CREATE INDEX "page_intros_home_village_images_parent_id_idx" ON "page_intros_home_village_images" USING btree ("_parent_id");
  CREATE INDEX "page_intros_home_village_images_image_idx" ON "page_intros_home_village_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "page_intros_home_village_images_locales_locale_parent_id_uni" ON "page_intros_home_village_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "page_intros_home_village_images_locales_parent_id_idx" ON "page_intros_home_village_images_locales" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_home_village_images_order_idx" ON "_page_intros_v_version_home_village_images" USING btree ("_order");
  CREATE INDEX "_page_intros_v_version_home_village_images_parent_id_idx" ON "_page_intros_v_version_home_village_images" USING btree ("_parent_id");
  CREATE INDEX "_page_intros_v_version_home_village_images_image_idx" ON "_page_intros_v_version_home_village_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_page_intros_v_version_home_village_images_locales_locale_pa" ON "_page_intros_v_version_home_village_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_page_intros_v_version_home_village_images_locales_paren_idx" ON "_page_intros_v_version_home_village_images_locales" USING btree ("_parent_id");
  ALTER TABLE "page_intros" ADD CONSTRAINT "page_intros_home_hero_image_id_archive_assets_id_fk" FOREIGN KEY ("home_hero_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_intros" ADD CONSTRAINT "page_intros_home_hero_inset_id_archive_assets_id_fk" FOREIGN KEY ("home_hero_inset_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v" ADD CONSTRAINT "_page_intros_v_version_home_hero_image_id_archive_assets_id_fk" FOREIGN KEY ("version_home_hero_image_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_intros_v" ADD CONSTRAINT "_page_intros_v_version_home_hero_inset_id_archive_assets_id_fk" FOREIGN KEY ("version_home_hero_inset_id") REFERENCES "public"."archive_assets"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_intros_home_home_hero_image_idx" ON "page_intros" USING btree ("home_hero_image_id");
  CREATE INDEX "page_intros_home_home_hero_inset_idx" ON "page_intros" USING btree ("home_hero_inset_id");
  CREATE INDEX "_page_intros_v_version_home_version_home_hero_image_idx" ON "_page_intros_v" USING btree ("version_home_hero_image_id");
  CREATE INDEX "_page_intros_v_version_home_version_home_hero_inset_idx" ON "_page_intros_v" USING btree ("version_home_hero_inset_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_intros_home_village_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_intros_home_village_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_intros_v_version_home_village_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_intros_v_version_home_village_images_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_intros_home_village_images" CASCADE;
  DROP TABLE "page_intros_home_village_images_locales" CASCADE;
  DROP TABLE "_page_intros_v_version_home_village_images" CASCADE;
  DROP TABLE "_page_intros_v_version_home_village_images_locales" CASCADE;
  ALTER TABLE "page_intros" DROP CONSTRAINT "page_intros_home_hero_image_id_archive_assets_id_fk";
  
  ALTER TABLE "page_intros" DROP CONSTRAINT "page_intros_home_hero_inset_id_archive_assets_id_fk";
  
  ALTER TABLE "_page_intros_v" DROP CONSTRAINT "_page_intros_v_version_home_hero_image_id_archive_assets_id_fk";
  
  ALTER TABLE "_page_intros_v" DROP CONSTRAINT "_page_intros_v_version_home_hero_inset_id_archive_assets_id_fk";
  
  DROP INDEX "page_intros_home_home_hero_image_idx";
  DROP INDEX "page_intros_home_home_hero_inset_idx";
  DROP INDEX "_page_intros_v_version_home_version_home_hero_image_idx";
  DROP INDEX "_page_intros_v_version_home_version_home_hero_inset_idx";
  ALTER TABLE "page_intros" DROP COLUMN "home_hero_image_id";
  ALTER TABLE "page_intros" DROP COLUMN "home_hero_inset_id";
  ALTER TABLE "page_intros_locales" DROP COLUMN "home_hero_caption";
  ALTER TABLE "_page_intros_v" DROP COLUMN "version_home_hero_image_id";
  ALTER TABLE "_page_intros_v" DROP COLUMN "version_home_hero_inset_id";
  ALTER TABLE "_page_intros_v_locales" DROP COLUMN "version_home_hero_caption";`)
}
