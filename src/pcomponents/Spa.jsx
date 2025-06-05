import React from "react";
import vid2 from "../videos/vid2.mp4"; 

const Spa = () => {
  return (
    <div className="border-gray-300 shadow-md rounded-lg p-4 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-center pb-2 dark:text-white">Sun Path Analysis</h1>
      <video className="w-full rounded-md" autoPlay muted loop>
        <source src={vid2} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Spa;