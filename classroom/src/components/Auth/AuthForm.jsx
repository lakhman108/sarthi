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
    <div className="mb-4">
        <label htmlFor={props.id} className="block text-sm font-medium text-claude-900 mb-1.5 font-body">
            {props.label}
        </label>
        <div className="relative">
            <input
                {...props}
                className="w-full px-3 py-2.5 bg-white border border-claude-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-400 focus:border-transparent transition-all placeholder:text-claude-500 font-body text-sm"
            />
        </div>
    </div>
);

const PasswordField = ({ showPassword, toggleShowPassword, ...props }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
            <label htmlFor={props.id} className="block text-sm font-medium text-claude-900 font-body">
                {props.label}
            </label>
            {props.showForgot && (
                <a href="#" className="text-xs text-claude-700 hover:text-claude-900 font-medium">
                    Forgot password?
                </a>
            )}
        </div>
        <div className="relative">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2.5 pr-10 bg-white border border-claude-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-400 focus:border-transparent transition-all placeholder:text-claude-500 font-body text-sm"
            />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-claude-600 hover:text-claude-900 transition-colors"
            >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    </div>
);

const SelectField = ({ ...props }) => (
    <div className="mb-4">
        <label htmlFor={props.id} className="block text-sm font-medium text-claude-900 mb-1.5 font-body">
            {props.label}
        </label>
        <select
            {...props}
            className="w-full px-3 py-2.5 bg-white border border-claude-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-400 focus:border-transparent transition-all font-body appearance-none cursor-pointer text-sm"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239d8169' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
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
                className="w-full bg-claude-900 text-white py-2.5 rounded-lg hover:bg-claude-800 transition-colors font-medium font-body flex items-center justify-center gap-2 text-sm mt-2"
            >
                {isLogin ? 'Sign in' : 'Create account'}
            </button>
        </form>
    );
};



export default AuthForm;
