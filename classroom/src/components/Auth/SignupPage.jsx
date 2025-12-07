import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Rocket } from 'lucide-react';
import AuthForm from './AuthForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sarthi-purple-600 via-sarthi-purple-700 to-sarthi-purple-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sarthi-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 animate-slide-in-left">
          <div className="text-white text-sm font-body mb-4 uppercase tracking-wider">Join Sarthi</div>
          
          <div className="space-y-8">
            <h1 className="text-5xl font-display font-bold text-white leading-tight">
              Start Your<br />Learning Journey
            </h1>
            
            <p className="text-purple-100 text-lg font-body leading-relaxed max-w-md">
              Create an account today to unlock full access to courses, assignments, and a vibrant community of learners.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-white">
                <Users size={20} className="text-purple-300" />
                <span className="font-body">Collaborate with peers</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Shield size={20} className="text-purple-300" />
                <span className="font-body">Secure and private environment</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Rocket size={20} className="text-purple-300" />
                <span className="font-body">Accelerate your growth</span>
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
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">Create an account</h2>
            <p className="text-gray-600 font-body">Join us to start your admission journey</p>
          </div>
          
          <AuthForm isLogin={false} />
          
          <p className="mt-6 text-center text-sm text-gray-600 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-sarthi-purple-600 hover:text-sarthi-purple-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
