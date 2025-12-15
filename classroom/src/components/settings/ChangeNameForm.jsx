import React, { useState } from 'react';
import { updateUserName } from '../../utils/userApi';
import { User } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChangeNameForm = ({ user, setUser, setActiveSection }) => {
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response?.data?.error || defaultMessage;
        toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newName.trim()) {
            toast.error('Please enter a valid name');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: updatedUser } = await updateUserName(user._id, newName);

            setUser(updatedUser);
            toast.success('Name updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                onClose: () => {
                    setNewName('');
                    // Stay on same section
                }
            });

        } catch (error) {
            console.error('Error updating name:', error);
            handleError(error, 'Failed to update name. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={true}
                draggable={true}
                pauseOnHover={true}
            />
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
