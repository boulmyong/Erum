import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const questions = [
  '1. 무엇을 경험하였는가?',
  '2. 이번 경험을 통해 내가 새롭게 알게 된 점은 무엇이었는가?',
  '3. 내가 한 선택이나 행동중 다시 돌아간다면 바꾸고 싶은 것은?',
  '4. 이 경험이 나의 꿈과 어떤 연결고리를 만들어 줬는가?'
];

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const navigate = useNavigate();

  const handleAnswerChange = (e, qIndex) => {
    setAnswers({ ...answers, [`q${qIndex + 1}`]: e.target.value });
  };

  const handleSubmit = () => {
    const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
    if (title.trim() === '' || Object.values(answers).some(answer => answer.trim() === '')) {
      alert('제목과 4가지 질문은 모두 필수 항목입니다.');
      return;
    }

    axios.post('http://34.47.87.5:5000/api/posts', { title, content, answers, nickname })
      .then(() => {
        navigate('/');
      })
      .catch(error => {
        console.error('Error creating post:', error);
      });
  };

  return (
    <div>
      <h1 className="my-3">새 글 작성</h1>
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
      <hr />
      {questions.map((question, index) => (
        <div className="mb-3" key={index}>
          <label htmlFor={`question-${index}`} className="form-label">{question} (필수)</label>
          <textarea
            id={`question-${index}`}
            className="form-control"
            rows="3"
            value={answers[`q${index + 1}`]}
            onChange={(e) => handleAnswerChange(e, index)}
          ></textarea>
        </div>
      ))}
      <button className="btn btn-primary" onClick={handleSubmit}>등록</button>
    </div>
  );
}

export default CreatePost;