import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import moment from 'moment-timezone';
import { DateContext } from "../contexts/DateContext";
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

if (Exporting && typeof Exporting === 'function') {
  Exporting(Highcharts);
}

if (ExportData && typeof ExportData === 'function') {
  ExportData(Highcharts);
}

const HConsumption = () => {
  const { startDateTime, endDateTime } = useContext(DateContext); 
  const options = ['kVAh', 'kWh', '₹'];

  const [energyData, setEnergyData] = useState({});
  const [consumptionType, setConsumptionType] = useState('kVAh'); 
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    // Listen for dark mode changes and update chart colors
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint;
        if (consumptionType === 'kWh') {
          endpoint = 'hconsumption';
        } else if (consumptionType === 'kVAh') {
          endpoint = 'hkVAhconsumption';
        } else if (consumptionType === '₹') {
          endpoint = 'hcostconsumption'; 
        }

        const response = await axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
          params: {
            startDateTime,
            endDateTime
          } 
        });

        setEnergyData(response.data.consumptionData);
      } catch (error) {
        console.error('Error fetching data in HConsumption:', error);
      }
    };
  
    if (startDateTime && endDateTime) {
      fetchData();
    }
  // eslint-disable-next-line
  }, [startDateTime, endDateTime, consumptionType]);

  const downloadExcel = () => {
    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, ""]; 
    const columnHeaders = ["Date", "Time", `Value (${consumptionType})`];
    const formattedData = Object.entries(energyData).map(([timestamp, value]) => [
      moment(timestamp, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'), 
      moment(timestamp, 'YYYY-MM-DD HH:mm:ss').format('HH:mm'), 
      parseFloat(value), 
    ]);
    const dataForExcel = [
      headerRow, 
      columnHeaders, 
      ...formattedData, 
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hourly Consumption");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileName = `Hourly_Consumption_${startDateTime}_to_${endDateTime}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), fileName);
  };

  // DARK MODE COLORS
  const chartBg = isDark ? "#18181b" : "#fff";
  const chartText = isDark ? "#f1f5f9" : "#374151";
  const axisLineColor = isDark ? "#374151" : "#e5e7eb";
  const tooltipBg = isDark ? "#18181b" : "#fff";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";
  const tooltipText = isDark ? "#f1f5f9" : "#18181b";
  const gridLineColor = axisLineColor;

  // Legend colors for light/dark mode
  const peakColor = isDark ? "#FF0000" : "rgba(244,67,54,0.7)";
  const normalColor = isDark ? "rgb(255,160,20)" : "rgba(255,152,0,0.7)";
  const offPeakColor = isDark ? "rgb(90,204,94)" : "rgba(76,175,80,0.7)";

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      style: { color: chartText },
    },
    title: { text: null },
    xAxis: {
      categories: Object.keys(energyData).map(ts => moment(ts, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')),
      labels: {
        style: { color: chartText },
        formatter: function () {
          return this.value; 
        }
      },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: {
      min: 0,
      title: { text: null, style: { color: chartText } },
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: false,
        },
        borderWidth: isDark ? 0 : 1, // <-- Remove outline in dark mode
        borderColor: isDark ? undefined : "#fff", // Optional, keep white outline only in light mode
      },
    },
    series: [
      {
        name: consumptionType === '₹' ? "Cost" : "Energy Consumption",
        data: Object.entries(energyData).map(([timestamp, value]) => {
          const hour = moment(timestamp, 'YYYY-MM-DD HH:mm:ss').hour();
          let color;
        
          if (hour >= 5 && hour < 10) {
            color = offPeakColor; // Off-Peak
          } else if ((hour >= 10 && hour < 19) || (hour >= 3 && hour < 5)) {
            color = normalColor; // Normal
          } else {
            color = peakColor; // Peak
          }
        
          return {
            y: parseFloat(value),
            color,
          };
        }),
      },
    ],
    tooltip: {
      shared: true,
      valueSuffix: ` ${consumptionType}`,
      style: { zIndex: 1, color: tooltipText, backgroundColor: tooltipBg },
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
    },
    legend: { enabled: false },
    credits: { enabled: false },
    exporting: {
      enabled:false ,
    },
  };

  return (
    <div className="w-full flex flex-col p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg transition-colors duration-300">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold dark:text-gray-100 transition-colors duration-300">Hourly Energy Consumption</h2>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 rounded-full w-56 h-12 shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {options.map((option, index) => (
              <React.Fragment key={option}>
                <button
                  className={`flex-1 h-full flex items-center justify-center text-sm font-medium rounded-full transition-all duration-300 ${
                    consumptionType === option
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  onClick={() => setConsumptionType(option)}
                >
                  {option}
                </button>
                {index < options.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 transition-colors duration-300"></div> 
                )}
              </React.Fragment>
            ))}
          </div>
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            Download Excel
          </button>
        </div>
      </div>
      <div className="w-full h-[400px] transition-colors duration-300 bg-white dark:bg-gray-900 rounded-lg">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
      <div className="flex justify-center">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: peakColor }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium transition-colors duration-300">Peak</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: normalColor }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium transition-colors duration-300">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: offPeakColor }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium transition-colors duration-300">Off-Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HConsumption;