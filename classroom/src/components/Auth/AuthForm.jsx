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
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {props.label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
                {...props}
                className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    </div>
);

const PasswordField = ({ showPassword, toggleShowPassword, ...props }) => (
    <div className="mb-4">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {props.label}
        </label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className="pl-10 pr-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);

const SelectField = ({ ...props }) => (
    <div className="mb-4">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {props.label}
        </label>
        <select
            {...props}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    label="Username"
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
                value={formData.email}
                onChange={handleChange}
                required
            />
            <PasswordField
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
                required
            />
            {!isLogin && (
                <SelectField
                    id="role"
                    name="role"
                    label="Role"
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
                className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
                {isLogin ? 'Log In' : 'Sign Up'}
            </button>
        </form>
    );
};



export default AuthForm;
