import React from "react";

function StyledDropdown({ name, value, onChange, options, placeholder, title }) {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full p-5 bg-[#394843] text-white rounded-md border border-[#4D5D57] appearance-none pr-16"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23CDCAC4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundPosition: "right 20px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "32px",
        }}
      >
        <option value="">{placeholder || `Select ${title}`}</option>
        {options.map((option, idx) => (
          <option key={`${name}-${idx}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StyledDropdown;