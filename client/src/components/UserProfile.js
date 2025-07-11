import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function UserProfile() {
  const { nickname } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`http://34.47.87.5:5000/api/posts/user/${nickname}`)
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error(`Error fetching posts for user ${nickname}:`, error);
      });
  }, [nickname]);

  return (
    <div>
      <h2 className="my-3">{nickname}님의 게시물</h2>
      <div className="list-group">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link key={post.id} to={`/post/${post.id}`} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{post.title}</h5>
                <small>{new Date(post.createdAt).toLocaleString()}</small>
              </div>
            </Link>
          ))
        ) : (
          <p>작성한 게시물이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;