import React, { useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiMonitor,
  FiAlertCircle,
  FiHome,
  FiUser,
  FiSettings,
  FiFolder,
  FiMoon,
  FiSun
} from "react-icons/fi";
import logo from "../logo2.png";
import logo2 from "../logo3.png";
import { useTheme } from "./Themecontext";

const links = {
  monitor: [
    { name: "eLog", path: "/monitor/overview" },
    { name: "Zones", path: "/monitor/zones" },
    { name: "Peak Analysis", path: "/monitor/peakanalysis" }
  ]
};

const navItems = [
  { name: "Alerts", path: "/alerts", icon: FiAlertCircle },
  { name: "Building Profile", path: "/profile", icon: FiUser },
  { name: "Files", path: "/files", icon: FiFolder },
  { name: "Settings", path: "/settings", icon: FiSettings }
];

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [monitorTooltip, setMonitorTooltip] = useState(false);
  const [monitorPinned, setMonitorPinned] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const linkClass = (isActive, isCollapsed) =>
    `flex items-center gap-5 p-2 rounded-lg text-md m-2 transition-all duration-300 ${
      isActive
        ? "bg-green-600 text-white shadow"
        : "text-gray-700 hover:bg-green-500 hover:text-white"
    } ${isCollapsed ? "justify-center" : ""}`;

  const iconClass =
    "text-xl mx-auto lg:mx-0 min-w-[24px] min-h-[24px] dark:text-white transition-all duration-300";

  // Monitor is active if any of the links are active
  const isMonitorActive = links.monitor.some(
    (item) => location.pathname === item.path
  );

  // Monitor tooltip logic: stays open if "pinned" (clicked), otherwise shows on hover
  const handleMonitorMouseEnter = () => {
    if (!monitorPinned) setMonitorTooltip(true);
  };
  const handleMonitorMouseLeave = () => {
    if (!monitorPinned) setMonitorTooltip(false);
  };
  const handleMonitorClick = () => {
    setMonitorPinned((prev) => {
      const next = !prev;
      setMonitorTooltip(next); // Open or close tooltip accordingly
      return next;
    });
  };

  // When a monitor link is clicked, unpin and close tooltip
  const handleMonitorLinkClick = () => {
    setMonitorPinned(false);
    setMonitorTooltip(false);
  };

  return (
    <div
      ref={sidebarRef}
      className="h-full w-full overflow-visible bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 flex flex-col relative"
    >
      {/* Logo */}
      <div className="flex justify-center items-center bg-white dark:bg-gray-900 p-5 transition-all duration-300">
        <Link to="/dashboard">
          <img src={logo} alt="logo" className="h-auto w-auto object-contain min-w-[49px] dark:hidden transition-all duration-300 "/>
          <img src={logo2} alt="logo" className="hidden h-auto w-auto object-contain min-w-[49px] dark:block transition-all duration-300 "/>
        </Link>
      </div>

      {/* Sidebar Links */}
      <div className="mt-8 flex flex-col w-full flex-1">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => linkClass(isActive, isCollapsed)}
        >
          <FiHome className={iconClass} />
          <span
            className={`${
              isCollapsed ? "hidden" : "block"
            } dark:text-white transition-all duration-300`}
          >
            Dashboard
          </span>
        </NavLink>

        {/* Monitor Tooltip */}
        <div
          className="relative"
          onMouseEnter={handleMonitorMouseEnter}
          onMouseLeave={handleMonitorMouseLeave}
        >
          <div
            className={`${linkClass(isMonitorActive, isCollapsed)} cursor-pointer relative`}
            onClick={handleMonitorClick}
            tabIndex={0}
          >
            <div className="flex items-center gap-5 dark:text-white transition-all duration-300">
              <FiMonitor className={iconClass} />
              {!isCollapsed && <span>Monitor</span>}
              {/* No dropdown arrow needed */}
            </div>
          </div>

          {/* Tooltip for monitor links (shows on hover or when pinned) */}
          {monitorTooltip && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-white dark:bg-gray-900 shadow-xl rounded-lg w-48 p-2 z-[99999] border border-gray-300 dark:border-gray-700">
              {/* Arrow */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-300 dark:border-r-gray-900  "></div>
              {links.monitor.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded transition-all duration-300 ${
                      isActive
                        ? "text-white bg-green-600"
                        : "text-gray-600 dark:text-white hover:bg-green-500 hover:text-white"
                    }`
                  }
                  onClick={handleMonitorLinkClick}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Other nav items */}
        {navItems.map(({ name, path, icon: Icon }, index) => (
          <NavLink
            key={index}
            to={path}
            className={({ isActive }) => linkClass(isActive, isCollapsed)}
          >
            <Icon className={iconClass} />
            {!isCollapsed && (
              <span className="dark:text-white transition-all duration-300">
                {name}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;