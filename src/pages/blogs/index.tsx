import { Routes, Route } from 'react-router-dom';
import { RoutePermissionGuard } from '@/components/auth/RoutePermissionGuard';
import BlogList from './BlogList';
import BlogCreate from './BlogCreate';
import BlogEdit from './BlogEdit';

const BlogsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route
        path="/create"
        element={
          <RoutePermissionGuard permission="blog:manage">
            <BlogCreate />
          </RoutePermissionGuard>
        }
      />
      <Route
        path="/:id/edit"
        element={
          <RoutePermissionGuard permission="blog:manage">
            <BlogEdit />
          </RoutePermissionGuard>
        }
      />
    </Routes>
  );
};

export default BlogsModule;
