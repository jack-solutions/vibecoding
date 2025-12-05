import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            // Check if user is logged in via checking for cookie (requires backend endpoint or storage)
            // For simple token based: check localStorage if we stored it there, strict HttpOnly cookies need an endpoint.
            // We implemented HttpOnly cookies. We need a 'me' endpoint to verify session.
            // I'll assume we can't easily check without an endpoint.
            // I should add a /api/auth/me endpoint or similar.
            // For now, I'll rely on localStorage for the User Object (cached) but verifying token is better.

            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (username, email, password, role) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { username, email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout');
            localStorage.removeItem('userInfo');
            setUser(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
