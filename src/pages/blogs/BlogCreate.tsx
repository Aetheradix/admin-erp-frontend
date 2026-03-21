import { useNavigate } from 'react-router-dom';

const BlogCreate = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Create Blog</h1>
      <button onClick={() => navigate('/blogs')}>Cancel</button>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/blogs'); }}>
        <input type="text" placeholder="Title" />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default BlogCreate;
