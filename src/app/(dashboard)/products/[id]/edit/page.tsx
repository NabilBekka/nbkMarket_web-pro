"use client";
import { useParams } from "next/navigation";
import EditProduct from "@/components/dashboard/EditProduct";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  return <EditProduct productId={id} />;
}
