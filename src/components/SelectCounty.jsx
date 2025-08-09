import React, { useState, useEffect } from 'react'
import Select from './ui/Select';
import { Button } from "./ui/Button";
import Waves from './ui/Waves';
import { Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent } from "./ui/Card";

import { Skeleton } from "./ui/Skeleton";

import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ReservoirMap from "./ReservoirMap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SelectCounty = ({currCounty, setCurrCounty, setCurrReservoir}) => {
    const [stationList, setStationList] = useState([]);
    const [countyList, setCountyList] = useState([]);
    const [newCounty, setNewCounty] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [reservoirStations, setReservoirStations] = useState([]);
     
     useEffect(() => {
         
           const fetchAllCounties = async () => {
             try {
               const res = await fetch(
                 'https://corsproxy.io/?https://cdec.water.ca.gov/CDECStationServices/CDecServlet/getCounty'
               );
     
               const response = await res.json();
               const counties = response.result.map(c => 
                ({ label : c.COUNTY_NAME.charAt(0).toUpperCase() + c.COUNTY_NAME.slice(1).toLowerCase(),
                  value : parseInt(c.COUNTY_NUM,10)
                })
               );
               console.log(counties);
               setCountyList(counties);
             } catch (err) {
               console.error("Error fetching all counties:", err);
             }
           }
         
           
           const fetchAllStations = async () => {
            try {
              const res = await fetch(
                `https://corsproxy.io/?https://cdec.water.ca.gov/CDECStationServices/CDecServlet/getAllStationsDetailed`
              );
              const meta = await res.json();
              
              const result = {};
              meta.result.forEach(s => {
                if (!result[s.COUNTY_NUM]) {
                  result[s.COUNTY_NUM] = [];
                }
                result[parseInt(s.COUNTY_NUM,10)].push({
                  value: s.STATION_ID,
                  label: s.STATION_NAME,
                  latitude: s.LATITUDE,
                  longitude: s.LONGITUDE
                });
              });
              
              setReservoirStations(result);
            } catch (err) {
              console.error("Error fetching all station metadata:", err);
            }
          };
    
          fetchAllCounties();
          fetchAllStations();
         }, []);
        
  
      

    return (
        <div className="transition-all duration-500 ease-in-out transform">
            <div className="flex flex-wrap justify-center gap-6 mb-10">
                <Select
                options={countyList}
                value={newCounty}
                currentValue={currCounty}
                onChange={setNewCounty}
                placeholder="Select a county...."
                />
                <Button
                className="px-6 h-10 shadow-lg"
                onClick={() => {
                    setCurrCounty(newCounty);
                    setShowMap(true);
                    setCurrReservoir('');
                }}
                >
                Search
                </Button>
            </div>

            <AnimatePresence>
                {showMap && (
                    <motion.div
                    key="map"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    >
                    <ReservoirMap
                        allStationMeta={reservoirStations[currCounty?.value]}
                        setCurrReservoir={setCurrReservoir}
                        setShowMap = {setShowMap}
                    />
                    </motion.div>
                )}
            </AnimatePresence>

            
        </div>

    )
}

export default SelectCounty
