import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import { DateContext } from "../contexts/DateContext";

const meterNames = [
  { id: 1, name: "PLATING", category: "C-49" },
  { id: 2, name: "DIE CASTING + CHINA BUFFING + CNC", category: "C-50" },
  { id: 3, name: "SCOTCH BUFFING", category: "C-50" },
  { id: 4, name: "BUFFING", category: "C-49" },
  { id: 5, name: "SPRAY+EPL-I", category: "C-49" },
  { id: 6, name: "SPRAY+ EPL-II", category: "C-50" },
  { id: 7, name: "RUMBLE", category: "C-50" },
  { id: 8, name: "AIR COMPRESSOR", category: "C-49" },
  { id: 9, name: "TERRACE", category: "C-49" },
  { id: 10, name: "TOOL ROOM", category: "C-50" },
  { id: 11, name: "ADMIN BLOCK", category: "C-50" },
];

const getMeterName = (id) => {
  const meter = meterNames.find((meter) => meter.id === id);
  return meter ? meter.name : "Unknown";
};

const EnergySources = () => {
  const { selectedDate: globalSelectedDate, startDateTime: globalStartDateTime, endDateTime: globalEndDateTime } = useContext(DateContext); 
  const [zones, setZones] = useState([]);
  const [highZone, setHighZone] = useState({ meter_id: "N/A", consumption: 0 });
  const [lowZone, setLowZone] = useState({ meter_id: "N/A", consumption: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    // Listen for dark mode changes and update chart
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {}, [globalSelectedDate]);

  const fetchConsumptionData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://mw.elementsenergies.com/api/hlcons", {
        params: {
          startDateTime: globalStartDateTime,
          endDateTime: globalEndDateTime,
        },
      });

      if (response.data) {
        setZones(response.data.consumptionData);
        setHighZone(response.data.highZone);
        setLowZone(response.data.lowZone);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsumptionData(); 
  }, [globalStartDateTime, globalEndDateTime]);

  const totalConsumption = zones.reduce((sum, zone) => sum + parseFloat(zone.consumption), 0);

  const otherZonesConsumption = (totalConsumption - (highZone.consumption + lowZone.consumption)).toFixed(1);

  // DARK MODE COLORS
  const chartBg = isDark ? "#18181b" : "#fff";
  const textColor = isDark ? "#f1f5f9" : "#374151";
  const axisLineColor = isDark ? "#374151" : "#e5e7eb";
  const tooltipBg = isDark ? "#18181b" : "#fff";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";
  const tooltipText = isDark ? "#f1f5f9" : "#18181b";
  const legendText = textColor;
  const gridLineColor = axisLineColor;

  // Set zone colors and legend text colors based on dark mode
  const highZoneColor = isDark ? "#FF0000" : "rgb(185, 28, 28)";
  const lowZoneColor = isDark ? "rgb(90,204,94)" : "rgb(22, 163, 74)";
  const highZoneLegendStyle = isDark ? { color: "#FF0000" } : { color: "rgb(185, 28, 28)" };
  const lowZoneLegendStyle = isDark ? { color: "rgb(90,204,94)" } : { color: "rgb(22, 163, 74)" };
  const otherZonesLegendStyle = isDark
    ? { color: "rgba(59,130,246,0.7)" }
    : { color: "rgba(59,130,246,1)" };

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      height: "300px",
      style: { color: textColor }
    },
    title: { text: "" },
    xAxis: { 
      categories: ["Total Consumption"],
      labels: { style: { color: textColor } },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: { 
      title: { text: "Consumption (kVAh)", style: { color: textColor } },
      labels: { style: { color: textColor } },
      gridLineColor: gridLineColor,
    },
    plotOptions: {
      series: {
        stacking: "normal",
        borderWidth: 0,
        dataLabels: { enabled: false },
      },
    },
    tooltip: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      style: { color: tooltipText },
      formatter: function () {
        if (this.series.name === "Other Zones") {
          return `<b>Other Zones:</b> ${otherZonesConsumption} kVAh`;
        }
        return `<b>${this.series.name}:</b> ${this.y} kVAh`;
      },
    },
    series: [
      {
        name: `High Zone (${getMeterName(highZone.meter_id)})`,
        data: [highZone.consumption],
        color: highZoneColor,
        // Custom legend color
        legendIndex: 0,
      },
      {
        name: "Other Zones",
        data: [parseFloat(otherZonesConsumption)],
        color: isDark ? "rgba(59,130,246,0.2)" : "rgba(96, 165, 250, 0.2)",
        showInLegend: true,
        legendIndex: 1,
      },
      {
        name: `Low Zone (${getMeterName(lowZone.meter_id)})`,
        data: [lowZone.consumption],
        color: lowZoneColor,
        legendIndex: 2,
      },
    ],
    legend: { 
      enabled: true,
      useHTML: true,
      labelFormatter: function() {
        // Color the legend text for each zone
        if (this.name.startsWith("High Zone")) {
          return `<span style="color:${highZoneColor}">${this.name}</span>`;
        }
        if (this.name.startsWith("Low Zone")) {
          return `<span style="color:${lowZoneColor}">${this.name}</span>`;
        }
        if (this.name.startsWith("Other Zones")) {
          return `<span style="color:${isDark ? "rgba(59,130,246,0.7)" : "rgba(59,130,246,1)"}">${this.name}</span>`;
        }
        return `<span style="color:${legendText}">${this.name}</span>`;
      },
      itemStyle: { color: legendText },
    },
    credits: { enabled: false },
    exporting: {
      enabled: false,
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-all duration-300 xl:h-[100%] p-7 rounded-lg shadow-md flex flex-col space-y-7">
      <h2 className="text-xl font-semibold dark:text-gray-100">Facility Overview</h2>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-100">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="xl:space-y-5 lg:space-y-4 md:space-y-4">
              <div className="border-2 border-red-500 p-3 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors duration-300">
                <h3 className="md:text-sm l:text-md xl:text-md font-semibold text-red-700 dark:text-red-500">High Zone</h3>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 dark:text-gray-100 text-sm mt-2">Zone: {getMeterName(highZone.meter_id)}</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 dark:text-gray-100 text-sm mt-1">{highZone.consumption} kVAh</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-sm text-gray-600 dark:text-gray-400 mt-1">{((highZone.consumption / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
              <div className="border-2 border-green-500 p-3 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors duration-300">
                <h3 className="md:text-sm l:text-md xl:text-md font-semibold text-green-700 dark:text-green-500">Low Zone</h3>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 dark:text-gray-100 text text-sm mt-2">Zone: {getMeterName(lowZone.meter_id)}</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 dark:text-gray-100 text text-sm mt-1">{lowZone.consumption} kVAh</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-sm text-gray-600 dark:text-gray-400 mt-1">{((lowZone.consumption / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
              <div className="border-2 border-blue-500 p-3 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors duration-300">
                <h3 className="md:text-sm l:text-md xl:text-md font-semibold text-blue-700 dark:text-blue-500">Other Zones</h3>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 dark:text-gray-100 text text-sm mt-1">{otherZonesConsumption} kVAh</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-sm text-gray-600 dark:text-gray-400 mt-1">{((parseFloat(otherZonesConsumption) / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center mt-6 pt-8">
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergySources;