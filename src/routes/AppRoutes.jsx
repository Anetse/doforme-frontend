import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Feed from '../pages/Feed';
import TaskPost from '../pages/TaskPost';
import Profile from '../pages/Profile';
import Guide from '../pages/Guide';
import ChatPage from '../pages/ChatPage';
import Messages from '../pages/Messages';
import Layout from '../components/UI/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Feed />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/post-task" element={
        <PrivateRoute>
          <Layout>
            <TaskPost />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/guide" element={
        <PrivateRoute>
          <Layout>
            <Guide />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/messages" element={
        <PrivateRoute>
          <Layout>
            <Messages />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/chat/:taskId" element={
        <PrivateRoute>
          <Layout>
            <ChatPage />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
