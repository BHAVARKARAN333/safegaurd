import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginAsDemo, user } = useAuth();
    const navigate = useNavigate();

    if (user) navigate('/dashboard');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Authentication failed. Please check credentials or create a user in Firebase Auth.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Safeguard HQ</h2>
                    <p className="text-slate-400 text-sm mt-1">Authorized Police Personnel Only</p>
                </div>

                {error && <div className="bg-red-900/50 text-red-200 p-3 rounded-lg mb-6 text-sm border border-red-800/50">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Badge ID / Email</label>
                        <input
                            type="email" required
                            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="officer@safeguard.gov"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password" required
                            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-50 mt-6 shadow-lg shadow-blue-500/20"
                        type="submit"
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            loginAsDemo();
                            navigate('/dashboard');
                        }}
                        className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-all mt-3 border border-slate-600"
                    >
                        Demo View (Skip Login)
                    </button>

                    <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-700">
                        Use your Flutter App credentials or bypass for Demo.
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
