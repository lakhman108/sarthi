import React, { useContext, useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { login, register } from './auth';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../../context/Usercontex';
import axios from 'axios';



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

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;

            // Handle login
            if (isLogin) {
                try {


                    const handleLoginSuccess = () => {
                        const pendingInviteCode = localStorage.getItem('pendingInviteCode');
                        if (pendingInviteCode) {
                            localStorage.removeItem('pendingInviteCode');
                            navigate(`/join/${pendingInviteCode}`);
                        } else {
                            navigate('/classroom');
                        }
                    };
                    response = await login(formData);
                    const { token } = response.data;

                    // Save token in cookies
                    Cookies.set('token', token, { expires: 7 });

                    // Fetch user data with the token
                    await axios
                        .get('https://sarthibackend-production.up.railway.app/api/users', {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((response) => {
                            const user = response.data;
                            setIsAuthenticated(true);
                            setUser(user);
                        })
                        .catch((error) => {
                            console.error('Error fetching user data:', error);
                            toast.error('Error fetching user data. Please try again.');
                        });

                    // Display success message and navigate to classroom
                    toast.success('Login successful!');
                    setTimeout(() => navigate('/classroom'), 2000);
                } catch (error) {
                    handleError(error, 'Login failed. Please try again.');
                }

                // Handle registration
            } else {
                try {
                    response = await register(formData);

                    if (response.status === 201) {
                        toast.success('Registration successful! Please log in.');
                        setTimeout(() => navigate('/login'), 3000);
                    }
                } catch (error) {
                    handleError(error, 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    // Handle errors
    const handleError = (error, defaultMessage) => {
        if (error.response) {
            toast.error(error.response.data.error || defaultMessage);
        } else {
            toast.error(defaultMessage);
        }
    };
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
