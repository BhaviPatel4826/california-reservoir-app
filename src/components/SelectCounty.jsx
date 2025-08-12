import React, { useState, useEffect } from 'react'
import Select from './ui/Select';
import { Button } from "./ui/Button";
import Waves from './ui/Waves';
import { Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";



import ReservoirMap from "./ReservoirMap";



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
               let result = {};
                response.result.forEach(c => {
                  result[parseInt(c.COUNTY_NUM, 10)] =
                    c.COUNTY_NAME.charAt(0).toUpperCase() + c.COUNTY_NAME.slice(1).toLowerCase();
                });
              
               setCountyList(result);
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
              
              const result = [];
              meta.result.forEach(s => {
               
                  
                
                if( s.STATION_NAME.includes('RESERVOIR')){
                    result.push({
                      value: s.STATION_ID,
                      label: s.STATION_NAME,
                      latitude: s.LATITUDE,
                      longitude: s.LONGITUDE,
                      county: countyList[parseInt(s.COUNTY_NUM, 10)],
                      elevation: s.ELEVATION,
                    });
                }
              });
              
              setReservoirStations(result);
              setShowMap(true);
            } catch (err) {
              console.error("Error fetching all station metadata:", err);
            }
          };
    
          fetchAllCounties();
          fetchAllStations();
         }, []);
        
  
      

    return (
        <div className="w-[40%] transition-all duration-500 ease-in-out transform">
            

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
                        allStationMeta={reservoirStations}
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
