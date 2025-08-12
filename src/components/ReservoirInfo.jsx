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



export default function ReservoirInfo({currReservoir, setCurrReservoir}) {
  
  const [reservoirData, setReservoirData] = useState([]);
  const [stationMeta, setStationMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [latest, setLatest] = useState(0);
  const [showInfo, setShowInfo]  = useState(false);

  const [granularity, setGranularity] = useState({ value: "month", label: "This Year" });
    
  // Fetch based on granularity
  const fetchData = async (granularityValue = granularity) => {
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
      

      setReservoirData(dataJson || []);
      if(reservoirData != []){
      setLatest(Math.floor(dataJson[dataJson.length - 1].value) || 0);
      setPercentage(Math.floor(dataJson[dataJson.length - 1].value * 100 / currReservoir.elevation ) || 0)
      }
      else{
        setLatest(0);
        setPercentage(0);
      }
      console.log('sjdklsdjc')
      console.log(dataRes);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setReservoirData([]);
      setStationMeta(null);
      setTimeout(() => setShowInfo(true), 200);
    }
    setLoading(false);
    
    
  };

  // Fetch when query or granularity changes
  useEffect(() => {
    fetchData(granularity);
  }, [currReservoir, granularity]);

  // Fetch all stations for map
  

  const groupByGranularity = (data, granularity) => {
    const grouped = {};
    console.log(data);
    data.forEach((entry) => {
      const date = dayjs(entry.date);
    
      let key;
      if (granularity === "year") {
        key = date.format("YYYY-MM");
      } else {
        key = date.format("MM-DD");
      } 
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(parseFloat(entry.value));
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
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color:  "#4b5563",
        },
      },
      title: {
        display: true,
        text: `Water Levels by ${granularity.value.charAt(0).toUpperCase() + granularity.value.slice(1)}`,
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
    <div className="w-[50%] m-h-[400px] flex justify-center">
    <AnimatePresence>
    { currReservoir &&showInfo && <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6"

              >
   
        
        
      {currReservoir && (
            <div className="w-full flex-col items-center justify-center text-center p-[6%]">
                <h2 className="text-xl font-semibold">{currReservoir.label}</h2>
                <br></br>
                <p className="text-left pb-[2%]">Capacity <br></br> <b>{currReservoir.elevation} arce-feet</b></p>
                
               
                {reservoirData.length >= 30 && percentage >= 0&&
                <>
                <p className="text-left pb-[2%]">Current water level <br></br> <b>{latest} acre-feet</b></p>
               
                
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

        {reservoirData.length >=30 && <>
         
         

            <Select
                options={[
                { value: "year", label: "Last 10 Years" },
                { value: "month", label: "This Year" },
                ]}
                value={granularity}
                currentValue={granularity}
                onChange={setGranularity}
                placeholder="Granularity"
                width="w-44"
            />
            

           
            <Card className=" w-[95%] rounded-2xl overflow-hidden mb-10">
                <CardContent className="p-6">
                    {loading ? (
                    <Skeleton className=" rounded-xl" />
                    ) : processedData.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                    ) : (
                    <p className="text-center text-red-500 font-semibold">
                        No data found for "{currReservoir?.label}"
                    </p>
                    )}
                </CardContent>
            </Card>
        </>}
      
     
    
    </motion.div>}
    </AnimatePresence>
    </div>
  );
}
