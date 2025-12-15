
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Lightbulb } from 'lucide-react';
import AuthForm from './AuthForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sarthi-purple-600 via-sarthi-purple-700 to-sarthi-purple-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sarthi-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 animate-slide-in-left">
          <div className="flex items-center gap-3 mb-16">
            <GraduationCap className="text-white" size={40} strokeWidth={2} />
            <span className="text-white text-2xl font-display font-bold">Sarthi</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-5xl font-display font-bold text-white leading-tight">
              Empowering<br />Education
            </h1>
            
            <p className="text-purple-100 text-lg font-body leading-relaxed max-w-md">
              Your digital classroom companion. Connect with teachers, access resources, and track your progress all in one place.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-white">
                <BookOpen size={20} className="text-purple-300" />
                <span className="font-body">Access curated study materials</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Lightbulb size={20} className="text-purple-300" />
                <span className="font-body">Interactive learning experience</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-purple-200 text-sm font-body">
          © 2025 Sarthi Platform
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-slide-in-right">
          <div className="mb-8">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600 font-body">Enter your email and password to access your account</p>
          </div>
          
          <AuthForm isLogin={true} />
          
          <p className="mt-6 text-center text-sm text-gray-600 font-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sarthi-purple-600 hover:text-sarthi-purple-700 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
