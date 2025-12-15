import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import { verifyOTP, resendOTP } from './auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Lock, RefreshCw } from 'lucide-react';
import Cookies from 'js-cookie';

const OTPVerification = ({ email, onBack, isAfterLogin = false }) => {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const { setUser, setIsAuthenticated } = useContext(UserContext);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            toast.error('Please enter the OTP sent to your email');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await verifyOTP(email, otp);

            // If verification is successful and we get a token
            if (response.data.token) {
                toast.success('Email verified successfully!');

                // Save the token
                Cookies.set('token', response.data.token, { expires: 7 });

                // Fetch user data with the new token
                try {
                    const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
                        headers: { Authorization: `Bearer ${response.data.token}` }
                    });
                    const userData = await userResponse.json();

                    // Update authentication state
                    setIsAuthenticated(true);
                    setUser(userData);

                    // Redirect to dashboard
                    setTimeout(() => navigate('/classroom'), 1500);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    toast.error('Verification successful, but failed to get user data. Please login.');
                    setTimeout(() => navigate('/login'), 1500);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to verify OTP';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);

        try {
            await resendOTP(email);
            toast.success('A new OTP has been sent to your email');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
            toast.error(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>

            <div className="mb-6 text-center">
                <p className="text-gray-600">
                    We've sent a verification code to <span className="font-medium">{email}</span>.
                    Please enter the code below to verify your email address.
                </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="otp">
                        Verification Code
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter verification code"
                            className="pl-10 w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors font-medium flex justify-center items-center"
                >
                    {isSubmitting ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="flex justify-between items-center mt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-blue-500 hover:underline"
                    >
                        Go back
                    </button>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResending}
                        className="text-blue-500 hover:underline flex items-center"
                    >
                        {isResending ? (
                            <>
                                <RefreshCw size={16} className="animate-spin mr-1" />
                                Sending...
                            </>
                        ) : (
                            'Resend OTP'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OTPVerification;
