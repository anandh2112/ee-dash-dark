import React, { useContext, useState, useEffect } from "react";
import { DateContext } from "../contexts/DateContext";
import axios from "axios";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from "moment-timezone";

const meterToZoneMap = {
  1: { name: "PLATING", category: "C-49" },
  2: { name: "DC+CB+CNC", category: "C-50" },
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

const MeterReading = () => {
  const { startDateTime, endDateTime } = useContext(DateContext);
  const [meterData, setMeterData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      if (startDateTime && endDateTime) {
        try {
          const response = await axios.get('https://mw.elementsenergies.com/api/meterreading', {
            params: {
              startDateTime: startDateTime,
              endDateTime: endDateTime,
            },
          });
  
          setMeterData(response.data.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
  
    fetchData();
  }, [startDateTime, endDateTime]);

  const downloadExcel = () => {
    if (!meterData.length) return;
  
    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, "", "", ""];
    const columnHeaders = ["Zone", "Timestamp", "kVAh", "kWh"];
    const rows = [];
  
    meterData.forEach((zone) => {
      const zoneName = meterToZoneMap[zone.zone]?.name || "Unknown";
      const category = meterToZoneMap[zone.zone]?.category || "Unknown";
      const zoneDisplay = `${zoneName} (${category})`; 
  
      rows.push([
        zoneDisplay,
        `Start: ${zone.min?.timestamp || "N/A"}`,
        zone.min?.kVAh ?? "N/A",
        zone.min?.kWh ?? "N/A",
      ]);
      rows.push([
        "",
        `End: ${zone.max?.timestamp || "N/A"}`,
        zone.max?.kVAh ?? "N/A",
        zone.max?.kWh ?? "N/A",
      ]);
    });
  
    const dataForExcel = [headerRow, columnHeaders, ...rows];
  
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meter Readings");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileName = `Meter_Readings_${moment(startDateTime).format("YYYYMMDD_HHmm")}_to_${moment(endDateTime).format("YYYYMMDD_HHmm")}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), fileName);
  };
  

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-semibold dark:text-gray-100 transition-colors duration-300">Meter Reading</h2>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Download Excel
        </button>
      </div>
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm transition-colors duration-300">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center w-[180px] dark:text-gray-100">Zone</th>
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">Timestamp</th>
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">kVAh</th>
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">kWh</th>
          </tr>
        </thead>
        <tbody>
          {meterData.map((zoneData, index) => (
            <React.Fragment key={index}>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                <td rowSpan={2} className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center align-middle">
                  <div className="font-medium dark:text-gray-100">{meterToZoneMap[zoneData.zone]?.name || "Unknown"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{meterToZoneMap[zoneData.zone]?.category || "Unknown"}</div>
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center font-semibold dark:text-gray-100">
                  Start D&T: {zoneData.min?.timestamp || "N/A"}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">
                {zoneData.min?.kVAh ?? "N/A"}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">
                  {zoneData.min?.kWh || "N/A"}
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center font-semibold dark:text-gray-100">
                  End D&T: {zoneData.max?.timestamp || "N/A"}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">
                  {zoneData.max?.kVAh || "N/A"}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-gray-100">
                  {zoneData.max?.kWh || "N/A"}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeterReading;