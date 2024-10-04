"use client";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Navbar from "./Component/Navbar";

export default function Home() {
  const [data, setData] = useState([]);
  const [editCell, setEditCell] = useState({ row: null, column: null });
  const [tempValue, setTempValue] = useState("");

  // ฟังก์ชันดึงข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/stocks"); // URL ของ API
        const apiData = response.data.map((stock) => ({
          id: stock._id, // เพิ่ม id เพื่อใช้ในการอัปเดต
          name: stock.stockName,
          y_data_count: stock.y.minus.dataPoints,
          yp80: `${stock.y.minus.YP80}%`,
          yp50: `${stock.y.minus.YP50}%`,
          yp20: `${stock.y.minus.YP20}%`,
          yp_data_count: stock.y.plus.dataPoints,
          yp80_plus: `${stock.y.plus.YP80}%`,
          yp50_plus: `${stock.y.plus.YP50}%`,
          yp20_plus: `${stock.y.plus.YP20}%`,
          yh_data_count: stock.yh.minus.dataPoints,
          yh80: `${stock.yh.minus.YhP80}%`,
          yh50: `${stock.yh.minus.YhP50}%`,
          yh20: `${stock.yh.minus.YhP20}%`,
          yh_data_count_plus: stock.yh.plus.dataPoints,
          yh80_plus: `${stock.yh.plus.YhP80}%`,
          yh50_plus: `${stock.yh.plus.YhP50}%`,
          yh20_plus: `${stock.yh.plus.YhP20}%`,
          daily_opportunity: [
            stock.y.minus.dailyOccurrence,
            stock.y.plus.dailyOccurrence,
            stock.yh.minus.dailyOccurrence,
          ],
        }));
        setData(apiData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันส่งข้อมูลที่อัปเดตไปยัง API
  const updateStock = async (updatedRow) => {
    try {
      // ส่งข้อมูลอัปเดตไปยัง API ผ่าน PUT
      await axios.put(
        `http://localhost:5000/update-stock/${updatedRow.id}`,
        updatedRow
      );
      console.log("Data updated successfully:", updatedRow);
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // ฟังก์ชัน handleBlur เมื่อผู้ใช้แก้ไขข้อมูลเสร็จ
  const handleBlur = () => {
    const { row, column } = editCell;
    const newData = [...data];
    newData[row][column] = tempValue;
    setData(newData);
    setEditCell({ row: null, column: null });

    // ส่งข้อมูลไปยัง API เมื่อมีการแก้ไขข้อมูล
    updateStock(newData[row]);
  };

  const handleDoubleClick = (rowIndex, columnKey) => {
    setEditCell({ row: rowIndex, column: columnKey });
    setTempValue(data[rowIndex][columnKey]);
  };

  const handleChange = (e) => {
    setTempValue(e.target.value);
  };

  // ฟังก์ชัน import Excel
  const importExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      try {
        // ดึงข้อมูลปัจจุบันจาก API เพื่อตรวจสอบหุ้นที่มีอยู่แล้ว
        const response = await axios.get("http://localhost:5000/stocks");
        const existingData = response.data;

        // จัดรูปแบบข้อมูลจากไฟล์ Excel
        const importedData = jsonData.map((row) => ({
          name: row["รายชื่อหุ้น"],
          y_data_count: row["จำนวนข้อมูล -y"],
          yp80: row["-Y = -YP80"],
          yp50: row["-Y = -YP50"],
          yp20: row["-Y = -YP20"],
          yp_data_count: row["จำนวนข้อมูล +y"],
          yp80_plus: row["+Y = +YP80"],
          yp50_plus: row["+Y = +YP50"],
          yp20_plus: row["+Y = +YP20"],
          yh_data_count: row["จำนวนข้อมูล -Yh"],
          yh80: row["-Yh = -YhP80"],
          yh50: row["-Yh = -YhP50"],
          yh20: row["-Yh = -YhP20"],
          yh_data_count_plus: row["จำนวนข้อมูล +Yh"],
          yh80_plus: row["+Yh = +YhP80"],
          yh50_plus: row["+Yh = +YhP50"],
          yh20_plus: row["+Yh = +YhP20"],
        }));

        // ตรวจสอบว่าเป็นหุ้นใหม่หรือหุ้นที่มีอยู่แล้ว
        const updatedData = importedData.map((newStock) => {
          const existingStock = existingData.find(
            (stock) => stock.stockName === newStock.name
          );
          if (existingStock) {
            // ถ้ามีอยู่แล้วให้ทำการอัปเดต
            return {
              ...existingStock,
              ...newStock, // อัปเดตข้อมูลใหม่
            };
          } else {
            // ถ้าไม่มีให้เพิ่มใหม่
            return newStock;
          }
        });

        // ส่งข้อมูลที่อัปเดตไปยัง API
        await axios.post("http://localhost:5000/update", updatedData);

        // อัปเดตข้อมูลใน state เพื่อแสดงผลในตาราง
        setData(updatedData);

        console.log("Data imported and updated successfully.");
      } catch (error) {
        console.error("Error updating data:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ฟังก์ชัน export เป็น Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const headerRows = [
      [
        "ลำดับ",
        "รายชื่อหุ้น",
        "กราฟ 15 วินาที ค่า -y",
        "",
        "",
        "",
        "กราฟ 15 วินาที ค่า +y",
        "",
        "",
        "",
        "กราฟ 15 วินาที ค่า -Yh",
        "",
        "",
        "",
        "กราฟ 15 วินาที ค่า +Yh",
        "",
        "",
        "",
      ],
      [
        "",
        "",
        "จำนวนข้อมูล",
        "-Y = -YP80",
        "-Y = -YP50",
        "-Y = -YP20",
        "จำนวนข้อมูล",
        "+Y = +YP80",
        "+Y = +YP50",
        "+Y = +YP20",
        "จำนวนข้อมูล",
        "-Yh = -YhP80",
        "-Yh = -YhP50",
        "-Yh = -YhP20",
        "จำนวนข้อมูล",
        "+Yh = +YhP80",
        "+Yh = +YhP50",
        "+Yh = +YhP20",
      ],
    ];

    const dataRows = data.map((row, index) => [
      index + 1,
      row.name,
      row.y_data_count,
      row.yp80,
      row.yp50,
      row.yp20,
      row.yp_data_count,
      row.yp80_plus,
      row.yp50_plus,
      row.yp20_plus,
      row.yh_data_count,
      row.yh80,
      row.yh50,
      row.yh20,
      row.yh_data_count_plus,
      row.yh80_plus,
      row.yh50_plus,
      row.yh20_plus,
    ]);

    const completeData = [...headerRows, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(completeData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "table_data.xlsx");
  };

  const tableData = useMemo(() => data, [data]);

  return(
  <div>
    <Navbar />
    <div className={styles.page}>
      <main className={styles.main}>
        <h4>
          ค่า Y ที่อยู่ในช่วงขาขึ้น ข้อมูลตั้งแต่วันที่ 8 พ.ค. 2567 - 30 ส.ค.
          2567 (80 วันเทรด)
        </h4>
        <br />

        <div className={styles.scrollableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} rowSpan="2">
                  ลำดับ
                </th>
                <th className={styles.th} rowSpan="2">
                  รายชื่อหุ้น
                </th>
                <th className={styles.th} colSpan="4">
                  กราฟ 15 วินาที ค่า -y
                </th>
                <th className={styles.th} colSpan="4">
                  กราฟ 15 วินาที ค่า +y
                </th>
                <th className={styles.th} colSpan="4">
                  กราฟ 15 วินาที ค่า -Yh
                </th>
                <th className={styles.th} colSpan="4">
                  กราฟ 15 วินาที ค่า +Yh
                </th>
              </tr>
              <tr>
                <th className={styles.th}>จำนวนข้อมูล</th>
                <th className={styles.th}>-Y = -YP80</th>
                <th className={styles.th}>-Y = -YP50</th>
                <th className={styles.th}>-Y = -YP20</th>
                <th className={styles.th}>จำนวนข้อมูล</th>
                <th className={styles.th}>+Y = +YP80</th>
                <th className={styles.th}>+Y = +YP50</th>
                <th className={styles.th}>+Y = +YP20</th>
                <th className={styles.th}>จำนวนข้อมูล</th>
                <th className={styles.th}>-Yh = -YhP80</th>
                <th className={styles.th}>-Yh = -YhP50</th>
                <th className={styles.th}>-Yh = -YhP20</th>
                <th className={styles.th}>จำนวนข้อมูล</th>
                <th className={styles.th}>+Yh = +YhP80</th>
                <th className={styles.th}>+Yh = +YhP50</th>
                <th className={styles.th}>+Yh = +YhP20</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr>
                    <td className={styles.td} rowSpan="2">
                      {rowIndex + 1}
                    </td>
                    <td className={styles.td} rowSpan="2">
                      {row.name}
                    </td>
                    {[
                      "y_data_count",
                      "yp80",
                      "yp50",
                      "yp20",
                      "yp_data_count",
                      "yp80_plus",
                      "yp50_plus",
                      "yp20_plus",
                      "yh_data_count",
                      "yh80",
                      "yh50",
                      "yh20",
                      "yh_data_count_plus",
                      "yh80_plus",
                      "yh50_plus",
                      "yh20_plus",
                    ].map((key) => (
                      <td
                        className={styles.td}
                        onDoubleClick={() => handleDoubleClick(rowIndex, key)}
                      >
                        {editCell.row === rowIndex &&
                        editCell.column === key ? (
                          <input
                            value={tempValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autoFocus
                          />
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.td}>โอกาสที่เกิดขึ้นต่อวัน:</td>
                    {row.daily_opportunity &&
                      row.daily_opportunity.map((opportunity, index) => (
                        <td className={styles.td} key={index}>
                          {opportunity}%
                        </td>
                      ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <button className={styles.exportButton} onClick={exportToExcel}>
          Export to Excel
        </button>

        <input
          type="file"
          accept=".xlsx, .xls"
          className={styles.importButton}
          onChange={importExcel}
        />
      </main>
    </div>
  </div>
  )
}
