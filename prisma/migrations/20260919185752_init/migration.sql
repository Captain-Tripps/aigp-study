-- CreateTable
CREATE TABLE "TrainingModule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ExamDomain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "romanNumeral" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weightMin" INTEGER NOT NULL,
    "weightMax" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ExamDomainToModule" (
    "examDomainId" INTEGER NOT NULL,
    "trainingModuleId" INTEGER NOT NULL,

    PRIMARY KEY ("examDomainId", "trainingModuleId"),
    CONSTRAINT "ExamDomainToModule_examDomainId_fkey" FOREIGN KEY ("examDomainId") REFERENCES "ExamDomain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExamDomainToModule_trainingModuleId_fkey" FOREIGN KEY ("trainingModuleId") REFERENCES "TrainingModule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trainingModuleId" INTEGER NOT NULL,
    "examDomainId" INTEGER NOT NULL,
    CONSTRAINT "Competency_trainingModuleId_fkey" FOREIGN KEY ("trainingModuleId") REFERENCES "TrainingModule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Competency_examDomainId_fkey" FOREIGN KEY ("examDomainId") REFERENCES "ExamDomain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceIndicator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "competencyId" INTEGER NOT NULL,
    CONSTRAINT "PerformanceIndicator_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentChunk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "performanceIndicatorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourcePage" INTEGER,
    "sourceUrl" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'pdf',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedContent" TEXT,
    "editedAt" DATETIME,
    "metadata" TEXT,
    CONSTRAINT "ContentChunk_performanceIndicatorId_fkey" FOREIGN KEY ("performanceIndicatorId") REFERENCES "PerformanceIndicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "performanceIndicatorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" DATETIME,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" DATETIME,
    CONSTRAINT "UserProgress_performanceIndicatorId_fkey" FOREIGN KEY ("performanceIndicatorId") REFERENCES "PerformanceIndicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "performanceIndicatorId" INTEGER,
    "examDomainId" INTEGER NOT NULL,
    "trainingModuleId" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    CONSTRAINT "Question_performanceIndicatorId_fkey" FOREIGN KEY ("performanceIndicatorId") REFERENCES "PerformanceIndicator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Question_examDomainId_fkey" FOREIGN KEY ("examDomainId") REFERENCES "ExamDomain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Question_trainingModuleId_fkey" FOREIGN KEY ("trainingModuleId") REFERENCES "TrainingModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionAttempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "selectedAnswer" INTEGER NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "performanceIndicatorId" INTEGER NOT NULL,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" DATETIME,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Flashcard_performanceIndicatorId_fkey" FOREIGN KEY ("performanceIndicatorId") REFERENCES "PerformanceIndicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "examDate" DATETIME NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "moduleSchedule" TEXT NOT NULL,
    "domainTargets" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingModule_number_key" ON "TrainingModule"("number");

-- CreateIndex
CREATE UNIQUE INDEX "ExamDomain_romanNumeral_key" ON "ExamDomain"("romanNumeral");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_code_key" ON "Competency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceIndicator_code_key" ON "PerformanceIndicator"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_performanceIndicatorId_key" ON "UserProgress"("performanceIndicatorId");
