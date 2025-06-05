import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaArrowRight, FaBell, FaCalendarAlt } from 'react-icons/fa';
import moment from 'moment-timezone';
import Cookies from 'js-cookie';
import { DateContext } from '../contexts/DateContext';
import userprofile from '../components/userprofile.png';
import { useTheme } from './Themecontext';
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggleSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center transition-all duration-300 px-2 py-1
        rounded-full focus:outline-none group
        ${theme === "light" ? "bg-yellow-100" : "bg-slate-800"}
        relative w-16 h-8 ml-2
      `}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      style={{ minWidth: "64px", minHeight: "32px" }}
    >
      <span className={`
        absolute left-1 top-1
        w-6 h-6 rounded-full flex items-center justify-center
        transition-all duration-300
        z-10
        ${theme === "light"
          ? "translate-x-0 bg-yellow-400"
          : "translate-x-8 bg-blue-500"
        }
      `}
        style={{
          transform: theme === "light" ? "translateX(0)" : "translateX(32px)"
        }}
      >
        {theme === "light" ? (
          <FiSun className="text-white text-xl" />
        ) : (
          <FiMoon className="text-white text-xl" />
        )}
      </span>
    </button>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { startDateTime, endDateTime, handleDateChange } = useContext(DateContext);
  const [tempStartDateTime, setTempStartDateTime] = useState(startDateTime);
  const [tempEndDateTime, setTempEndDateTime] = useState(endDateTime);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);

  // Only needed to re-render on theme change, don't use otherwise
  useTheme();

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const datePickerRef = useRef(null);

  const handleStartChange = (e) => {
    setTempStartDateTime(e.target.value);
  };

  const handleEndChange = (e) => {
    setTempEndDateTime(e.target.value);
  };

  const closeStartPicker = () => {
    setIsStartPickerOpen(false);
  };

  const closeEndPicker = () => {
    setIsEndPickerOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !profileRef.current?.contains(event.target) &&
        !notificationRef.current?.contains(event.target) &&
        !datePickerRef.current?.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`https://mw.elementsenergies.com/api/apd?startDateTime=${startDateTime}&endDateTime=${endDateTime}`);
      const data = await response.json();

      if (data?.peakDemandAboveThreshold) {
        const formatted = data.peakDemandAboveThreshold.map((entry) => ({
          id: entry.id,
          text: `Apparent Power → ${entry.total_kVA} kVA ${moment(entry.minute).format("HH:mm")} crossing 596 → Lower Ceiling`,
          read: false,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleSubmit = () => {
    handleDateChange({
      startDateTime: tempStartDateTime,
      endDateTime: tempEndDateTime,
    });
    fetchNotifications();
  };

  const handleLogout = () => {
    Cookies.remove('auth', { domain: '.elementsenergies.com', path: '/' });
    window.location.href = 'https://elementsenergies.com/login';
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full h-full flex flex-end p-3 justify-end space-x-3 items-center shadow-md transition-all duration-300">
      <div className="custom-dsm:hidden space-x-3">
        <label className="text-sm text-gray-600 dark:text-gray-300">Start</label>
        <input
          type="datetime-local"
          value={moment(tempStartDateTime).format('YYYY-MM-DDTHH:mm')}
          onChange={(e) => setTempStartDateTime(e.target.value)}
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 transition-all duration-300"
        />
      </div>
      <div className="custom-dsm:flex items-center hidden space-x-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">Start</label>
        <button
          onClick={() => setIsStartPickerOpen(true)}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
        >
          <FaCalendarAlt className="text-gray-600 dark:text-gray-200" />
        </button>
      </div>
      {isStartPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-md">
            <label className="text-sm text-gray-600 dark:text-gray-300 block">Select Start Date</label>
            <input
              type="datetime-local"
              value={tempStartDateTime}
              onChange={handleStartChange}
              className="border rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 transition-all duration-300"
            />
            <button
              onClick={closeStartPicker}
              className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="custom-dsm:hidden space-x-3">
        <label className="text-sm text-gray-600 dark:text-gray-300">End</label>
        <input
          type="datetime-local"
          value={moment(tempEndDateTime).format('YYYY-MM-DDTHH:mm')}
          onChange={(e) => setTempEndDateTime(e.target.value)}
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 transition-all duration-300"
        />
      </div>
      <div className="custom-dsm:flex items-center hidden space-x-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">End</label>
        <button
          onClick={() => setIsEndPickerOpen(true)}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
        >
          <FaCalendarAlt className="text-gray-600 dark:text-gray-200" />
        </button>
      </div>
      {isEndPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-md">
            <label className="text-sm text-gray-600 dark:text-gray-300 block">Select End Date</label>
            <input
              type="datetime-local"
              value={tempEndDateTime}
              onChange={handleEndChange}
              className="border rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 transition-all duration-300"
            />
            <button
              onClick={closeEndPicker}
              className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-all duration-300"
      >
        <FaArrowRight />
      </button>
      <div ref={notificationRef} className="relative">
        <div onClick={() => {
          setShowNotifications(!showNotifications);
          setShowProfileDropdown(false);
        }} className="cursor-pointer relative">
          <FaBell className="text-xl text-gray-600 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </div>

        {showNotifications && (
          <div className="absolute right-[-60px] mt-4 w-72 bg-white dark:bg-gray-900 shadow-lg rounded-lg py-3 z-50">
            <p className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</p>
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
              {notifications.map((notif) => (
                <p
                  key={notif.id}
                  className={`px-4 py-2 text-sm cursor-pointer ${
                    notif.read
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-black dark:text-white font-medium"
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  {notif.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      <div ref={profileRef} className="relative">
        <div onClick={() => {
          setShowProfileDropdown(!showProfileDropdown);
          setShowNotifications(false);
        }} className="cursor-pointer">
          <img src={userprofile} alt="User" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 transition-all duration-300" />
        </div>
        {showProfileDropdown && (
          <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 shadow-lg rounded-lg z-50 py-4">
            <div className="flex flex-col items-center">
              <img src={userprofile} alt="Profile" className="w-14 h-14 rounded-full mb-2 border border-gray-200 dark:border-gray-700 transition-all duration-300" />
              <p className="text-gray-800 dark:text-gray-100 font-medium">Hi, Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{moment().tz('Asia/Kolkata').format('DD MMM, HH:mm')}</p>
            </div>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <p className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">Help</p>
            <p className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={handleLogout}>
              Log Out
            </p>
          </div>
        )}
      </div>
      {/* THEME TOGGLE SWITCH (placed after profile icon) */}
      <ThemeToggleSwitch />
    </div>
  );
};

export default Navbar;