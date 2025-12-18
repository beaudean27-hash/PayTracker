import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Plus, Check, X, Edit2, LogOut, Settings } from 'lucide-react';
import { useAuth } from './AuthContext';
import AccountSettings from './AccountSettings';

export default function WorkPaymentTracker() {
  const { currentUser, logout, changePassword } = useAuth();
  const [workDays, setWorkDays] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [dayType, setDayType] = useState('full');
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editDayType, setEditDayType] = useState('full');
  const [confirmPayId, setConfirmPayId] = useState(null);
  const [activeTab, setActiveTab] = useState('unpaid');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteDoubleConfirmId, setDeleteDoubleConfirmId] = useState(null);
  const [permanentDeleteConfirmId, setPermanentDeleteConfirmId] = useState(null);
  const [permanentDeleteDoubleConfirmId, setPermanentDeleteDoubleConfirmId] = useState(null);
  const [permanentDeleteTripleConfirmId, setPermanentDeleteTripleConfirmId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = oldest first, 'desc' = newest first

  // Load data from storage on mount
  useEffect(() => {
    loadWorkDays();
  }, []);

  const loadWorkDays = async () => {
    try {
      const result = await window.storage.get('work-days');
      if (result) {
        setWorkDays(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing work days found');
    }
  };

  const saveWorkDays = async (days) => {
    try {
      await window.storage.set('work-days', JSON.stringify(days));
    } catch (error) {
      console.error('Failed to save work days:', error);
    }
  };

  const addWorkDay = () => {
    if (!newDate) return;

    const newDay = {
      id: Date.now(),
      date: newDate,
      type: dayType,
      paid: false,
      addedOn: new Date().toISOString()
    };

    const updatedDays = [...workDays, newDay];
    
    setWorkDays(updatedDays);
    saveWorkDays(updatedDays);
    setNewDate('');
    setDayType('full');
    setShowAddForm(false);
  };

  const togglePaid = (id) => {
    if (confirmPayId === id) {
      // Confirm the payment
      const updatedDays = workDays.map(day =>
        day.id === id ? { ...day, paid: true, paidDate: new Date().toISOString() } : day
      );
      setWorkDays(updatedDays);
      saveWorkDays(updatedDays);
      setConfirmPayId(null);
    } else {
      // Show confirmation
      setConfirmPayId(id);
    }
  };

  const cancelPayConfirm = () => {
    setConfirmPayId(null);
  };

  const markAsUnpaid = (id) => {
    const updatedDays = workDays.map(day =>
      day.id === id ? { ...day, paid: false, paidDate: null } : day
    );
    setWorkDays(updatedDays);
    saveWorkDays(updatedDays);
  };

  const deleteWorkDay = (id) => {
    const day = workDays.find(d => d.id === id);
    
    if (day && day.paid) {
      // For paid days, require double confirmation before moving to deleted
      if (deleteDoubleConfirmId === id) {
        // Move to deleted instead of removing
        const updatedDays = workDays.map(d =>
          d.id === id ? { ...d, deleted: true, deletedDate: new Date().toISOString() } : d
        );
        setWorkDays(updatedDays);
        saveWorkDays(updatedDays);
        setDeleteConfirmId(null);
        setDeleteDoubleConfirmId(null);
      } else if (deleteConfirmId === id) {
        setDeleteDoubleConfirmId(id);
      } else {
        setDeleteConfirmId(id);
      }
    } else {
      // For unpaid days, require single confirmation before moving to deleted
      if (deleteConfirmId === id) {
        // Move to deleted instead of removing
        const updatedDays = workDays.map(d =>
          d.id === id ? { ...d, deleted: true, deletedDate: new Date().toISOString() } : d
        );
        setWorkDays(updatedDays);
        saveWorkDays(updatedDays);
        setDeleteConfirmId(null);
      } else {
        setDeleteConfirmId(id);
      }
    }
  };

  const permanentlyDeleteDay = (id) => {
    if (permanentDeleteTripleConfirmId === id) {
      // Final deletion
      const updatedDays = workDays.filter(d => d.id !== id);
      setWorkDays(updatedDays);
      saveWorkDays(updatedDays);
      setPermanentDeleteConfirmId(null);
      setPermanentDeleteDoubleConfirmId(null);
      setPermanentDeleteTripleConfirmId(null);
    } else if (permanentDeleteDoubleConfirmId === id) {
      setPermanentDeleteTripleConfirmId(id);
    } else if (permanentDeleteConfirmId === id) {
      setPermanentDeleteDoubleConfirmId(id);
    } else {
      setPermanentDeleteConfirmId(id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
    setDeleteDoubleConfirmId(null);
  };

  const cancelPermanentDelete = () => {
    setPermanentDeleteConfirmId(null);
    setPermanentDeleteDoubleConfirmId(null);
    setPermanentDeleteTripleConfirmId(null);
  };

  const restoreDeletedDay = (id) => {
    const updatedDays = workDays.map(d =>
      d.id === id ? { ...d, deleted: false, deletedDate: null } : d
    );
    setWorkDays(updatedDays);
    saveWorkDays(updatedDays);
  };

  const startEdit = (day) => {
    setEditingId(day.id);
    setEditDate(day.date);
    setEditDayType(day.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditDayType('full');
  };

  const saveEdit = () => {
    if (!editDate) return;

    const updatedDays = workDays.map(day =>
      day.id === editingId
        ? { ...day, date: editDate, type: editDayType }
        : day
    );

    setWorkDays(updatedDays);
    saveWorkDays(updatedDays);
    cancelEdit();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateStats = () => {
    const unpaidDays = workDays.filter(d => !d.paid && !d.deleted)
      .reduce((sum, d) => sum + (d.type === 'full' ? 1 : 0.5), 0);
    const paidDays = workDays.filter(d => d.paid && !d.deleted)
      .reduce((sum, d) => sum + (d.type === 'full' ? 1 : 0.5), 0);
    const deletedDays = workDays.filter(d => d.deleted)
      .reduce((sum, d) => sum + (d.type === 'full' ? 1 : 0.5), 0);
    const totalDays = unpaidDays + paidDays;

    return { unpaidDays, paidDays, deletedDays, totalDays };
  };

  const getFilteredDays = () => {
    let filtered;
    if (activeTab === 'unpaid') {
      filtered = workDays.filter(day => !day.paid && !day.deleted);
    } else if (activeTab === 'history') {
      filtered = workDays.filter(day => day.paid && !day.deleted);
    } else {
      filtered = workDays.filter(day => day.deleted);
    }
    
    // Sort by date based on sortOrder
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const stats = calculateStats();
  const filteredDays = getFilteredDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Work & Payment Tracker</h1>
                <p className="text-xs sm:text-sm text-gray-600">Logged in as: {currentUser?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-1 sm:gap-2 bg-gray-200 text-gray-700 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                title="Account Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 sm:gap-2 bg-gray-200 text-gray-700 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 sm:p-4">
              <div className="text-red-600 text-xs sm:text-sm font-semibold mb-1">Unpaid Days</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700">{stats.unpaidDays}</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 sm:p-4">
              <div className="text-green-600 text-xs sm:text-sm font-semibold mb-1">Paid Days</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700">{stats.paidDays}</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2 sm:p-4">
              <div className="text-blue-600 text-xs sm:text-sm font-semibold mb-1">Total Days</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700">{stats.totalDays}</div>
            </div>
          </div>

          {/* Add Work Day Button */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 sm:gap-3 bg-indigo-600 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg font-semibold">Add Work Day</span>
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-xs sm:text-sm font-medium"
              title={sortOrder === 'asc' ? 'Currently showing oldest first. Click to show newest first.' : 'Currently showing newest first. Click to show oldest first.'}
            >
              <Calendar className="w-4 h-4" />
              <span>{sortOrder === 'asc' ? '↑ Oldest First' : '↓ Newest First'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b-2 border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                activeTab === 'unpaid'
                  ? 'text-red-600 border-b-2 border-red-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unpaid ({stats.unpaidDays})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-green-600 border-b-2 border-green-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History ({stats.paidDays})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                activeTab === 'deleted'
                  ? 'text-gray-600 border-b-2 border-gray-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Deleted ({stats.deletedDays})
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-indigo-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Add Work Day</h2>
              <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                  font-size: 1.5rem;
                  cursor: pointer;
                  padding: 4px;
                }
              `}</style>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Date Worked
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    style={{ fontSize: '16px', minHeight: '48px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Day Type
                  </label>
                  <select
                    value={dayType}
                    onChange={(e) => setDayType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    style={{ fontSize: '16px', minHeight: '48px' }}
                  >
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={addWorkDay}
                  className="flex-1 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
                >
                  Add Day
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Work Days List */}
          <div className="space-y-3">
            {filteredDays.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {activeTab === 'unpaid' && 'No unpaid work days'}
                  {activeTab === 'history' && 'No payment history yet'}
                  {activeTab === 'deleted' && 'No deleted days'}
                </p>
                <p className="text-sm">
                  {activeTab === 'unpaid' && 'Click "Add Work Day" to get started'}
                  {activeTab === 'history' && 'Mark days as paid to see them here'}
                  {activeTab === 'deleted' && 'Deleted days will appear here'}
                </p>
              </div>
            ) : (
              filteredDays.map((day) => (
                <div
                  key={day.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${
                    day.deleted
                      ? 'bg-gray-50 border-gray-300'
                      : day.paid
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  {editingId === day.id ? (
                    // Edit Mode
                    <div className="flex-1 flex items-center gap-4">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <select
                        value={editDayType}
                        onChange={(e) => setEditDayType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="full">Full Day</option>
                        <option value="half">Half Day</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                          title="Save changes"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            day.deleted ? 'bg-gray-500' : day.paid ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {day.deleted ? (
                            <X className="w-6 h-6 text-white" />
                          ) : day.paid ? (
                            <DollarSign className="w-6 h-6 text-white" />
                          ) : (
                            <Calendar className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {formatDate(day.date)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {day.type === 'full' ? 'Full Day' : 'Half Day'}
                            {day.paid && day.paidDate && !day.deleted && (
                              <span> • Paid on {formatDate(day.paidDate.split('T')[0])}</span>
                            )}
                            {day.deleted && day.deletedDate && (
                              <span> • Deleted on {formatDate(day.deletedDate.split('T')[0])}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {day.deleted ? (
                          // Deleted Day Actions
                          <>
                            <button
                              onClick={() => restoreDeletedDay(day.id)}
                              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-semibold"
                              title="Restore day"
                            >
                              Restore
                            </button>
                            {permanentDeleteTripleConfirmId === day.id ? (
                              <button
                                onClick={() => permanentlyDeleteDay(day.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                              >
                                FINAL DELETE
                              </button>
                            ) : permanentDeleteDoubleConfirmId === day.id ? (
                              <button
                                onClick={() => permanentlyDeleteDay(day.id)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
                              >
                                Click Again (3/3)
                              </button>
                            ) : permanentDeleteConfirmId === day.id ? (
                              <button
                                onClick={() => permanentlyDeleteDay(day.id)}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-semibold"
                              >
                                Click Again (2/3)
                              </button>
                            ) : (
                              <button
                                onClick={() => permanentlyDeleteDay(day.id)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition font-semibold"
                              >
                                Delete Forever (1/3)
                              </button>
                            )}
                            <button
                              onClick={cancelPermanentDelete}
                              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                              title="Cancel"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : !day.paid ? (
                          // Unpaid Day Actions
                          <>
                            <button
                              onClick={() => startEdit(day)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            {confirmPayId === day.id ? (
                              <>
                                <button
                                  onClick={() => togglePaid(day.id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                                  title="Confirm payment"
                                >
                                  Confirm Paid
                                </button>
                                <button
                                  onClick={cancelPayConfirm}
                                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => togglePaid(day.id)}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                title="Mark as paid"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            {deleteConfirmId === day.id ? (
                              <>
                                <button
                                  onClick={() => deleteWorkDay(day.id)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  onClick={cancelDelete}
                                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => deleteWorkDay(day.id)}
                                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                                title="Delete"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        ) : (
                          // Paid Day Actions
                          <>
                            <button
                              onClick={() => markAsUnpaid(day.id)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-semibold"
                              title="Move back to unpaid"
                            >
                              Mark Unpaid
                            </button>
                            {deleteDoubleConfirmId === day.id ? (
                              <button
                                onClick={() => deleteWorkDay(day.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                              >
                                Confirm Delete (2/2)
                              </button>
                            ) : deleteConfirmId === day.id ? (
                              <button
                                onClick={() => deleteWorkDay(day.id)}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-semibold"
                              >
                                Click Again (1/2)
                              </button>
                            ) : (
                              <button
                                onClick={() => deleteWorkDay(day.id)}
                                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                                title="Delete"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={cancelDelete}
                              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                              title="Cancel delete"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showSettings && (
        <AccountSettings
          username={currentUser?.username}
          onClose={() => setShowSettings(false)}
          onChangePassword={changePassword}
        />
      )}

      {/* Version Number */}
      <div className="text-center py-4 text-gray-500 text-sm">
        Version 1.0.0
      </div>
    </div>
  );
}
