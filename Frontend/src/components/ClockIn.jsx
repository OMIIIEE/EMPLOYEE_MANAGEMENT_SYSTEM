import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap-icons/font/bootstrap-icons.css";

const ClockIn = () => {
    const { id } = useParams();
    const [location, setLocation] = useState('office');
    const [loading, setLoading] = useState(false);
    const [clockedIn, setClockedIn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Check local storage for clock-in status on component mount
        const clockInStatus = localStorage.getItem('clockInStatus');
        if (clockInStatus) {
            setClockedIn(JSON.parse(clockInStatus));
        }
    }, []);

    const updateClockInStatus = (status) => {
        localStorage.setItem('clockInStatus', JSON.stringify(status));
        setClockedIn(status);
    };

    const handleClockIn = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/employee/employee_clockin/${id}`, {
                location: location === 'office' ? 'Office' : 'Home',
                work_from_type: location === 'office' ? 'office' : 'remote',
            });

            if (response.data.status === 'success') {
                console.log('Clock-in successful');
                updateClockInStatus(true);
                setShowModal(false);
                toast.success('Clock-in successful');
            }
        } catch (error) {
            console.error('Error while clocking in:', error);
            toast.error('Error while clocking in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/employee/employee_clockout/${id}`);
            if (response.data.success) {
                console.log('Clock-out successful');
                updateClockInStatus(false);
                toast.success('Clock-out successful');
            }
        } catch (error) {
            console.error('Error while clocking out:', error);
            toast.error('Error while clocking out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {!clockedIn && (
                <button type="button" className="btn btn-primary d-flex align-items-center" onClick={() => setShowModal(true)}>
                    <i className="fs-5 bi bi-box-arrow-in-right" style={{ marginRight: '5px' }}></i>
                    Clock In
                </button>
            )}
            {showModal && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Clock In</h5>
                                <span
                                    aria-hidden="true"
                                    style={{ color: '#999', fontSize: '24px', position: 'absolute', top: '8px', right: '12px', cursor: 'pointer' }}
                                    onClick={() => setShowModal(false)}
                                >
                                    &times;
                                </span>
                            </div>
                            <form onSubmit={handleClockIn}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="location" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
                                            Location
                                        </label>
                                        <select className="form-control" id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                                            <option value="office">Office</option>
                                            <option value="home">Home</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>Clock In</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {clockedIn && (
                <div>
                    <button type="button" className="btn btn-danger" onClick={handleClockOut} disabled={loading}>
                        <i className="fs-5 bi bi-box-arrow-right" style={{ marginRight: '5px' }}></i>
                        Clock Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClockIn;
