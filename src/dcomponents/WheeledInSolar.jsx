import React from "react";
import SolarPanel from "../dcomponents/SolarPanel.png";

const WheeledInSolar = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 shadow-md rounded-lg px-6 pt-6 w-full flex flex-col group opacity-50 transition-colors duration-300">
      <div className="absolute inset-0 flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity z-10">
        <p className="text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-4 rounded-lg shadow-lg">
          Section Not Available
        </p>
      </div>

      <div className="flex justify-between items-center pb-4">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-100 transition-colors duration-300">Wheeled-in Solar</h3>
        <div className="flex items-center text-gray-500 dark:text-gray-300 transition-colors duration-300">
          <span role="img" aria-label="sun">
            ☀️
          </span>
          <span className="text-sm font-bold pl-1">32°C</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row pt-4 flex-grow">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col pb-6 border-b border-gray-200 dark:border-gray-700 pl-2">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Charging</h4>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
              80.88 <span className="text-sm font-normal">kWh</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 transition-colors duration-300">
              Min <span className="text-red-500 dark:text-red-400">3.0</span> - Max{" "}
              <span className="text-green-500 dark:text-green-400">10.0</span>
            </p>
          </div>

          <div className="flex flex-col py-6 pl-2">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Power Usage</h4>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
              17.05 <span className="text-sm font-normal">kWh</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 transition-colors duration-300">
              1 hour usage <span className="text-gray-800 dark:text-gray-100">6.8 kWh</span>
            </p>
          </div>

          <div className="flex flex-col pt-6 border-t border-gray-200 dark:border-gray-700 pl-2">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Energy Yield vs. Time (Last 24 Hours)</h4>
            <div className="flex flex-col">
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                120.5 <span className="text-sm font-normal">kWh</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 transition-colors duration-300">
                Average Yield over the past 24 hours: <span className="text-green-500 dark:text-green-400">5.0 kWh</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 items-center justify-center pt-2 lg:pt-0 lg:pl-6 -translate-y-14">
          <img
            src={SolarPanel} 
            alt="Solar Panel"
            className="w-50 h-50 object-contain"
          />

          <div className="flex w-full pt-4 justify-between text-sm text-gray-500 dark:text-gray-300 gap-4 transition-colors duration-300">
            <div className="flex flex-col items-center flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
              <p className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">220.0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Capacity (kWh)</p>
            </div>

            <div className="flex flex-col items-center flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
              <p className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">175.0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Yield (kWh)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheeledInSolar;