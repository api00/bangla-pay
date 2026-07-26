import Link from "next/link";
import { notFound } from "next/navigation";

import DeleteProductButton from "@/components/shop/DeleteProductButton";
import DraftBanner from "@/components/shop/DraftBanner";
import EditProductForm from "@/components/shop/EditProductForm";
import FileUploader from "@/components/shop/FileUploader";
import ProductImagesUploader from "@/components/shop/ProductImagesUploader";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { requireCreator } from "@/lib/auth";
import { creatorUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function DashboardEditProductPage({ params }: PageProps) {
  const { productId } = await params;
  const { creator } = await requireCreator();
  const product = await getProductById(productId, creator.id);
  if (!product) notFound();

  const files = await getProductFiles(product.id);
  const publicUrl = `${creatorUrl(creator.handle)}/shop/${product.slug}`;

  return (
    <div className="space-y-6 max-w-[860px]">
      <header>
        <Link
          href="/dashboard/shop"
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          ← Back to shop
        </Link>
        <h1
          className="display mt-3 text-[26px] md:text-[34px] text-[#0e0f0c]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          {product.title}
        </h1>
        <p className="text-[13px] text-[#454745] mt-1 tabular-nums">
          /{creator.handle}/shop/{product.slug}
        </p>
      </header>

      <DraftBanner
        productId={product.id}
        isPublished={product.isPublished}
        publicUrl={publicUrl}
      />

      {/* Images come first — most products start here */}
      <section
        id="images"
        className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7"
      >
        <ProductImagesUploader
          productId={product.id}
          initialUrls={product.galleryUrls ?? []}
        />
      </section>

      {/* Text details — has its own Save button */}
      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 space-y-6">
        <header>
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#454745]">
            Details
          </h2>
          <p className="text-[12px] text-[#868685] mt-1">
            Title, description, and pricing. Save when you&rsquo;re done.
          </p>
        </header>
        <EditProductForm product={product} />
      </section>

      {/* Files (private downloads) */}
      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7">
        <FileUploader
          productId={product.id}
          files={files}
          productCategory={product.category}
          deliveryMode={product.deliveryMode}
        />
      </section>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7">
        <h2 className="text-[14px] font-semibold text-[#0e0f0c] mb-3">
          Danger zone
        </h2>
        <DeleteProductButton productId={product.id} />
      </section>
    </div>
  );
}
