import React, { useState, useEffect, useCallback } from 'react';
import { updateUserName } from '../../utils/userApi';
import { User } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChangeNameForm = ({ user, setUser }) => {
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        return () => {
            setIsMounted(false);

        };
    }, []);

    const showToast = useCallback((type, message) => {
        if (isMounted) {
            if (type === 'success') {
                toast.success(message, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else if (type === 'error') {
                toast.error(message, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }, [isMounted]);

    const handleError = (error, defaultMessage) => {
        if (error.response) {
          toast.error(error.response.data.error || defaultMessage);
        } else {
          toast.error(defaultMessage);
        }
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newName.trim()) {
            showToast('error', 'Please enter a valid name');
            return;
        }

        setIsSubmitting(true);

        try {
            // console.log('Attempting to update name...');
            let updatedUser = await updateUserName(user._id, newName);
            // console.log('Name update response:', updatedUser);
            updatedUser= updatedUser.data;

            if (!updatedUser) {
                throw new Error('No response from server');
            }

            setUser(updatedUser);
            console.log('User state updated');

            // Only show toast if component is still mounted
            showToast('success', 'Name updated successfully!');
            setNewName('');

        } catch (error) {
            console.error('Error updating name:', error);
            handleError(error, 'Failed to update name. Please try again.');
        } finally {
            if (isMounted) {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Change Name</h2>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newName">
                    New Name
                </label>
                <div className="flex items-center">
                    <User className="text-gray-500 mr-2" />
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="newName"
                        type="text"
                        placeholder="Enter new name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        minLength={2}
                    />
                </div>
            </div>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting || !newName.trim()}
            >
                {isSubmitting ? 'Updating...' : 'Update Name'}
            </button>
        </form>
    );
};

export default ChangeNameForm;
