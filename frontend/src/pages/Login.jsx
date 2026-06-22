import { useState } from 'react';
import { api } from '../api/client.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@belleart.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const session = await api.post('/auth/login', { email, password });
      const { token, user } = session;

      localStorage.setItem('belleart_token', token);
      localStorage.setItem('belleart_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <span className="logo">BA</span>
        <h1>BELLEART OS</h1>
        <p>Acesse o sistema completo da clínica.</p>
        {error && <p className="alert error">{error}</p>}
        <label>
          E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button>Entrar</button>
      </form>
    </main>
  );
}
