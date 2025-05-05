import React from 'react';
import OTPVerification from './OTPVerification';
import { useLocation } from 'react-router-dom';

const VerifyEmailPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    // Redirect to login if no email provided
    if (!email) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Email Verification</h2>
                    <p className="text-center text-red-500 mb-4">
                        No email address provided for verification.
                    </p>
                    <div className="flex justify-center">
                        <a
                            href="/login"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Go to Login
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Email Verification</h2>
                <OTPVerification
                    email={email}
                    onBack={() => window.location.href = '/login'}
                />
            </div>
        </div>
    );
};

export default VerifyEmailPage;
