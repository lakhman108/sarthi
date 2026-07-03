
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Lightbulb } from 'lucide-react';
import AuthForm from './AuthForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-claude-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-2.5 mb-16">
            <GraduationCap className="text-claude-100" size={32} strokeWidth={2} />
            <span className="text-claude-50 text-xl font-display font-semibold">Sarthi</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-display font-semibold text-claude-50 leading-tight">
              Empowering<br />Education
            </h1>
            
            <p className="text-claude-300 text-base font-body leading-relaxed max-w-md">
              Your digital classroom companion. Connect with teachers, access resources, and track your progress all in one place.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2.5 text-claude-200">
                <BookOpen size={18} className="text-claude-400" />
                <span className="font-body text-sm">Access curated study materials</span>
              </div>
              <div className="flex items-center gap-2.5 text-claude-200">
                <Lightbulb size={18} className="text-claude-400" />
                <span className="font-body text-sm">Interactive learning experience</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-claude-400 text-xs font-body">
          © 2025 Sarthi Platform
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-claude-50">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-semibold text-claude-900 mb-2">Welcome back</h2>
            <p className="text-claude-700 font-body text-sm">Enter your email and password to access your account</p>
          </div>
          
          <AuthForm isLogin={true} />
          
          <p className="mt-6 text-center text-sm text-claude-700 font-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-claude-900 hover:text-claude-800 font-medium transition-colors underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
