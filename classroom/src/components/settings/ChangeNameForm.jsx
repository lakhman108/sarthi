import React, { useState, useEffect } from 'react';
import { updateUserName } from '../../utils/userApi';
import { User } from 'lucide-react';
import { toast } from 'react-toastify';

const ChangeNameForm = ({ user, setUser }) => {
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log('ChangeNameForm mounted');
        return () => console.log('ChangeNameForm unmounted');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        setIsSubmitting(true);

        try {
            console.log('Attempting to update name...');
            const updatedUser = await updateUserName(user._id, newName);
            console.log('Name update response:', updatedUser);

            setUser(updatedUser);
            console.log('User state updated');

            toast.success('Name updated successfully');
            console.log('Success toast called');

            setNewName('');
        } catch (error) {
            console.error('Error updating name:', error);
            toast.error('Failed to update name. Please try again.');
            console.log('Error toast called');
        } finally {
            setIsSubmitting(false);
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
                    />
                </div>
            </div>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Updating...' : 'Update Name'}
            </button>
        </form>
    );
};

export default ChangeNameForm;
