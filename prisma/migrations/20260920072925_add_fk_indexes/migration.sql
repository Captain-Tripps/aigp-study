-- CreateIndex
CREATE INDEX "Competency_trainingModuleId_idx" ON "Competency"("trainingModuleId");

-- CreateIndex
CREATE INDEX "Competency_examDomainId_idx" ON "Competency"("examDomainId");

-- CreateIndex
CREATE INDEX "ContentChunk_performanceIndicatorId_idx" ON "ContentChunk"("performanceIndicatorId");

-- CreateIndex
CREATE INDEX "ContentChunkRevision_contentChunkId_idx" ON "ContentChunkRevision"("contentChunkId");

-- CreateIndex
CREATE INDEX "Flashcard_performanceIndicatorId_idx" ON "Flashcard"("performanceIndicatorId");

-- CreateIndex
CREATE INDEX "PerformanceIndicator_competencyId_idx" ON "PerformanceIndicator"("competencyId");

-- CreateIndex
CREATE INDEX "Question_performanceIndicatorId_idx" ON "Question"("performanceIndicatorId");

-- CreateIndex
CREATE INDEX "Question_examDomainId_idx" ON "Question"("examDomainId");

-- CreateIndex
CREATE INDEX "Question_trainingModuleId_idx" ON "Question"("trainingModuleId");

-- CreateIndex
CREATE INDEX "QuestionAttempt_questionId_idx" ON "QuestionAttempt"("questionId");
