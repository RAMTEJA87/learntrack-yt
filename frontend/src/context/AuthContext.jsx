import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser); // Set initial state quickly

                // Fetch fresh data
                try {
                    const { data } = await api.get('/api/auth/me');
                    // Merge token if needed, usually token is in localStorage or api interceptor handles it
                    // 'data' from 'me' doesn't usually have token, so keep the old one or rely on cookies if that was the case.
                    // Here we stored token in 'user' object in localStorage.
                    // The 'me' endpoint returns the user document.
                    const freshUser = { ...parsedUser, ...data };
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } catch (error) {
                    // Token might be invalid
                    console.error("Session invalid", error);
                    // localStorage.removeItem('user'); // Optional: logout if invalid
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const register = async (username, email, password) => {
        const { data } = await api.post('/api/auth/register', { username, email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
