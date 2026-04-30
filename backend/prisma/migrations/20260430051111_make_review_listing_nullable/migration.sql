-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_listingId_fkey";

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "listingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
