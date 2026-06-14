import type { ReactNode } from 'react';

type ArticleMetaBoxProps = {
  title: string;
  children: ReactNode;
};

export function ArticleMetaBox({ title, children }: ArticleMetaBoxProps): React.JSX.Element {
  return (
    <div className="article-meta-box">
      <h3 className="article-meta-title">{title}</h3>
      {children}
    </div>
  );
}
