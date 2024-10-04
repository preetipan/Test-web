"use client"; // This tells Next.js that this is a client component
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Navbar from '../Component/Navbar'; 
import styles from './page.module.css'; // Import the module CSS

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StockCharts() {
  const [data, setData] = useState([]);

  // Fetch stock data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/stocks");
        const apiData = response.data.map(stock => ({
          name: stock.stockName,
          yp80Plus: stock.y.plus.YP80,
          yp50Plus: stock.y.plus.YP50,
          yp20Plus: stock.y.plus.YP20,
          yp80Minus: stock.y.minus.YP80,
          yp50Minus: stock.y.minus.YP50,
          yp20Minus: stock.y.minus.YP20,
        }));
        setData(apiData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.map((item) => item.name), // Stock names as labels
    datasets: [
      {
        label: '+Y (YP80)',
        data: data.map((item) => item.yp80Plus), // Data from +Y (YP80)
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: '+Y (YP50)',
        data: data.map((item) => item.yp50Plus), // Data from +Y (YP50)
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
      {
        label: '+Y (YP20)',
        data: data.map((item) => item.yp20Plus), // Data from +Y (YP20)
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
      {
        label: '-Y (YP80)',
        data: data.map((item) => item.yp80Minus), // Data from -Y (YP80)
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: '-Y (YP50)',
        data: data.map((item) => item.yp50Minus), // Data from -Y (YP50)
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: '-Y (YP20)',
        data: data.map((item) => item.yp20Minus), // Data from -Y (YP20)
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Percentage Changes (+Y and -Y)',
      },
    },
  };

  return (
    <div style={{backgroundColor: 'white', height: '100%', color:'white'}}>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.chartWrapper}>
          <h1 className={styles.title}>Stock Charts</h1>{" "}
          {/* Apply class here */}
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
