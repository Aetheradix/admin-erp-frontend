import { useNavigate, useParams } from 'react-router-dom';

const BlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div>
      <h1>Edit Blog (ID: {id})</h1>
      <button onClick={() => navigate('/blogs')}>Cancel</button>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/blogs'); }}>
        <input type="text" defaultValue={`Blog ${id}`} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default BlogEdit;
