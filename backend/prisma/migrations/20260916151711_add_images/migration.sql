-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL DEFAULT 0,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
