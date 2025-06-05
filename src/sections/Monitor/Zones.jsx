import React, { useState, useEffect, useContext } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateContext } from '../../contexts/DateContext';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from "moment-timezone";

if (Exporting && typeof Exporting === 'function') Exporting(Highcharts);
if (ExportData && typeof ExportData === 'function') ExportData(Highcharts);

const zoneMetadata = [
  { id: 1, name: "PLATING", category: "C-49" },
  { id: 2, name: "DIE CASTING + CHINA BUFFING + CNC", category: "C-50" },
  { id: 3, name: "SCOTCH BUFFING", category: "C-50" },
  { id: 4, name: "BUFFING", category: "C-49" },
  { id: 5, name: "SPRAY+EPL-I", category: "C-50" },
  { id: 6, name: "SPRAY+EPL-II", category: "C-49" },
  { id: 7, name: "RUMBLE", category: "C-50" },
  { id: 8, name: "AIR COMPRESSOR", category: "C-49" },
  { id: 9, name: "TERRACE", category: "C-49" },
  { id: 10, name: "TOOL ROOM", category: "C-50" },
  { id: 11, name: "ADMIN BLOCK", category: "C-50" },
];

const Zones = () => {
  const { startDateTime, endDateTime } = useContext(DateContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [zoneData, setZoneData] = useState([]);
  const [selectedView, setSelectedView] = useState(
    new URLSearchParams(location.search).has('zone') ? 'single' : 'all'
  );
  const [selectedZone, setSelectedZone] = useState(
    parseInt(new URLSearchParams(location.search).get('zone')) || 1
  );
  const [isLoading, setIsLoading] = useState(true);
  const [consumptionType, setConsumptionType] = useState('kVAh');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        setIsLoading(true);

        const endpoint = consumptionType === 'kWh' ? 'zconsumption' : 'zkVAhconsumption';
        const zones = selectedView === 'single' ? [selectedZone] : zoneMetadata.map((zone) => zone.id);

        const consumptionResponses = await Promise.all(
          zones.map((zone) =>
            axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
              params: { startDateTime, endDateTime, zone },
            })
          )
        );

        const formattedData = zones.map((zoneId, index) => {
          const metadata = zoneMetadata.find((z) => z.id === zoneId);
          const consumptionData = consumptionResponses[index].data.consumptionData || [];
          const parsedData = consumptionData.map((item) => ({
            hour: item.hour,
            value: parseFloat(
              consumptionType === 'kWh' ? item.kWh_difference || 0 : item.kVAh_difference || 0
            ),
          }));

          return {
            zoneId,
            zoneName: metadata?.name || `Zone ${zoneId}`,
            category: metadata?.category || '',
            data: parsedData,
          };
        });

        setZoneData(formattedData);
      } catch (error) {
        console.error('Error fetching zone data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchZoneData();
  }, [startDateTime, endDateTime, consumptionType, selectedView, selectedZone]);

  const downloadExcel = () => {
    if (!zoneData?.length) return;
    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, "", "", ""]; 
    const columnHeaders = ["Date", "Time", ...zoneData.map((zone) => `${zone.zoneName} (${zone.category}) - ${consumptionType}`)];
    const uniqueTimes = [
      ...new Set(
        zoneData.flatMap((zone) =>
          zone.data.map((item) => moment(item.hour).format("YYYY-MM-DD HH:mm"))
        )
      ),
    ].sort(); 
    const formattedData = uniqueTimes.map((time) => {
      const [date, hour] = time.split(" ");
      const row = [date, hour];

      zoneData.forEach((zone) => {
        const zoneDataForTime = zone.data.find(
          (item) => moment(item.hour).format("YYYY-MM-DD HH:mm") === time
        );
        row.push(zoneDataForTime ? zoneDataForTime.value : 0);
      });

      return row;
    });

    const dataForExcel = [headerRow, columnHeaders, ...formattedData];

    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zones Consumption");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileName = `Zones_Consumption_${startDateTime}_to_${endDateTime}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), fileName);
  };

  // CHART COLOR SETTINGS FOR DARK MODE
  const chartBg = isDark ? "#1F2937" : "#fff";
  const chartText = isDark ? "#f1f5f9" : "#374151";
  const axisLineColor = isDark ? "#374151" : "#e5e7eb";
  const legendStyle = isDark
    ? { color: "#ffffff" } // White text in dark mode
    : { color: "#374151" }; // Default dark gray in light mode (Tailwind gray-700)

  const legendHoverStyle = isDark
    ? { color: "#f3f4f6" } // Slightly lighter white on hover (Tailwind gray-100)
    : { color: "#1f2937" }; // Tailwind gray-800 for hover in light

  const legendHiddenStyle = isDark
    ? { color: "#6b7280" } // Tailwind gray-500 in dark mode
    : { color: "#ccc" }; // Light gray for hidden in light mode


  const chartOptionsAllZones = {
    chart: {
      type: 'column',
      backgroundColor: chartBg,
      spacingTop: 40,
      style: { color: chartText }
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [
        ...new Set(zoneData.flatMap((zone) => zone.data.map((item) => item.hour))),
      ].map((hour) => hour.substring(11, 16)),
      title: { text: 'Time', style: { color: chartText } },
      gridLineWidth: 0, 
      labels: { style: { color: chartText } },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})`, style: { color: chartText } },
      gridLineWidth: 0, 
      labels: { style: { color: chartText } },
    },
    tooltip: {
      pointFormat:
        '{series.name}: {point.y} ' +
        consumptionType +
        '<br/>Total: {point.stackTotal} ' +
        consumptionType,
      backgroundColor: chartBg,
      style: { color: chartText },
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderWidth: 0,
        dataLabels: {
          enabled: false, 
        },
      },
    },
    series: zoneData.map((zone) => ({
      name: `${zone.zoneName} (${zone.category})`, 
      data: [
        ...new Set(zoneData.flatMap((zone) => zone.data.map((item) => item.hour))),
      ].map((hour) => zone.data.find((item) => item.hour === hour)?.value || 0),
    })),
    legend: {
      itemStyle: legendStyle,
      itemHoverStyle: legendHoverStyle,
      itemHiddenStyle: legendHiddenStyle,
      backgroundColor: chartBg,
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
  };

  const chartOptionsSingleZone = (zone) => ({
    chart: { type: 'column', backgroundColor: chartBg, style: { color: chartText } },
    title: {
      text: `${zone.zoneName} <span style="font-size: 12px; font-weight: normal; color: gray;">(${zone.category})</span> - Hourly Consumption`,
      useHTML: true,
      style: { color: chartText }
    },   
    xAxis: {
      categories: zone.data.map((item) => item.hour.substring(11, 16)),
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})`, style: { color: chartText } },
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
    },
    series: [
      {
        name: zone.zoneName,
        data: zone.data.map((item) => item.value),
      },
    ],
    plotOptions: {
      column: {
        borderWidth: 0,
        dataLabels: {
          enabled: false,
        },
      },
    },
    legend: {
      itemStyle: legendStyle,
      itemHoverStyle: legendHoverStyle,
      itemHiddenStyle: legendHiddenStyle,
      backgroundColor: chartBg,
    },
    credits: { enabled: false },
    exporting: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      valueSuffix: ` ${consumptionType}`,
      style: { zIndex: 1, color: chartText },
      backgroundColor: chartBg,
    },
  });

  const handleViewChange = (view) => {
    setSelectedView(view);
    const params = new URLSearchParams();
    if (view === 'single') params.set('zone', selectedZone);
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mb-6 flex justify-between items-center">
        <div className='flex gap-2'>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => handleViewChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors duration-300 ${
              selectedView === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => handleViewChange('single')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition-colors duration-300 ${
              selectedView === 'single' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Select Zone
          </button>
        </div>
        {selectedView === 'single' && (
         <select
         value={selectedZone}
         onChange={(e) => {
           const zoneId = parseInt(e.target.value);
           setSelectedZone(zoneId);
           navigate(`?zone=${zoneId}`, { replace: true });
         }}
         className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
       >
         {zoneMetadata.map((zone) => (
           <option key={zone.id} value={zone.id}>
             {zone.name} ({zone.category})
           </option>
         ))}
       </select>
        )}
        </div>
        <div className='flex flex-end space-x-3'>
          <div className="flex bg-white dark:bg-gray-800 rounded-full p-1 space-x-1 transition-colors duration-300">
            <button
              onClick={() => setConsumptionType('kVAh')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${
                consumptionType === 'kVAh' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              kVAh
            </button>
            <button
              onClick={() => setConsumptionType('kWh')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${
                consumptionType === 'kWh' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              kWh
            </button>
          </div>
          <button
              onClick={downloadExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              Download Excel
            </button>
          </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm flex justify-center items-center h-64 transition-colors duration-300">
          <span className="text-gray-500 dark:text-gray-300">Loading data...</span>
        </div>
      ) : selectedView === 'all' ? (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-md shadow-sm transition-colors duration-300">
          <HighchartsReact highcharts={Highcharts} options={chartOptionsAllZones} />
        </div>
      ) : (
        zoneData
          .filter((zone) => zone.zoneId === selectedZone)
          .map((zone) => (
            <div key={zone.zoneId} className="bg-white dark:bg-gray-800 p-5 rounded-md shadow-sm transition-colors duration-300">
              <HighchartsReact highcharts={Highcharts} options={chartOptionsSingleZone(zone)} />
            </div>
          ))
      )}
    </div>
  );
};

export default Zones;