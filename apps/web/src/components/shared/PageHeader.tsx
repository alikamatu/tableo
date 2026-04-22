interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-fg mb-2">{title}</h1>
      {description && <p className="text-muted">{description}</p>}
    </div>
  );
}
