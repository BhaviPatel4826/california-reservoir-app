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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);



export default function ReservoirInfo({currReservoir, setCurrReservoir}) {
  
  const [reservoirData, setReservoirData] = useState([]);
  const [stationMeta, setStationMeta] = useState(null);
  const [loading, setLoading] = useState(true);

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
        ),
        fetch(
          `https://corsproxy.io/?https://cdec.water.ca.gov/dynamicapp/req/StationMetaServlet?station_id=${currReservoir?.value}`
        ),
      ]);

      const dataJson = await dataRes.json();
      const metaJson = await metaRes.json();

      setReservoirData(dataJson || []);
      setStationMeta(metaJson[0] || null);
      console.log('sjdklsdjc')
      console.log(dataRes);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setReservoirData([]);
      setStationMeta(null);
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
    data.forEach((entry) => {
      const date = dayjs(entry.date);
      let key;
      if (granularity === "year") {
        key = date.format("YYYY");
      } else if (granularity === "month") {
        key = date.format("YYYY-MM");
      } else {
        key = date.format("YYYY-[W]WW");
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
    <div className="w-full flex">
        
        <div>
        {stationMeta && (
            <div className="mb-10 text-center">
                <h2 className="text-2xl font-semibold">{stationMeta.name} Reservoir</h2>
                <p>Location: {stationMeta.county}</p>
                <p>Lat: {stationMeta.latitude}, Lng: {stationMeta.longitude}</p>
                <p>River Basin: {stationMeta.river_basin || "N/A"}</p>
            </div>
            )}

        </div>
        <div>
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
            

           
            <Card className="shadow-xl rounded-2xl overflow-hidden mb-10">
                <CardContent className="p-6">
                    {loading ? (
                    <Skeleton className="w-60 h-50 rounded-xl" />
                    ) : processedData.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                    ) : (
                    <p className="text-center text-red-500 font-semibold">
                        No data found for "{currReservoir?.label}"
                    </p>
                    )}
                </CardContent>
            </Card>
        </div>
      
     
    </div>
  );
}
