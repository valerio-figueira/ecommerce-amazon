import { redirect } from 'next/navigation';

type ArtigosCategoriaRedirectProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArtigosCategoriaRedirect({
  params,
}: ArtigosCategoriaRedirectProps): Promise<never> {
  const { slug } = await params;
  redirect(`/artigos?categoria=${encodeURIComponent(slug)}`);
}
