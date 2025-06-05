import React, { useState, useEffect, useContext } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateContext } from '../contexts/DateContext';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment-timezone';

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

const PeakAnalysis = () => {
  const { startDateTime, endDateTime } = useContext(DateContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [peakData, setPeakData] = useState([]);
  const [selectedView, setSelectedView] = useState(
    new URLSearchParams(location.search).has('zone') ? 'single' : 'all'
  );
  const [selectedZone, setSelectedZone] = useState(
    parseInt(new URLSearchParams(location.search).get('zone')) || 1
  );
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchPeakData = async () => {
      try {
        setIsLoading(true);

        let formattedData = [];

        if (selectedView === 'single') {
          const response = await axios.get(`https://mw.elementsenergies.com/api/zkVA`, {
            params: { startDateTime, endDateTime, zone: selectedZone },
          });
          const meta = zoneMetadata.find((z) => z.id === selectedZone);
          const data = response.data?.kvaData || [];
          formattedData = [{
            zoneId: selectedZone,
            zoneName: meta?.name || `Zone ${selectedZone}`,
            category: meta?.category || '',
            data: data.map((item) => ({
              hour: item.minute,
              value: parseFloat(item.total_kVA || 0),
            })),
          }];
        } else { 
          const response = await axios.get(`https://mw.elementsenergies.com/api/zkVAaz`, {
            params: { startDateTime, endDateTime },
          });

          const allZonesRawData = response.data?.kvaAllZonesData || [];

          const groupedByZone = allZonesRawData.reduce((acc, item) => {
            const zoneId = item.zone_id;
            if (!acc[zoneId]) {
              acc[zoneId] = [];
            }
            acc[zoneId].push(item);
            return acc;
          }, {});

          formattedData = Object.keys(groupedByZone).map(zoneIdStr => {
            const zoneId = parseInt(zoneIdStr);
            const meta = zoneMetadata.find(z => z.id === zoneId);
            return {
              zoneId: zoneId,
              zoneName: meta?.name || `Zone ${zoneId}`,
              category: meta?.category || '',
              data: groupedByZone[zoneIdStr].map(item => ({
                hour: item.minute,
                value: parseFloat(item.total_kVA || 0),
              })),
            };
          }).sort((a,b) => a.zoneId - b.zoneId);
        }

        setPeakData(formattedData);
      } catch (err) {
        console.error("Error fetching peak data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeakData();
  }, [startDateTime, endDateTime, selectedView, selectedZone]);

  // DARK MODE CHART COLORS
  const chartBg = isDark ? "#1F2937" : "#fff";
  const chartText = isDark ? "#f1f5f9" : "#374151";
  const axisLineColor = isDark ? "#374151" : "#e5e7eb";
  const tooltipBg = isDark ? "#18181b" : "#fff";
  const tooltipText = isDark ? "#f1f5f9" : "#18181b";
  const gridLineColor = axisLineColor;
  const legendStyle = isDark
    ? { color: "#ffffff" } // White text in dark mode
    : { color: "#374151" }; // Default dark gray in light mode (Tailwind gray-700)

  const legendHoverStyle = isDark
    ? { color: "#f3f4f6" } // Slightly lighter white on hover (Tailwind gray-100)
    : { color: "#1f2937" }; // Tailwind gray-800 for hover in light

  const legendHiddenStyle = isDark
    ? { color: "#6b7280" } // Tailwind gray-500 in dark mode
    : { color: "#ccc" }; // Light gray for hidden in light mode

  const uniqueTimesCategories = [
    ...new Set(peakData.flatMap((zone) => zone.data.map((item) => item.hour))),
  ].sort().map((hour) => hour.substring(11, 16));

  const chartOptionsAllZones = {
    chart: {
      type: 'line',
      backgroundColor: chartBg,
      spacingTop: 40,
      style: { color: chartText }
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: uniqueTimesCategories, 
      title: { text: 'Time', style: { color: chartText } },
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: {
      min: 0,
      title: { text: 'Total kVA per Minute', style: { color: chartText } },
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
    },
    tooltip: {
      shared: true,
      valueSuffix: ' kVA',
      backgroundColor: tooltipBg,
      style: { color: tooltipText },
      borderRadius: 10,
    },
    series: peakData.map((zone) => ({
      name: `${zone.zoneName} (${zone.category})`,
      data: uniqueTimesCategories.map((hourCategory) => {
        const fullHourTimestamp = peakData.flatMap(z => z.data)
                                          .find(item => item.hour.substring(11,16) === hourCategory)?.hour;
        const dataPoint = zone.data.find(item => item.hour === fullHourTimestamp);
        return dataPoint ? dataPoint.value : 0;
      }),
      marker: {
        enabled: false,
        states: { hover: { enabled: true } },
      },
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
    chart: { type: 'line', backgroundColor: chartBg, style: { color: chartText } },
    title: {
      text: `${zone.zoneName} <span style="font-size: 12px; font-weight: normal; color: gray;">(${zone.category})</span> - Peak Demand`,
      useHTML: true,
      style: { color: chartText }
    }, 
    xAxis: {
      categories: zone.data.map((d) => d.hour.substring(11, 16)),
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: {
      title: { text: 'Total kVA per Minute', style: { color: chartText } },
      min: 0,
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
    },
    series: [
      {
        name: zone.zoneName,
        data: zone.data.map((d) => ({
          y: d.value,
          time: d.hour,
        })),
        marker: {
          enabled: false,
          states: { hover: { enabled: true } },
        },
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: tooltipBg,
      style: { color: tooltipText },
      borderRadius: 10,
      formatter: function () {
        const point = this.points[0];
        const time = point.point.time.split(" ")[1];
        return `<b>Time:</b> ${time}<br/><b>Value:</b> ${point.y} kVA`;
      },
    },
    legend: {
      itemStyle: legendStyle,
      itemHoverStyle: legendHoverStyle,
      itemHiddenStyle: legendHiddenStyle,
      backgroundColor: chartBg,
    },
    credits: { enabled: false },
    exporting: { enabled: false },
  });

  const handleDownloadExcel = () => {
    if (!peakData || peakData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (selectedView === 'single') {
      const currentZoneData = peakData.find(zone => zone.zoneId === selectedZone);
      if (!currentZoneData || currentZoneData.data.length === 0) {
        alert("No data available for the selected single zone to download.");
        return;
      }

      const zoneName = currentZoneData.zoneName;
      const category = currentZoneData.category;

      const headerRow1 = [`Zone: ${zoneName} (${category})`, "", ""];
      const headerRow2 = [`Start Date/Time: ${startDateTime}`, `End Date/Time: ${endDateTime}`, ""];
      const columnHeaders = ["Date", "Time", "Total kVA"];

      const formattedData = currentZoneData.data.map((item) => [
        moment(item.hour).format("YYYY-MM-DD"),
        moment(item.hour).format("HH:mm:ss"),
        item.value,
      ]);

      const dataForExcel = [headerRow1, headerRow2, [], columnHeaders, ...formattedData];
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

      let sheetNameForExcel;
      if (zoneName === "DIE CASTING + CHINA BUFFING + CNC") {
        sheetNameForExcel = "DC+CB+CNC kVA Data";
      } else {
        sheetNameForExcel = `${zoneName} kVA Data`;
        if (sheetNameForExcel.length > 31) {
          sheetNameForExcel = sheetNameForExcel.substring(0, 31);
        }
      }
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetNameForExcel);

      const filename = `${zoneName.replace(/[\s\+]/g, '_')}_kVA_Data.xlsx`;
      XLSX.writeFile(workbook, filename);

    } else { 
      const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`];
      const columnHeaders = ["Date", "Time", ...peakData.map((zone) => `${zone.zoneName} (${zone.category}) - kVA`)];

      const uniqueTimes = [
        ...new Set(
          peakData.flatMap((zone) =>
            zone.data.map((item) => moment(item.hour).format("YYYY-MM-DD HH:mm"))
          )
        ),
      ].sort();

      const formattedData = uniqueTimes.map((time) => {
        const [date, hour] = time.split(" ");
        const row = [date, hour];

        peakData.forEach((zone) => {
          const zoneDataForTime = zone.data.find(
            (item) => moment(item.hour).format("YYYY-MM-DD HH:mm") === time
          );
          row.push(zoneDataForTime ? zoneDataForTime.value : 0);
        });
        return row;
      });

      const dataForExcel = [headerRow, [], columnHeaders, ...formattedData];
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

      XLSX.utils.book_append_sheet(workbook, worksheet, "All Zones Peak kVA");

      const fileName = `All_Zones_Peak_kVA_data.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };

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
          <button
            onClick={handleDownloadExcel}
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
        peakData
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

export default PeakAnalysis;