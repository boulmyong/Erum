import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [nickname, setNickname] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (nickname.trim() === '') {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (rememberMe) {
      localStorage.setItem('nickname', nickname);
    } else {
      sessionStorage.setItem('nickname', nickname);
    }
    navigate('/');
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <img src="/images/logo.png" alt="Erum Logo" className="card-title d-block mx-auto" style={{ height: '120px' }} />
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button className="btn btn-primary" type="button" onClick={handleLogin}>
                로그인
              </button>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                id="rememberMeCheckbox"
              />
              <label className="form-check-label" htmlFor="rememberMeCheckbox">
                로그인 정보 저장
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
