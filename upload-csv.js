// upload-csv.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import csv from "csv-parser";

async function uploadCSVtoDB(csvFilePath) {
  const db = await open({
    filename: "./home_inv.db",
    driver: sqlite3.Database,
  });

  await db.exec("BEGIN TRANSACTION"); // Begin transaction for bulk insert

  try {
    const insertStmt = `
      INSERT INTO groceries (item, item_variety, qty, date_purchased, cost, remind_after, category, pack_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", async (row) => {
        const values = [
          row.item,
          row.item_variety,
          row.qty,
          row.date_purchased,
          row.cost,
          row.remind_after,
          row.category,
          row.pack_size,
        ];

        await db.run(insertStmt, values);
      })
      .on("end", async () => {
        await db.exec("COMMIT"); // Commit transaction
        console.log("CSV file successfully processed and data inserted.");
        await db.close();
      });
  } catch (error) {
    await db.exec("ROLLBACK"); // Rollback transaction on error
    console.error("Failed to insert data:", error);
  }
}

// Provide your CSV file path here
uploadCSVtoDB("./groceries.csv");
