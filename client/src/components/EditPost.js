import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const questions = [
  '1. 무엇을 경험하였는가?',
  '2. 이번 경험을 통해 내가 새롭게 알게 된 점은 무엇이었는가?',
  '3. 내가 한 선택이나 행동중 다시 돌아간다면 바꾸고 싶은 것은?',
  '4. 이 경험이 나의 꿈과 어떤 연결고리를 만들어 줬는가?'
];

function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${id}`)
      .then(response => {
        const post = response.data;
        if (nickname !== 'root' && post.nickname !== nickname) {
          alert('수정할 권한이 없습니다.');
          navigate(`/post/${id}`);
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        setAnswers(post.answers);
        setImageUrl(post.imageUrl || '');
      })
      .catch(error => {
        console.error('Error fetching post:', error);
        alert('게시물을 불러오는데 실패했습니다.');
        navigate('/');
      });
  }, [id, nickname, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    axios.post('http://localhost:5000/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(response => {
      setImageUrl(response.data.imageUrl);
    })
    .catch(error => {
      console.error('Error uploading image:', error);
      alert('이미지 업로드에 실패했습니다.');
    });
  };

  const handleSubmit = () => {
    if (title.trim() === '' || Object.values(answers).some(answer => answer.trim() === '')) {
      alert('제목과 4가지 질문은 모두 필수 항목입니다.');
      return;
    }

    axios.put(`http://localhost:5000/api/posts/${id}`, { title, content, answers, nickname, imageUrl })
      .then(() => {
        navigate(`/post/${id}`);
      })
      .catch(error => {
        console.error('Error updating post:', error);
        alert('게시물 수정에 실패했습니다.');
      });
  };

  return (
    <div>
      <h2 className="my-3">게시물 수정</h2>
      <div className="mb-3">
        <label htmlFor="title" className="form-label">제목 (필수)</label>
        <input
          id="title"
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="content" className="form-label">내용</label>
        <textarea
          id="content"
          className="form-control"
          rows="5"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="image" className="form-label">이미지 업로드</label>
        <input
          id="image"
          type="file"
          className="form-control"
          onChange={handleFileChange}
        />
        {imageUrl && (
          <div className="mt-3">
            <img src={`http://localhost:5000${imageUrl}`} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
          </div>
        )}
      </div>
      <hr />
      {questions.map((question, index) => (
        <div className="mb-3" key={index}>
          <label htmlFor={`question-${index}`} className="form-label">{question} (필수)</label>
          <textarea
            id={`question-${index}`}
            className="form-control"
            rows="3"
            value={answers[`q${index + 1}`]}
            onChange={(e) => setAnswers({ ...answers, [`q${index + 1}`]: e.target.value })}
          ></textarea>
        </div>
      ))}
      <button className="btn btn-primary" onClick={handleSubmit}>수정 완료</button>
    </div>
  );
}

export default EditPost;