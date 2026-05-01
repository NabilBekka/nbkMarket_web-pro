"use client";
import { useParams } from "next/navigation";
import ProductDetail from "@/components/dashboard/ProductDetail";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <ProductDetail productId={id} />;
}
