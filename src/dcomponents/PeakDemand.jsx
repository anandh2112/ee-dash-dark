import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import moment from "moment-timezone";
import { DateContext } from "../contexts/DateContext";
import * as XLSX from 'xlsx'; 

const PeakDemand = () => {
  const { startDateTime, endDateTime } = useContext(DateContext); 
  const [peakDemandData, setPeakDemandData] = useState([]);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fetchPeakDemandData = async (startDateTime, endDateTime) => {
    try {
      const response = await axios.get("https://mw.elementsenergies.com/api/opeakdemand", {
        params: {
          startDateTime,
          endDateTime,
        },
      });
      setPeakDemandData(response.data.peakDemandData);
    } catch (error) {
      console.error("Error fetching peak demand data:", error);
    }
  };

  useEffect(() => {
    if (startDateTime && endDateTime) {
      fetchPeakDemandData(startDateTime, endDateTime);
    }
  }, [startDateTime, endDateTime]);

  const downloadExcel = () => {
    if (!peakDemandData || peakDemandData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, ""]; 
    const columnHeaders = ["Date", "Time", "Peak Demand (kVA)"];
    const formattedData = peakDemandData.map((item) => [
      moment(item.minute).format("YYYY-MM-DD"), 
      moment(item.minute).format("HH:mm"), 
      parseFloat(item.total_kVA), 
    ]);
    const dataForExcel = [headerRow, columnHeaders, ...formattedData];
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Peak Demand Data");
    XLSX.writeFile(workbook, `Peak_Demand_${startDateTime}_to_${endDateTime}.xlsx`);
  };

  // Colors for dark and light mode
  const chartBg = isDark ? "#18181b" : "#fff";
  const chartText = isDark ? "#f1f5f9" : "#374151";
  const gridLineColor = isDark ? "#374151" : "#e5e7eb";
  const axisLineColor = gridLineColor;
  const tooltipBg = isDark ? "#18181b" : "#fff";
  const tooltipText = isDark ? "#f1f5f9" : "#000";
  const plotLineLabelColor = isDark ? "#f87171" : "red";
  const plotLineColor = isDark ? "#f87171" : "red";

  const options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      style: {
        color: chartText,
      },
    },
    title: {
      text: null,
      align: "center",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: chartText,
      },
    },
    xAxis: {
      categories: peakDemandData.map((data) => moment(data.minute).format("HH:mm")),
      title: {
        text: "Hour",
        style: {
          fontWeight: "bold",
          color: chartText,
        },
      },
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
      lineColor: axisLineColor,
      tickColor: axisLineColor,
    },
    yAxis: {
      min: 0,
      max: 800,
      title: {
        text: "Peak Demand (kVA)",
        style: {
          fontWeight: "bold",
          color: chartText,
        },
      },
      gridLineWidth: 0,
      labels: { style: { color: chartText } },
      plotLines: [
        {
          value: 745,
          color: plotLineColor,
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Upper Ceiling (745 kVA)",
            align: "right",
            x: -30,
            style: {
              color: plotLineLabelColor,
              fontWeight: "bold",
            },
          },
        },
        {
          value: 596,
          color: plotLineColor,
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Lower Ceiling (596 kVA)",
            align: "right",
            x: -10,
            style: {
              color: plotLineLabelColor,
              fontWeight: "bold",
            },
          },
        },
      ],
    },
    tooltip: {
      shared: true,
      backgroundColor: tooltipBg,
      style: {
        color: tooltipText,
      },
      borderRadius: 10,
      formatter: function () {
        const point = this.points[0];
        const time = point.point.time.split(" ")[1];
        return `<b>Time:</b> ${time}<br/><b>Value:</b> ${point.y} kVA`;
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: false,
        },
      },
    },
    series: [
      {
        name: "Apparent Power",
        data: peakDemandData.map((data) => ({
          y: parseFloat(data.total_kVA),
          time: data.minute,
        })),
        color: isDark ? "#38bdf8" : "#1f77b4", // cyan-400 for dark, original for light
      },
    ],
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      itemStyle: { color: chartText }
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 768,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 w-full h-full transition-colors duration-300">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold dark:text-gray-100 transition-colors duration-300">Peak Demand</h2>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
        >
          Download Excel
        </button>
      </div>
      <div className="w-full h-[400px] -translate-x-4">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default PeakDemand;