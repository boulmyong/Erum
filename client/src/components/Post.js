import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const questions = [
  '1. 무엇을 경험하였는가?',
  '2. 이번 경험을 통해 내가 새롭게 알게 된 점은 무엇이었는가?',
  '3. 내가 한 선택이나 행동중 다시 돌아간다면 바꾸고 싶은 것은?',
  '4. 이 경험이 나의 꿈과 어떤 연결고리를 만들어 줬는가?'
];

function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = () => {
    axios.get(`http://34.47.87.5:5000/api/posts/${id}`)
      .then(response => {
        setPost(response.data);
      })
      .catch(error => {
        console.error('Error fetching post:', error);
      });
  };

  const handleCommentSubmit = () => {
    if (!comment) {
      alert('댓글을 입력해주세요.');
      return;
    }

    axios.post(`http://34.47.87.5:5000/api/posts/${id}/comments`, { content: comment, nickname })
      .then(() => {
        setComment('');
        fetchPost(); // Re-fetch post to show the new comment
      })
      .catch(error => {
        console.error('Error creating comment:', error);
      });
  };

  const handleDeleteComment = (commentIndex) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      axios.delete(`http://34.47.87.5:5000/api/posts/${id}/comments/${commentIndex}`, { data: { nickname } })
        .then(() => {
          fetchPost(); // Refresh post after deletion
        })
        .catch(error => {
          console.error('Error deleting comment:', error);
          alert('삭제할 권한이 없습니다.');
        });
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="card my-3">
        <div className="card-body">
          <h1 className="card-title">{post.title}</h1>
          <h6 className="card-subtitle mb-2 text-muted">by {post.nickname} - {new Date(post.createdAt).toLocaleString()}</h6>
          <hr />
          {post.content && (
            <div className="mb-3">
              <h5>내용</h5>
              <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            </div>
          )}
          {post.answers && Object.keys(post.answers).map((key, index) => (
            <div key={index} className="mb-3">
              <p><strong>{questions[index]}</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{post.answers[key]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card my-3">
        <div className="card-body">
          <h5 className="card-title">댓글</h5>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="댓글을 입력하세요"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={handleCommentSubmit}>
              등록
            </button>
          </div>
          <ul className="list-group">
            {post.comments.map((c, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div style={{ whiteSpace: 'pre-wrap' }}><strong>{c.nickname}:</strong> {c.content}</div>
                {nickname === 'root' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(index)}>삭제</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Post;