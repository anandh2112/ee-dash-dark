import React, { useState } from 'react';
import evcharger from '../sections/ev.png';

// EV Charger Overview Component
const EVChargerOverview = () => {
  // Data for the main statistics
  const mainStats = [
    { title: 'No. of chargers used', value: ' 01' },
    { title: 'Total Sessions Today', value: ' 01' },
    { title: 'Total Energy Used', value: ' 1.1 kWh' },
  ];

  // Data for EV Charger stations
  const evChargerStats = [
    { capacity: '3.3 KW', location: 'Basement Level-1', energyConsumed: '0 kWh', status: 'Idle' },
    { capacity: '3.3 KW', location: 'Basement Level-2', energyConsumed: '1.1 kWh', status: 'Active' },
    { capacity: '3.3 KW', location: 'Open Parking', energyConsumed: '0 kWh', status: 'Idle' },
    { capacity: '7 KW', location: 'MLCP 1st floor', energyConsumed: '0 kWh', status: 'Not Operational' },
    { capacity: '7 KW', location: 'MLCP 2nd floor', energyConsumed: '0 kWh', status: 'Idle' },
    { capacity: '7 KW', location: 'MLCP 3rd floor', energyConsumed: '0 kWh', status: 'Idle' },
  ];

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper function to determine color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500 dark:bg-green-400';
      case 'Idle':
        return 'bg-yellow-500 dark:bg-yellow-400';
      case 'Unavailable':
        return 'bg-red-500 dark:bg-red-400';
      default:
        return 'bg-gray-400 dark:bg-gray-500'; // Default for "Not Operational"
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Big Card for the entire EV Chargers section */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 relative group opacity-50 transition-colors duration-300">
        
        {/* Hover Tooltip for Entire Section */}
        <div className="absolute inset-0 flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity z-10">
          <p className="text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-4 rounded-lg shadow-lg">
            Section Not Available
          </p>
        </div>

        <div className='flex justify-between'>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 pb-6 transition-colors duration-300">EV Chargers</h3>

          {/* Date Picker Icon */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]} // Format the date as YYYY-MM-DD
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="text-gray-600 dark:text-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Mini Cards for Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
          {mainStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center transition-colors duration-300"
            >
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">{stat.title}</h4>
              <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* EV Charger Station Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evChargerStats.map((charger, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center relative shadow-md transition-colors duration-300"
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2 flex items-center">
                <span
                  className={`w-3 h-3 rounded-full ${getStatusColor(charger.status)} mr-2 transition-colors duration-300`}
                ></span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{charger.status}</span>
              </div>

              {/* Image Box */}
              <div className="w-24 h-24 border border-gray-300 dark:border-gray-700 bg-white rounded-full overflow-hidden flex justify-center items-center transition-colors duration-300">
                <img
                  src={evcharger}
                  alt="EV Charger"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Location */}
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 pt-1 transition-colors duration-300">
                <span className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Location:</span> {charger.location}
              </h4>

              {/* Capacity and Energy Consumed */}
              <div className="pt-2 bg-white dark:bg-gray-900 rounded-lg p-2 w-full transition-colors duration-300">
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="font-medium">Capacity:</span> {charger.capacity}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="font-medium">Energy Consumed:</span> {charger.energyConsumed}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EVChargerOverview;