type ArtigosPageTitleProps = {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    page?: string;
  }>;
};

export async function ArtigosPageTitle({
  searchParams,
}: ArtigosPageTitleProps): Promise<React.JSX.Element | null> {
  const params = await searchParams;
  if (params.categoria?.trim()) {
    return null;
  }

  return <h1 className="sr-only">Artigos</h1>;
}
