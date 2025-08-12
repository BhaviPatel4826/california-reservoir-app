import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import Select from "./ui/Select";
import { Switch } from "./ui/Switch";
import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ReservoirMap from "./ReservoirMap";
import { data } from "autoprefixer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import { motion, AnimatePresence } from "framer-motion";



export default function ReservoirInfo({currReservoir, setCurrReservoir, countyList}) {
  
  const [reservoirData, setReservoirData] = useState([]);
  const [stationMeta, setStationMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [latest, setLatest] = useState(0);
  const [showInfo, setShowInfo]  = useState(false);

  const [granularity, setGranularity] = useState({ value: "month", label: "This Year" });
    
  // Fetch based on granularity
  const fetchData = async (granularityValue = granularity) => {

    if(currReservoir){
      setLoading(true);

      let startDate;
      const today = dayjs().subtract(1, "day").format("YYYY-MM-DD");

      if (granularityValue.value === "year") {
        startDate = dayjs().subtract(10, "year").format("YYYY-MM-DD");
      } else if (granularityValue.value === "month") {
        startDate = dayjs().subtract(1, "year").format("YYYY-MM-DD");
      } else {
        // week granularity
        startDate = dayjs().subtract(3, "month").format("YYYY-MM-DD");
      }

      try {
        const [dataRes, metaRes] = await Promise.all([
          fetch(
            `https://corsproxy.io/?https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet?Stations=${currReservoir?.value}&SensorNums=6&dur_code=D&Start=${startDate}&End=${today}`
          )
        
        ]);

        const dataJson = await dataRes.json();
        
        console.log(dataJson);
        setReservoirData(dataJson || []);
        if(reservoirData != []){
        setLatest(Math.floor(dataJson[dataJson.length - 1].value) || 0);
        setPercentage(Math.floor(dataJson[dataJson.length - 1].value * 100 / currReservoir.elevation ) || 0)
        }
        else{
          setLatest(0);
          setPercentage(0);
        }
      
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setReservoirData([]);
        setStationMeta(null);
        setTimeout(() => setShowInfo(true), 200);
      }
      setLoading(false);
    }
    
    
  };

  // Fetch when query or granularity changes
  useEffect(() => {
    fetchData(granularity);
  }, [currReservoir, granularity]);

  // Fetch all stations for map
  

  const groupByGranularity = (data, granularity) => {
    const grouped = {};
    console.log(granularity);
    data.forEach((entry) => {
      const date = dayjs(entry.date);
    
      let key;
      if (granularity.value === "year") {
        key = date.format("YYYY");
      } else {
        key = date.format("YYYY-MM");
      } 
      if (!grouped[key]) grouped[key] = [];
      if(entry.value >= 0){
        console.log(key);
      grouped[key].push(parseFloat(entry.value));}
    });
    

    return Object.entries(grouped).map(([key, values]) => ({
      date: key,
      value: values.reduce((a, b) => a + b, 0) / values.length,
    }));
  };

  const processedData = groupByGranularity(reservoirData, granularity);

  const chartData = {
    labels: processedData.map((d) => d.date),
    datasets: [
      {
        label: `${currReservoir?.value} Reservoir Level (AF)`,
        data: processedData.map((d) => d.value),
        fill: true,
        borderColor: "#3b82f6",
        backgroundColor:  "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
   
   
    plugins: {
      legend: {
        position: "top",
        labels: {
          color:  "#4b5563",
        },
      },
      title: {
        display: true,
        text: `Water Levels`,
        color: "#1f2937",
      },
    },
    scales: {
      x: {
        ticks: { color:  "#4b5563" },
      },
      y: {
        ticks: { color:  "#4b5563" },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="w-[50%] h-[650px] flex justify-center">
    <AnimatePresence>
    { currReservoir &&showInfo && <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-start bg-white rounded-2xl shadow-lg p-4"

              >
   
        
        
      {currReservoir && (
            <div className="w-full flex-col items-center justify-center text-center p-[6%]">
                <h2 className="text-xl font-semibold">{currReservoir.label}</h2>
                <br></br>
                <p className="text-left pb-[2%]" >County: <b>{countyList[parseInt(currReservoir.county_id, 10)]}</b></p>
                <p className="text-left pb-[2%]">Capacity: <b>{currReservoir.elevation} arce-feet</b></p>
                
               
                {reservoirData.length >= 30 && percentage >= 0 &&
                <>
                <p className="text-left pb-[2%]">Current water level: <b>{latest} acre-feet</b></p>
               
                
                <div className="flex justify-between items-center">
                 <div className="w-[80%] bg-gray-200 rounded h-3 mt-1 flex">
                 <motion.div
                className="bg-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                 <div
                   className="bg-blue-500 h-3 rounded-full"
                   style={{ width: `${percentage}%` }}
                 ></div>
                 </motion.div>
                  </div>
                  <div className="text-xs mt-1 font-bold">{percentage}%</div>
               </div>
               
               </>}
              </div>
            )}

          {reservoirData.length >= 30 && percentage >= 0 ?(<div className="flex-col justify-start w-full h-full pl-[6%]">
         
         

            <Select
                options={[
                { value: "year", label: "Last 10 Years" },
                { value: "month", label: "This Year" },
                ]}
                value={granularity}
                currentValue={granularity}
                onChange={setGranularity}
                placeholder="Granularity"
                width="w-[127px]"
            />
            

           
            <Card className=" w-[95%] h-[310px] rounded-2xl overflow-hidden">
                <CardContent className="p-3">
                    {loading ? (
                    <Skeleton className="rounded-xl h-[270px]" />
                    ) : processedData.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                    ) : (
                    <p className="text-center text-red-500 font-semibold">
                        No data found for "{currReservoir?.label}"
                    </p>
                    )}
                </CardContent>
            </Card>
        </div>): (<p className="text-left pb-[2%]">No data found for the reservior</p>)}
      
     
    
    </motion.div>}
    </AnimatePresence>
    </div>
  );
}
