import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Rocket } from 'lucide-react';
import AuthForm from './AuthForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-claude-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 animate-fade-in">
          <div className="text-claude-300 text-xs font-body mb-4 uppercase tracking-wider">Join Sarthi</div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-display font-semibold text-claude-50 leading-tight">
              Start Your<br />Learning Journey
            </h1>
            
            <p className="text-claude-300 text-base font-body leading-relaxed max-w-md">
              Create an account today to unlock full access to courses, assignments, and a vibrant community of learners.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2.5 text-claude-200">
                <Users size={18} className="text-claude-400" />
                <span className="font-body text-sm">Collaborate with peers</span>
              </div>
              <div className="flex items-center gap-2.5 text-claude-200">
                <Shield size={18} className="text-claude-400" />
                <span className="font-body text-sm">Secure and private environment</span>
              </div>
              <div className="flex items-center gap-2.5 text-claude-200">
                <Rocket size={18} className="text-claude-400" />
                <span className="font-body text-sm">Accelerate your growth</span>
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
            <h2 className="text-3xl font-display font-semibold text-claude-900 mb-2">Create an account</h2>
            <p className="text-claude-700 font-body text-sm">Join us to start your learning journey</p>
          </div>
          
          <AuthForm isLogin={false} />
          
          <p className="mt-6 text-center text-sm text-claude-700 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-claude-900 hover:text-claude-800 font-medium transition-colors underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
