import React, { useState, useEffect, useRef, useContext, forwardRef } from 'react';
import { FaArrowRight, FaBell, FaCalendar } from 'react-icons/fa';
import moment from 'moment-timezone';
import Cookies from 'js-cookie';
import { DateContext } from '../contexts/DateContext';
import userprofile from '../components/userprofile.png';
import { useTheme } from './Themecontext';
import { FiMoon, FiSun } from "react-icons/fi";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomSelect from './CustomSelect'; // Import the custom select

const ThemeToggleSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center transition-all duration-300 px-2 py-1
        rounded-full focus:outline-none group
        ${theme === "light" ? "bg-gray-200" : "bg-gray-700"}
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
          ? "translate-x-0 bg-[#FFA500]"
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

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="flex items-center border rounded text-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 w-32 pl-2 pr-2 cursor-pointer"
  >
    <span className="flex-grow">{value}</span>
    <FaCalendar className="text-gray-600 dark:text-white text-sm" />
  </div>
));

const hourOptions = [...Array(24).keys()].map((h) => ({
  value: String(h).padStart(2, '0'),
  label: String(h).padStart(2, '0')
}));
const minuteOptions = [...Array(60).keys()].map((m) => ({
  value: String(m).padStart(2, '0'),
  label: String(m).padStart(2, '0')
}));

// Remove default focus style for the react-datepicker's input
const customDatePickerStyles = `
  .custom-datepicker input:focus {
    outline: none !important;
    box-shadow: none !important;
    border-color: #d1d5db !important;
  }
  /* Custom scrollbar styles for notification dropdown */
  .notification-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent; /* thumb: gray-300, track: transparent */
  }
  .notification-scrollbar::-webkit-scrollbar {
    width: 4px;
    background: transparent;
  }
  .notification-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .dark .notification-scrollbar {
    scrollbar-color: #374151 transparent; /* thumb: gray-700, track: transparent */
  }
  .dark .notification-scrollbar::-webkit-scrollbar-thumb {
    background: #374151;
  }
`;

const TimeInput = ({ hour, minute, onHourChange, onMinuteChange }) => {
  // This groups the hour and minute selectors visually, but keeps their dropdowns separate.
  return (
    <div className="flex items-center border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 px-1 w-auto h-auto">
      <CustomSelect
        options={hourOptions}
        value={hour}
        onChange={onHourChange}
        menuPlacement="bottom"
        maxVisibleOptions={5}
        width="50px"
        className="!border-0 !shadow-none"
        dropdownClassName="z-50"
      />
      <span className="mx-1 text-gray-600 dark:text-gray-100 text-md">:</span>
      <CustomSelect
        options={minuteOptions}
        value={minute}
        onChange={onMinuteChange}
        menuPlacement="bottom"
        maxVisibleOptions={5}
        width="50px"
        className="!border-0 !shadow-none"
        dropdownClassName="z-50"
      />
    </div>
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
  const { theme } = useTheme();

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const datePickerRef = useRef(null);

  const handleSubmit = () => {
    handleDateChange({
      startDateTime: tempStartDateTime,
      endDateTime: tempEndDateTime,
    });
    fetchNotifications();
  };

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

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    Cookies.remove('auth', { domain: '.elementsenergies.com', path: '/' });
    window.location.href = 'https://elementsenergies.com/login';
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
  }, []);

  // Border color utility for dropdowns
  const dropdownBorder =
    theme === "dark"
      ? "border border-gray-700"
      : "border border-gray-100";

  return (
  <>
    <style>{customDatePickerStyles}</style>
    <div className="dark:border-b-1 dark:border-gray-700 bg-white dark:bg-gray-900 w-full h-full flex p-3 justify-end space-x-3 items-center shadow-md transition-all duration-300">
      
      {/* Date-Time Picker */}
      <div ref={datePickerRef} className="hidden lg:flex items-center gap-6">
        {/* Start */}
        <div className="flex items-center">
          <label className="text-md mr-3 text-gray-600 dark:text-gray-300">Start</label>
          <div className="flex items-center gap-2">
            <div className="custom-datepicker">
              <DatePicker
                selected={new Date(tempStartDateTime)}
                onChange={(date) => {
                  const updated = moment(date).format("YYYY-MM-DDTHH:mm");
                  setTempStartDateTime(updated);
                }}
                dateFormat="dd:MM:yyyy"
                calendarClassName="dark:bg-gray-700"
                popperClassName="z-50"
                customInput={<CustomDateInput />}
              />
            </div>
            <TimeInput
              hour={moment(tempStartDateTime).format("HH")}
              minute={moment(tempStartDateTime).format("mm")}
              onHourChange={(val) => {
                const updated = moment(tempStartDateTime).set({ hour: +val }).format("YYYY-MM-DDTHH:mm");
                setTempStartDateTime(updated);
              }}
              onMinuteChange={(val) => {
                const updated = moment(tempStartDateTime).set({ minute: +val }).format("YYYY-MM-DDTHH:mm");
                setTempStartDateTime(updated);
              }}
            />
          </div>
        </div>

        {/* End */}
        <div className="flex items-center">
          <label className="text-md mr-3 text-gray-600 dark:text-gray-300">End</label>
          <div className="flex items-center gap-2">
            <div className="custom-datepicker">
              <DatePicker
                selected={new Date(tempEndDateTime)}
                onChange={(date) => {
                  const updated = moment(date).format("YYYY-MM-DDTHH:mm");
                  setTempEndDateTime(updated);
                }}
                dateFormat="dd:MM:yyyy"
                calendarClassName="dark:bg-gray-700"
                popperClassName="z-50"
                customInput={<CustomDateInput />}
              />
            </div>
            <TimeInput
              hour={moment(tempEndDateTime).format("HH")}
              minute={moment(tempEndDateTime).format("mm")}
              onHourChange={(val) => {
                const updated = moment(tempEndDateTime).set({ hour: +val }).format("YYYY-MM-DDTHH:mm");
                setTempEndDateTime(updated);
              }}
              onMinuteChange={(val) => {
                const updated = moment(tempEndDateTime).set({ minute: +val }).format("YYYY-MM-DDTHH:mm");
                setTempEndDateTime(updated);
              }}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-all duration-300"
      >
        <FaArrowRight />
      </button>

      {/* Notifications */}
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
          <div className={`absolute right-[-60px] mt-4 w-72 bg-white dark:bg-gray-900 shadow-lg rounded-lg py-3 z-50 ${dropdownBorder}`}>
            <p className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</p>
            <div className="max-h-48 overflow-y-auto notification-scrollbar">
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

      {/* Profile */}
      <div ref={profileRef} className="relative">
        <div onClick={() => {
          setShowProfileDropdown(!showProfileDropdown);
          setShowNotifications(false);
        }} className="cursor-pointer">
          <img src={userprofile} alt="User" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 transition-all duration-300" />
        </div>
        {showProfileDropdown && (
          <div className={`absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 shadow-lg rounded-lg z-50 py-4 ${dropdownBorder}`}>
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

      {/* Theme Toggle */}
      <ThemeToggleSwitch />
    </div>
  </>
  );
};

export default Navbar;