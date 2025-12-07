import React from 'react';
import { GraduationCap, BookOpen, Users, Sparkles } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sarthi-purple-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <GraduationCap className="text-sarthi-purple-600" size={48} strokeWidth={2} />
                        <h1 className="text-5xl font-display font-bold text-gray-900">Sarthi Classroom</h1>
                    </div>
                    <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
                        Your digital companion for empowering education and collaborative learning
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all animate-slide-up">
                        <BookOpen className="text-sarthi-purple-600 mb-4" size={32} />
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-3">Rich Content</h3>
                        <p className="text-gray-600 font-body">Access curated study materials and interactive lessons</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <Users className="text-sarthi-purple-600 mb-4" size={32} />
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-3">Collaborate</h3>
                        <p className="text-gray-600 font-body">Connect with peers and teachers in real-time</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Sparkles className="text-sarthi-purple-600 mb-4" size={32} />
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-3">Track Progress</h3>
                        <p className="text-gray-600 font-body">Monitor your learning journey and achievements</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
