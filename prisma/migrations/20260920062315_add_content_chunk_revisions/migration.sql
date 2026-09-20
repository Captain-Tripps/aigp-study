-- CreateTable
CREATE TABLE "ContentChunkRevision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentChunkId" INTEGER NOT NULL,
    "editedContent" TEXT NOT NULL,
    "metadata" TEXT,
    "previousContent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentChunkRevision_contentChunkId_fkey" FOREIGN KEY ("contentChunkId") REFERENCES "ContentChunk" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
