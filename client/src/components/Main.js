import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Main() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get('http://34.47.87.5:5000/api/posts')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('nickname');
    sessionStorage.removeItem('nickname');
    navigate('/login');
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      axios.delete(`http://34.47.87.5:5000/api/posts/${postId}`, { data: { nickname } })
        .then(() => {
          fetchPosts(); // Refresh posts after deletion
        })
        .catch(error => {
          console.error('Error deleting post:', error);
          alert('삭제할 권한이 없습니다.');
        });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-3">
        <img src="/images/logo.png" alt="Erum Logo" style={{ height: '100px' }} />
        <div>
          <Link to="/create" className="btn btn-primary me-2">+ 글 작성</Link>
          <button className="btn btn-secondary" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
      <div className="list-group">
        {posts.map(post => (
          <div key={post.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <Link to={`/post/${post.id}`} className="text-decoration-none text-dark flex-grow-1">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{post.title}</h5>
                <small><Link to={`/user/${post.nickname}`} className="text-muted text-decoration-none">{post.nickname}</Link> - {new Date(post.createdAt).toLocaleString()}</small>
              </div>
            </Link>
            {(nickname === 'root' || nickname === post.nickname) && (
              <button className="btn btn-danger btn-sm ms-3" onClick={() => handleDeletePost(post.id)}>삭제</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Main;