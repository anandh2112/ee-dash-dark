import React from 'react';
import { useNavigate } from 'react-router-dom';
import dg from "../sections/pictures/DieselUpd.png";

const DieselGeneration = () => {
  const navigate = useNavigate(); 

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 group opacity-50 transition-colors duration-300">
      {/* Overlay for "Section Not Available" */}
      <div className="absolute inset-0 flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity z-10">
        <p className="text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-4 rounded-lg shadow-lg">
          Section Not Available
        </p>
      </div>

      <h2 className="text-lg font-bold pb-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">Diesel Generators</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
          <img className="w-50 h-40 object-contain rounded-lg mb-4" src={dg} alt="DG1" />
          <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">DG1</h2>
          <div className="text-gray-700 dark:text-gray-200 text-sm space-y-2 transition-colors duration-300">
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-green-600 dark:text-green-400">Running</span>
            </p>
            <p><strong>Power Output:</strong> 500 kW</p>
            <p><strong>Last Maintenance:</strong> 12 Jan 2024</p>
          </div>
          <button 
            onClick={() => navigate('/generator/1')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            View Details
          </button>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
          <img className="w-50 h-40 object-contain rounded-lg mb-4" src={dg} alt="DG2" />
          <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">DG2</h2>
          <div className="text-gray-700 dark:text-gray-200 text-sm space-y-2 transition-colors duration-300">
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-yellow-600 dark:text-yellow-400">Idle</span>
            </p>
            <p><strong>Power Output:</strong> 300 kW</p>
            <p><strong>Last Maintenance:</strong> 05 Feb 2024</p>
          </div>
          <button 
            onClick={() => navigate('/generator/2')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default DieselGeneration;