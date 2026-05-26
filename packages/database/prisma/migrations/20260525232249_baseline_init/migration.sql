CREATE EXTENSION IF NOT EXISTS vector;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ColorFamily" AS ENUM ('Black', 'Blue', 'Brown', 'Green', 'Grey', 'Lilac', 'Metallic', 'Multicombination', 'Orange', 'Purple', 'Red', 'White', 'Yellow');

-- CreateEnum
CREATE TYPE "PieceType" AS ENUM ('DUPLO', 'LEGO', 'TECHNIC');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('ELEMENT', 'SET', 'INSTRUCTION', 'BAG');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('SET_CONTENTS', 'BAG_CONTENTS', 'INSTRUCTION_REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('de', 'en', 'nl');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Draft', 'Review', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "RevisionType" AS ENUM ('Updated', 'Import', 'Added', 'Removed');

-- CreateEnum
CREATE TYPE "JobState" AS ENUM ('Queued', 'Running', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "origins" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationApiRequest" (
    "requestId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Element" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "iconId" INTEGER,
    "colorId" INTEGER,
    "designId" INTEGER,
    "itemId" INTEGER,
    "removedFromApi" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElementHistory" (
    "elementId" INTEGER NOT NULL,
    "revisionId" TEXT NOT NULL,

    CONSTRAINT "ElementHistory_pkey" PRIMARY KEY ("elementId","revisionId")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "family" "ColorFamily" NOT NULL,
    "pieceColor" TEXT NOT NULL,
    "contrastColor" TEXT NOT NULL,
    "removedFromApi" BOOLEAN NOT NULL DEFAULT false,
    "currentId" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "elementIds" INTEGER[],

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorHistory" (
    "colorId" INTEGER NOT NULL,
    "revisionId" TEXT NOT NULL,

    CONSTRAINT "ColorHistory_pkey" PRIMARY KEY ("colorId","revisionId")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pieceType" "PieceType" NOT NULL DEFAULT 'LEGO',
    "weight" DOUBLE PRECISION,
    "studDimensions" TEXT,
    "categoryId" INTEGER,
    "removedFromApi" BOOLEAN NOT NULL DEFAULT false,
    "currentId" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "elementIds" INTEGER[],

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignHistory" (
    "designId" INTEGER NOT NULL,
    "revisionId" TEXT NOT NULL,

    CONSTRAINT "DesignHistory_pkey" PRIMARY KEY ("designId","revisionId")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "categoryIds" INTEGER[],
    "removedFromApi" BOOLEAN NOT NULL DEFAULT false,
    "currentId" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupHistory" (
    "groupId" INTEGER NOT NULL,
    "revisionId" TEXT NOT NULL,

    CONSTRAINT "GroupHistory_pkey" PRIMARY KEY ("groupId","revisionId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER,
    "removedFromApi" BOOLEAN NOT NULL DEFAULT false,
    "currentId" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryHistory" (
    "categoryId" INTEGER NOT NULL,
    "revisionId" TEXT NOT NULL,

    CONSTRAINT "CategoryHistory_pkey" PRIMARY KEY ("categoryId","revisionId")
);

-- CreateTable
CREATE TABLE "Icon" (
    "id" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Icon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL,
    "type" "ItemType" NOT NULL,
    "name" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "ownerItemId" INTEGER NOT NULL,
    "type" "InventoryType" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "inventoryId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isSpare" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("inventoryId","itemId","isSpare")
);

-- CreateTable
CREATE TABLE "PageView" (
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "page" TEXT NOT NULL,
    "pageId" INTEGER NOT NULL DEFAULT 0,
    "asn" INTEGER
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "heroImage" TEXT,
    "tags" TEXT[],
    "highlights" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'Draft',
    "month" TEXT,
    "dataType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostEmbedding" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "version" TEXT,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "entity" TEXT,
    "schema" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "hash" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "type" "RevisionType" NOT NULL DEFAULT 'Updated',
    "language" "Language" NOT NULL,
    "buildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousRevisionId" TEXT,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRequest" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "queryParameters" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "statusMessage" TEXT NOT NULL,
    "responseTimeMs" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "state" "JobState" NOT NULL DEFAULT 'Queued',
    "output" TEXT NOT NULL DEFAULT '',
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cron" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_apiKey_key" ON "Application"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationApiRequest_requestId_timestamp_applicationId_end_key" ON "ApplicationApiRequest"("requestId", "timestamp", "applicationId", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "Element_itemId_key" ON "Element"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Element_currentId_key" ON "Element"("currentId");

-- CreateIndex
CREATE INDEX "Element_designId_colorId_idx" ON "Element"("designId", "colorId");

-- CreateIndex
CREATE INDEX "Element_designId_idx" ON "Element"("designId");

-- CreateIndex
CREATE INDEX "Element_colorId_idx" ON "Element"("colorId");

-- CreateIndex
CREATE INDEX "Element_removedFromApi_lastCheckedAt_idx" ON "Element"("removedFromApi", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "Element_version_idx" ON "Element"("version");

-- CreateIndex
CREATE UNIQUE INDEX "Color_currentId_key" ON "Color"("currentId");

-- CreateIndex
CREATE INDEX "Color_name_idx" ON "Color"("name");

-- CreateIndex
CREATE INDEX "Color_removedFromApi_lastCheckedAt_idx" ON "Color"("removedFromApi", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "Color_version_idx" ON "Color"("version");

-- CreateIndex
CREATE UNIQUE INDEX "Design_currentId_key" ON "Design"("currentId");

-- CreateIndex
CREATE INDEX "Design_categoryId_idx" ON "Design"("categoryId");

-- CreateIndex
CREATE INDEX "Design_name_idx" ON "Design"("name");

-- CreateIndex
CREATE INDEX "Design_pieceType_idx" ON "Design"("pieceType");

-- CreateIndex
CREATE INDEX "Design_removedFromApi_lastCheckedAt_idx" ON "Design"("removedFromApi", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "Design_version_idx" ON "Design"("version");

-- CreateIndex
CREATE UNIQUE INDEX "Group_currentId_key" ON "Group"("currentId");

-- CreateIndex
CREATE INDEX "Group_removedFromApi_lastCheckedAt_idx" ON "Group"("removedFromApi", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "Group_version_idx" ON "Group"("version");

-- CreateIndex
CREATE UNIQUE INDEX "Category_currentId_key" ON "Category"("currentId");

-- CreateIndex
CREATE INDEX "Category_groupId_idx" ON "Category"("groupId");

-- CreateIndex
CREATE INDEX "Category_removedFromApi_lastCheckedAt_idx" ON "Category"("removedFromApi", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "Category_version_idx" ON "Category"("version");

-- CreateIndex
CREATE INDEX "Item_type_idx" ON "Item"("type");

-- CreateIndex
CREATE INDEX "Inventory_ownerItemId_idx" ON "Inventory"("ownerItemId");

-- CreateIndex
CREATE INDEX "Inventory_type_idx" ON "Inventory"("type");

-- CreateIndex
CREATE INDEX "Inventory_isCurrent_idx" ON "Inventory"("isCurrent");

-- CreateIndex
CREATE INDEX "InventoryItem_itemId_idx" ON "InventoryItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PageView_time_page_pageId_key" ON "PageView"("time", "page", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_dataType_status_publishedAt_idx" ON "Post"("dataType", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_status_updatedAt_idx" ON "Post"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_month_dataType_key" ON "Post"("month", "dataType");

-- CreateIndex
CREATE UNIQUE INDEX "PostEmbedding_postId_key" ON "PostEmbedding"("postId");

-- CreateIndex
CREATE INDEX "PostEmbedding_provider_model_idx" ON "PostEmbedding"("provider", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Revision_previousRevisionId_key" ON "Revision"("previousRevisionId");

-- CreateIndex
CREATE INDEX "Revision_hash_idx" ON "Revision" USING HASH ("hash");

-- CreateIndex
CREATE INDEX "Revision_language_type_entity_createdAt_idx" ON "Revision"("language", "type", "entity", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ApplicationApiRequest" ADD CONSTRAINT "ApplicationApiRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "Icon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_currentId_fkey" FOREIGN KEY ("currentId") REFERENCES "Revision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElementHistory" ADD CONSTRAINT "ElementHistory_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElementHistory" ADD CONSTRAINT "ElementHistory_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Color" ADD CONSTRAINT "Color_currentId_fkey" FOREIGN KEY ("currentId") REFERENCES "Revision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorHistory" ADD CONSTRAINT "ColorHistory_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorHistory" ADD CONSTRAINT "ColorHistory_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_currentId_fkey" FOREIGN KEY ("currentId") REFERENCES "Revision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignHistory" ADD CONSTRAINT "DesignHistory_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignHistory" ADD CONSTRAINT "DesignHistory_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_currentId_fkey" FOREIGN KEY ("currentId") REFERENCES "Revision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHistory" ADD CONSTRAINT "GroupHistory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupHistory" ADD CONSTRAINT "GroupHistory_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_currentId_fkey" FOREIGN KEY ("currentId") REFERENCES "Revision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryHistory" ADD CONSTRAINT "CategoryHistory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryHistory" ADD CONSTRAINT "CategoryHistory_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_ownerItemId_fkey" FOREIGN KEY ("ownerItemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostEmbedding" ADD CONSTRAINT "PostEmbedding_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_previousRevisionId_fkey" FOREIGN KEY ("previousRevisionId") REFERENCES "Revision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Vector index for semantic post search.
CREATE INDEX "PostEmbedding_embedding_hnsw_idx"
ON "PostEmbedding"
USING hnsw ("embedding" vector_cosine_ops);

-- Timescale optimization for page views (safe no-op when extension is unavailable).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
    BEGIN
      EXECUTE 'SELECT create_hypertable(''"PageView"'', ''time'')';
    EXCEPTION
      WHEN undefined_function THEN
        NULL;
      WHEN duplicate_object THEN
        NULL;
    END;

    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS "PageView_daily"';
    EXECUTE '
      CREATE MATERIALIZED VIEW "PageView_daily"
      WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
      SELECT time_bucket(INTERVAL ''1 day'', time) AS bucket,
        "page",
        "pageId",
        COUNT(*)::integer AS count
      FROM "PageView"
      GROUP BY "page", "pageId", bucket
      WITH NO DATA
    ';
  END IF;
END
$$;
