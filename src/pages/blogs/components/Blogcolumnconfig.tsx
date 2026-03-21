import React from 'react';
import type { Blog } from '../hooks/mockBlogs';
import {
  ImageCell,
  TitleCell,
  CategoryCell,
  AuthorCell,
  StatusCell,
  ActionsCell,
} from './BlogColumns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnConfig {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
  body: (row: Blog, meta: { onDelete: (id: string) => void }) => React.ReactNode;
}

// ─── Column Definitions ───────────────────────────────────────────────────────

export const BLOG_COLUMNS: ColumnConfig[] = [
  {
    key: 'image',
    header: 'Post',
    width: '120px',
    className: 'pl-6',
    headerClassName: 'pl-6',
    body: (row) => <ImageCell src={row.featuredImage} alt={row.title} />,
  },
  {
    key: 'title',
    header: 'Title',
    body: (row) => <TitleCell title={row.title} excerpt={row.excerpt} />,
  },
  {
    key: 'category',
    header: 'Category',
    width: '180px',
    body: (row) => <CategoryCell category={row.category} />,
  },
  {
    key: 'author',
    header: 'Author',
    width: '220px',
    body: (row) => <AuthorCell author={row.author} />,
  },
  {
    key: 'status',
    header: 'Status',
    width: '150px',
    body: (row) => <StatusCell status={row.status} />,
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    headerClassName: 'pr-8',
    body: (row, { onDelete }) => (
      <ActionsCell id={String(row.id)} onDelete={onDelete} />
    ),
  },
];