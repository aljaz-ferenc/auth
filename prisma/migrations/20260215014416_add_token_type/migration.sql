/*
  Warnings:

  - Changed the type of `type` on the `email_tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('VERIFICATION', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "email_tokens" DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL;
