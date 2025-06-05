import React from 'react';
import MonthlyConsumption from './MonthlyConsumption';
import MeterReading from '../../components/MeterReading';

const BuildingOverview = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-5 flex justify-center items-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full transition-colors duration-300">
        <MeterReading/>
      </div>
    </div>
  );
};

export default BuildingOverview;