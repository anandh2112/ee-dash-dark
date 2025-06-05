import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import moment from "moment-timezone";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatDateForBackend = (date) => {
  return moment(date).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};

const EnergyConsumptionChart = ({ consumptionData, dateRange }) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!consumptionData?.length) return <div className="text-center py-10 dark:text-gray-100">No data available</div>;

  const daysDiff = Math.ceil((dateRange.endDate - dateRange.startDate) / (86400000)) + 1;
  const heatmapData = Array(24).fill().map(() => Array(daysDiff).fill(null));
  
  const dateArray = Array.from({ length: daysDiff }, (_, i) => {
    const d = new Date(dateRange.startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  consumptionData.forEach(({ day, hour, total_consumption }) => {
    const dayIndex = dateArray.indexOf(day);
    if (dayIndex !== -1 && hour >= 0 && hour < 24) {
      heatmapData[hour][dayIndex] = parseFloat(total_consumption);
    }
  });

  const { labels, monthSeparators } = dateArray.reduce((acc, _, i) => {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() + i);
    const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    
    acc.labels.push(formattedDate);
    
    const month = date.getMonth();
    if (month !== acc.currentMonth && acc.currentMonth !== null) {
      acc.monthSeparators.push({ dayIndex: i, monthName: date.toLocaleDateString('en-US', { month: 'long' }) });
    }
    acc.currentMonth = month;
    
    return acc;
  }, { labels: [], monthSeparators: [], currentMonth: null });

  // Only axis, ticks, grid, font, and background change in dark mode; heatmap cell colors remain the same
  const darkBg = "#111827";
  const darkAxis = "#d1d5db";
  const darkTick = "#f3f4f6";
  const darkGrid = "#374151";
  const darkFont = "#f3f4f6";

  return (
    <Plot
      data={[
        {
          z: heatmapData,
          x: labels,
          y: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          type: "heatmap",
          // Use the same colorscale always (no dark mode change)
          colorscale: [
            [0, "#006400"],
            [0.3, "#90EE90"], // light green
            [0.6, "yellow"],
            [1, "red"]
          ],
          zmin: 0,
          zmax: Math.max(...heatmapData.flat().filter(Boolean)) || 1,
          colorbar: {
            title: {
              text: "Energy (kWh)",
              font: { color: isDark ? darkFont : undefined }
            },
            thickness: 15,
            len: 0.8,
            tickfont: { color: isDark ? darkFont : undefined }
          },
          hovertemplate:
            "<b>Date:</b> %{x}<br><b>Hour:</b> %{y}<br><b>Consumption:</b> %{z:.2f} kVAh<extra></extra>"
        }
      ]}
      layout={{
        paper_bgcolor: isDark ? darkBg : "#fff",
        plot_bgcolor: isDark ? darkBg : "#fff",
        font: { color: isDark ? darkFont : "#111" },
        xaxis: {
          title: { text: "Date", font: { color: isDark ? darkFont : "#111" } },
          tickvals: labels,
          ticktext: labels.map((_, i) => {
            const d = new Date(dateRange.startDate);
            d.setDate(d.getDate() + i);
            return (i === 0 || d.getDate() === 15 || i === labels.length - 1) ? labels[i] : d.getDate();
          }),
          tickangle: -45,
          showgrid: true,
          gridcolor: isDark ? darkGrid : "rgba(0,0,0,0.05)",
          linecolor: isDark ? darkAxis : "#111",
          tickfont: { color: isDark ? darkTick : "#111" },
          ...(monthSeparators.length && {
            shapes: monthSeparators.map(({ dayIndex }) => ({
              type: 'line',
              x0: dayIndex - 0.5,
              x1: dayIndex - 0.5,
              y0: -0.5,
              y1: 23.5,
              line: { color: isDark ? "#444" : 'rgba(0,0,0,0.2)', width: 1.5, dash: 'dot' }
            })),
            annotations: monthSeparators.map(({ dayIndex, monthName }) => ({
              x: dayIndex - 0.5,
              y: 1.05,
              yref: 'paper',
              text: monthName,
              showarrow: false,
              font: { size: 11, color: isDark ? darkFont : "#111" },
              xanchor: 'right'
            }))
          })
        },
        yaxis: {
          title: { text: "Hour of Day", font: { color: isDark ? darkFont : "#111" } },
          tickvals: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          ticktext: Array.from({ length: 24 }, (_, i) => i % 4 === 0 ? `${i}:00` : ''),
          showgrid: true,
          gridcolor: isDark ? darkGrid : "rgba(0,0,0,0.05)",
          linecolor: isDark ? darkAxis : "#111",
          tickfont: { color: isDark ? darkTick : "#111" }
        },
        margin: { t: 30, l: 60, r: 60, b: 100 },
        hovermode: 'closest',
      }}
      style={{ width: "100%", minHeight: "500px" }}
      config={{
        displayModeBar: false,
        displaylogo: false,
        modeBarButtonsToRemove: [
          "zoom2d",
          "pan2d",
          "select2d",
          "lasso2d",
          "zoomIn2d",
          "zoomOut2d",
          "autoScale2d",
          "resetScale2d"
        ],
        toImageButtonOptions: {
          format: 'png',
          filename: 'energy_heat_map',
          height: 500,
          width: 1200,
          scale: 2
        }
      }}
      useResizeHandler={true}
    />
  );
};

const EnergyConsumption = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadExcel = () => {
    if (!consumptionData?.length) return;
  
    const headerRow = [
      `Start: ${moment(dateRange.startDate).format("YYYY-MM-DD HH:mm:ss")}`,
      `End: ${moment(dateRange.endDate).format("YYYY-MM-DD HH:mm:ss")}`,
      ""
    ];
  
    const columnHeaders = ["Date", "Hour", "Energy Consumed (kVAh)"];
  
    const formattedData = consumptionData.map((item) => [
      item.day,
      `${item.hour}:00`,
      parseFloat(item.total_consumption),
    ]);
  
    const dataForExcel = [
      headerRow,
      columnHeaders,
      ...formattedData,
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EnergyConsumption");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Heat_Map_${moment(dateRange.startDate).format("YYYY_MM_DD")}_to_${moment(dateRange.endDate).format("YYYY_MM_DD")}.xlsx`);
  };
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentDateTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
        const { data } = await axios.get('https://mw.elementsenergies.com/api/ehconsumption', {
          params: {
            startDate: formatDateForBackend(dateRange.startDate),
            endDate: formatDateForBackend(dateRange.endDate),
            currentDateTime: currentDateTime
          }
        });
        setConsumptionData(data.consumptionData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-7 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold dark:text-gray-100 transition-colors duration-300">Energy Heat Map</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <input
              type="date"
              value={moment(dateRange.startDate).format('YYYY-MM-DD')}
              onChange={(e) => {
                const newStartDate = new Date(e.target.value);
                const maxEndDate = new Date(newStartDate);
                maxEndDate.setDate(maxEndDate.getDate() + 30);

                const adjustedEndDate = dateRange.endDate > maxEndDate ? maxEndDate : dateRange.endDate;

                setDateRange({
                  startDate: newStartDate,
                  endDate: adjustedEndDate,
                });
              }}
              max={moment(dateRange.endDate).format('YYYY-MM-DD')}
              className="pl-2 pr-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md text-sm w-36 transition-colors duration-300"
            />

            <input
              type="date"
              value={moment(dateRange.endDate).format('YYYY-MM-DD')}
              onChange={(e) => {
                const newEndDate = new Date(e.target.value);
                const minStartDate = new Date(newEndDate);
                minStartDate.setDate(minStartDate.getDate() - 30);

                const adjustedStartDate = dateRange.startDate < minStartDate ? minStartDate : dateRange.startDate;

                setDateRange({
                  startDate: adjustedStartDate,
                  endDate: newEndDate,
                });
              }}
              min={moment(dateRange.startDate).format('YYYY-MM-DD')}
              max={moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}
              className="pl-2 pr-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md text-sm w-36 transition-colors duration-300"
            />

            <button
              onClick={handleDownloadExcel}
              className="px-4 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              Download Excel
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10 dark:text-gray-100">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <EnergyConsumptionChart consumptionData={consumptionData} dateRange={dateRange} />
      )}
    </div>
  );
};

export default EnergyConsumption;