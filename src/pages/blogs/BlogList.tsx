import { Link } from 'react-router-dom';

const BlogList = () => {
  return (
    <div>
      <h1>Blog List</h1>
      <Link to="/blogs/create">Create New Blog</Link>
      <ul>
        <li>
          My First Blog <Link to="/blogs/1/edit">Edit</Link>
        </li>
      </ul>
    </div>
  );
};

export default BlogList;
