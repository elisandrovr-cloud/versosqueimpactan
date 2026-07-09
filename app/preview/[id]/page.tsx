import { PreviewClient } from "./preview-client";

export const metadata = { title: "Vista previa" };

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewClient id={id} />;
}
