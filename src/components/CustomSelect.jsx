import React, { useRef, useEffect, useState } from "react";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  maxVisibleOptions = 5,
  width = "100px",
}) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(
    options.findIndex((opt) => opt.value === value)
  );
  const wrapperRef = useRef(null);

  // Always force dropdown to open downward (bottom)
  // and constrain to viewport using a portal if needed.
  // For most use-cases, just anchoring to bottom is enough.

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        setHighlighted((prev) =>
          Math.min(prev + 1, options.length - 1)
        );
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setHighlighted((prev) => Math.max(prev - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (options[highlighted]) {
          onChange(options[highlighted].value);
          setOpen(false);
        }
        e.preventDefault();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [open, highlighted, options, onChange]);

  useEffect(() => {
    if (open && wrapperRef.current) {
      const elem = wrapperRef.current.querySelector(
        `.custom-select-option.highlighted`
      );
      if (elem && elem.scrollIntoView) {
        elem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open, highlighted]);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "";

  return (
    <div
      className="custom-select-wrapper"
      ref={wrapperRef}
      style={{ width, position: "relative", minWidth: width }}
    >
      <button
        type="button"
        className={`border rounded text-md 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-white dark:border-none flex items-center justify-center w-full`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
      >
        <span>{selectedLabel}</span>
      </button>
      {open && (
        <ul
          className="custom-select-dropdown"
          style={{
            position: "absolute",
            left: 0,
            top: "110%", // always below the input
            width: "100%",
            background: "var(--custom-select-bg, #fff)",
            color: "var(--custom-select-color, #111827)",
            maxHeight: `${maxVisibleOptions * 36}px`,
            overflowY: "auto",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            borderRadius: 8,
            zIndex: 9999,
            border: "1px solid #e5e7eb",
            padding: 0,
            margin: 0,
            listStyle: "none",
          }}
          role="listbox"
        >
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              className={`custom-select-option px-3 py-2 cursor-pointer ${
                idx === highlighted ? "highlighted" : ""
              } ${opt.value === value ? "selected" : ""}`}
              style={{
                background:
                  idx === highlighted
                    ? "var(--custom-select-highlight, #f3f4f6)"
                    : opt.value === value
                    ? "var(--custom-select-selected, #2563eb)"
                    : "transparent",
                color:
                  opt.value === value
                    ? "#fff"
                    : "inherit",
                fontWeight: opt.value === value ? "bold" : "normal",
              }}
              onMouseEnter={() => setHighlighted(idx)}
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={opt.value === value}
              tabIndex={-1}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;