import React from "react";
import Batteries from '../../dcomponents/Batteries';
import EVChargerOverview from '../evchargers';
import WheeledInSolar from "../../dcomponents/WheeledInSolar";
import PeakDemand from "../../dcomponents/PeakDemand";
import EnergyConsumption from "../../dcomponents/EnergyConsumption";
import MeterInfo from "../EnergyMeter";
import DieselGeneration from "../../dcomponents/DieselGeneration";
import HConsumption from "../../dcomponents/HConsumption";
import Edmc from "../../dcomponents/Edmc";
import ZoneUsage from "../../dcomponents/ZoneUsage";
import EnergySources from "../../dcomponents/EnergySources";



const EDashboard = () => {
  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-700 transition-all duration-300 p-3 gap-3">
      <div className="flex flex-col bg-gray-100 dark:bg-gray-700 transition-all duration-300 gap-3">
        <div>
          <Edmc />
        </div>
        <div className="grid gap-2 grid-cols-1 xl:grid-cols-2 relative">
          <ZoneUsage />
          <EnergySources />
        </div>
      </div>
      <HConsumption/>
      <MeterInfo />
      <PeakDemand />
      <EnergyConsumption />
      <DieselGeneration />
      <WheeledInSolar />
      <Batteries />
      <EVChargerOverview />
    </div>
  );
};

export default EDashboard;