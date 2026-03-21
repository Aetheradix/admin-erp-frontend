import { Routes, Route } from 'react-router-dom';
import BlogList from './BlogList';
import BlogCreate from './BlogCreate';
import BlogEdit from './BlogEdit';

const BlogsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/create" element={<BlogCreate />} />
      <Route path="/:id/edit" element={<BlogEdit />} />
    </Routes>
  );
};

export default BlogsModule;
