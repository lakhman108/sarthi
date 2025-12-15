import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { handleNoteSave } from '../../utils/notesService';

const CourseNotes = ({ courseId }) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        // Fetching existing note when component mounts
        const fetchNote = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/enrollments/${courseId}/notes`,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('token')}`,
                        },
                    }
                );
                setNote(response.data.notes || '');
            } catch (error) {
                console.error("Error fetching note:", error);
            }
        };
        fetchNote();
    }, [courseId]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Course Notes</h3>
            <textarea
                className="w-full h-24 sm:h-32 p-3 sm:p-4 border rounded-lg sm:rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-sm sm:text-base transition-all duration-200"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Take notes for this course..."
            />
            <button
                className="mt-4 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5
                         bg-gradient-to-r from-blue-500 to-blue-600
                         hover:from-blue-600 hover:to-blue-700 text-white
                         text-sm sm:text-base font-medium rounded-lg sm:rounded-xl
                         shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => handleNoteSave(courseId, note)}
            >
                Save Notes
            </button>
        </div>
    );
};

export default CourseNotes;
