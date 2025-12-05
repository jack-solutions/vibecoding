import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Use id: 3 (Viewer) as default for better UX (can view but maybe restricted actions later)
    // Or id: 1 (Admin) for easy testing. Let's start with Admin.
    const [currentUser, setCurrentUser] = useState({ id: 1, username: 'Admin User', role: 'admin' });

    const login = (user) => {
        setCurrentUser(user);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
