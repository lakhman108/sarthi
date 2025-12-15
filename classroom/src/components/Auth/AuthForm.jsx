import React, { useContext, useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { login, register } from './auth';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../../context/Usercontex';
import axios from 'axios';
import OTPVerification from './OTPVerification';


const InputField = ({ icon: Icon, ...props }) => (
    <div className="mb-5">
        <label htmlFor={props.id} className="block text-sm font-semibold text-gray-700 mb-2 font-body">
            {props.label}
        </label>
        <div className="relative">
            <input
                {...props}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarthi-purple-500 focus:border-transparent transition-all placeholder:text-gray-400 font-body"
            />
        </div>
    </div>
);

const PasswordField = ({ showPassword, toggleShowPassword, ...props }) => (
    <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor={props.id} className="block text-sm font-semibold text-gray-700 font-body">
                {props.label}
            </label>
            {props.showForgot && (
                <a href="#" className="text-xs text-sarthi-purple-600 hover:text-sarthi-purple-700 font-semibold">
                    Forgot password?
                </a>
            )}
        </div>
        <div className="relative">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarthi-purple-500 focus:border-transparent transition-all placeholder:text-gray-400 font-body"
            />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);

const SelectField = ({ ...props }) => (
    <div className="mb-5">
        <label htmlFor={props.id} className="block text-sm font-semibold text-gray-700 mb-2 font-body">
            {props.label}
        </label>
        <select
            {...props}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarthi-purple-500 focus:border-transparent transition-all font-body appearance-none cursor-pointer"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
            }}
        >
            {props.children}
        </select>
    </div>
);



const AuthForm = ({ isLogin }) => {
    const { setUser, setIsAuthenticated } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSuccess = (token, user) => {
        setIsAuthenticated(true);
        setUser(user);
        Cookies.set('token', token, { expires: 7 });

        const pendingInviteCode = localStorage.getItem('pendingInviteCode');
        if (pendingInviteCode) {
            localStorage.removeItem('pendingInviteCode');
            toast.success('Login successful! Redirecting to join classroom...');
            setTimeout(() => navigate(`/join/${pendingInviteCode}`), 1500);
        } else {
            toast.success('Login successful!');
            setTimeout(() => navigate('/classroom'), 1500);
        }
    };

    const fetchUserData = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error('Error fetching user data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isLogin) {
                const loginResponse = await login(formData);
                const { token } = loginResponse.data;

                // Check if verification is required
                if (loginResponse.data.requiresVerification) {
                    toast.info(loginResponse.data.message || 'Please verify your email');
                    setShowOTPVerification(true);
                    return;
                }

                const user = await fetchUserData(token);
                handleLoginSuccess(token, user);
            } else {
                const registerResponse = await register(formData);

                // Check if registration needs verification
                if (registerResponse.data.requiresVerification) {
                    toast.success('Registration successful! Please verify your email with the OTP sent.');
                    setShowOTPVerification(true);
                    return;
                }

                toast.success('Registration successful! Please log in.');
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            handleError(error, isLogin ? 'Login failed' : 'Registration failed');
        }
    };

    const handleError = (error, defaultMessage) => {
        // If account not verified error, show OTP verification
        if (error.response?.data?.requiresVerification) {
            toast.info(error.response.data.message || 'Please verify your email');
            setShowOTPVerification(true);
            return;
        }

        const errorMessage = error.response?.data?.error || defaultMessage;
        toast.error(`${errorMessage}. Please try again.`);
        console.error(error);
    };

    const handleBackFromOTP = () => {
        setShowOTPVerification(false);
    };

    if (showOTPVerification) {
        return <OTPVerification
            email={formData.email}
            onBack={handleBackFromOTP}
            isAfterLogin={isLogin}
        />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            {!isLogin && (
                <InputField
                    icon={User}
                    id="username"
                    name="username"
                    label="Name"
                    placeholder="John Doe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            )}
            <InputField
                icon={Mail}
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <PasswordField
                id="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
                showForgot={isLogin}
                required
            />
            {!isLogin && (
                <SelectField
                    id="role"
                    name="role"
                    label="I am a..."
                    value={formData.role}
                    onChange={handleChange}
                    required
                >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </SelectField>
            )}
            <button
                type="submit"
                className="w-full bg-sarthi-purple-600 text-white py-3.5 rounded-lg hover:bg-sarthi-purple-700 transition-all font-semibold font-body shadow-lg shadow-sarthi-purple-500/30 hover:shadow-xl hover:shadow-sarthi-purple-500/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
                {isLogin ? 'Sign in' : 'Create account'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
        </form>
    );
};



export default AuthForm;
