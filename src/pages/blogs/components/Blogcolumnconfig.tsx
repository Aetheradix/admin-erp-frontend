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
    header: 'Cover',
    width: '100px',
    className: 'pl-6',
    headerClassName: 'pl-6',
    body: (row) => (
      <ImageCell
        id={String(row.id)}
        src={row.featuredImage || row.image_url || ''}
        alt={row.title}
      />
    ),
  },
  {
    key: 'title',
    header: 'Story Details',
    body: (row) => (
      <TitleCell
        id={String(row.id)}
        title={row.title}
        excerpt={row.excerpt}
        content={row.content}
      />
    ),
  },
  {
    key: 'category',
    header: 'Category',
    width: '160px',
    body: (row) => (
      <CategoryCell
        category={row.category}
        date={row.created_at || row.publishDate || row.updated_at}
      />
    ),
  },
  {
    key: 'author',
    header: 'Author',
    width: '200px',
    body: (row) => <AuthorCell author={row.author} />,
  },
  {
    key: 'status',
    header: 'Status',
    width: '140px',
    align: 'center',
    body: (row) => <StatusCell status={row.status} />,
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    headerClassName: 'pr-6',
    body: (row, { onDelete }) => <ActionsCell id={String(row.id)} onDelete={onDelete} />,
  },
];
