import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import DeleteProductButton from "@/components/shop/DeleteProductButton";
import EditProductForm from "@/components/shop/EditProductForm";
import FileUploader from "@/components/shop/FileUploader";
import PublishToggle from "@/components/shop/PublishToggle";
import { getCreatorByUserId } from "@/db/queries/creators";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function DashboardEditProductPage({ params }: PageProps) {
  const { productId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creator = await getCreatorByUserId(user.id);
  if (!creator) redirect("/onboarding/handle");

  const product = await getProductById(productId, creator.id);
  if (!product) notFound();

  const files = await getProductFiles(product.id);

  return (
    <div className="space-y-6 max-w-[860px]">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
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
        </div>
        <PublishToggle
          productId={product.id}
          isPublished={product.isPublished}
        />
      </header>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 space-y-6">
        <EditProductForm product={product} />
      </section>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7">
        <FileUploader productId={product.id} files={files} />
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
