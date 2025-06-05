import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { DateContext } from "../contexts/DateContext";

const zoneDetails = {
    1: { name: "PLATING", category: "C-49" },
    2: { name: "DIE CASTING+CB+CNC", category: "C-50" },
    3: { name: "SCOTCH BUFFING", category: "C-50" },
    4: { name: "BUFFING", category: "C-49" },
    5: { name: "SPRAY+EPL-I", category: "C-50" },
    6: { name: "SPRAY+ EPL-II", category: "C-49" },
    7: { name: "RUMBLE", category: "C-50" },
    8: { name: "AIR COMPRESSOR", category: "C-49" },
    9: { name: "TERRACE", category: "C-49" },
    10: { name: "TOOL ROOM", category: "C-50" },
    11: { name: "ADMIN BLOCK", category: "C-50" },
};

const getZoneNameAndCategory = (id) => {
  return zoneDetails[id] || { name: "Unknown Zone", category: "N/A" };
};

const EnergyMeter = ({ name, consumption, id }) => {
  const navigate = useNavigate();
  const zoneInfo = getZoneNameAndCategory(id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-50 flex flex-col justify-between items-center text-center p-4 border border-gray-500 dark:border-gray-700 transition-colors duration-300">
      <div className="bg-green-500 text-white text-xs font-medium py-1 w-40 rounded whitespace-nowrap max-w-[150px]">
        <div className="font-bold">{zoneInfo.name}</div>
        <div className="text-white">Block: {zoneInfo.category}</div>
      </div>

      <div className="pt-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap transition-colors duration-300">{consumption.toFixed(1)} kVAh</div>
        <div className="text-xs text-gray-400 dark:text-gray-300 transition-colors duration-300">Consumption</div>
      </div>

      <button
        onClick={() => navigate(`/monitor/zones?zone=${id}`)}
        className="mt-2 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
      >
        View Details
      </button>
    </div>
  );
};

const MeterInfo = () => {
  const { selectedDate: globalSelectedDate, startDateTime: globalStartDateTime, endDateTime: globalEndDateTime } = useContext(DateContext);
  const [energyMeters, setEnergyMeters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://mw.elementsenergies.com/api/econsumption`, {
          params: {
            startDateTime: globalStartDateTime,
            endDateTime: globalEndDateTime
          }
        });
  
        const formattedData = response.data.consumptionData.map((entry) => ({
          id: entry.energy_meter_id,
          name: `Zone ${entry.energy_meter_id}`,
          consumption: parseFloat(entry.consumption)
        }));
  
        setEnergyMeters(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [globalStartDateTime, globalEndDateTime]);
  

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md flex flex-col transition-colors duration-300">
      <h2 className="text-xl font-semibold pb-7 text-gray-900 dark:text-gray-100 transition-colors duration-300">Energy Meters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-16 gap-y-6 mx-auto xl:mx-0">
        {energyMeters.map((meter) => (
          <EnergyMeter key={meter.id} name={meter.name} consumption={meter.consumption} id={meter.id} />
        ))}
      </div>
    </div>
  );
};

export default MeterInfo;