// backend/src/utils/seed.js

import fs from "fs";
import path from "path";
import csv from "csv-parser";
import db from "../config/db.config.js"; // Sequelize instance
import { Sale } from "../models/sale.js"; // Sequelize Sale model

// --- Configuration ---
// Adjust the file path based on your actual data location
const CSV_FILE_PATH = path.resolve(
  process.cwd(),
  "truestate_assignment_dataset.csv"
);
const BATCH_SIZE = 5000; // Optimal batch size for PostgreSQL bulk inserts

/**
 * Transforms a single row of raw CSV data into a clean, database-ready object.
 * (This function is identical to your original, correctly mapping all fields)
 * @param {Object} row - A single row object from csv-parser.
 * @returns {Object} - The cleaned and formatted object for Sequelize insertion.
 */
const transformRow = (row) => {
  const safeParseFloat = (value) =>
    isNaN(parseFloat(value)) ? 0.0 : parseFloat(value);
  const safeParseInt = (value) =>
    isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
  const safeString = (value) => (value ? String(value).trim() : null);

  return {
    transactionId: safeString(row["Transaction ID"]),
    date: new Date(row["Date"]),
    customerId: safeString(row["Customer ID"]),
    customerName: safeString(row["Customer Name"]),
    phoneNumber: safeString(row["Phone Number"]),
    gender: safeString(row["Gender"]),
    age: safeParseInt(row["Age"]),
    customerRegion: safeString(row["Customer Region"]),
    customerType: safeString(row["Customer Type"]),
    productId: safeString(row["Product ID"]),
    productName: safeString(row["Product Name"]),
    brand: safeString(row["Brand"]),
    productCategory: safeString(row["Product Category"]),
    tags: safeString(row["Tags"]),
    quantity: safeParseInt(row["Quantity"]),
    pricePerUnit: safeParseFloat(row["Price per Unit"]),
    discountPercentage: safeParseFloat(row["Discount Percentage"]),
    totalAmount: safeParseFloat(row["Total Amount"]),
    finalAmount: safeParseFloat(row["Final Amount"]),
    paymentMethod: safeString(row["Payment Method"]),
    orderStatus: safeString(row["Order Status"]),
    deliveryType: safeString(row["Delivery Type"]),
    storeId: safeString(row["Store ID"]),
    storeLocation: safeString(row["Store Location"]),
    salespersonId: safeString(row["Salesperson ID"]),
    employeeName: safeString(row["Employee Name"]),
  };
};

/**
 * Reads the CSV using streaming, processes data in chunks, and bulk inserts them.
 * This prevents Node.js from running out of memory.
 */
const seedDatabase = async () => {
  let recordsToInsert = [];
  let totalRecordsProcessed = 0;

  // We capture the stream object to pause/resume it.
  let stream;

  try {
    console.log("--- Database Synchronization ---");
    // Force sync to drop and recreate the table for a clean seed
    await db.sequelize.sync({ force: true });
    console.log("✅ Database synchronized. Table created/reset.");

    console.log(
      `--- Starting CSV Stream and Chunking (Batch Size: ${BATCH_SIZE}) ---`
    );

    // Use a Promise to control the asynchronous stream flow
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(CSV_FILE_PATH);

      readStream
        .pipe(csv())
        .on("data", async (row) => {
          // 1. Pause the stream while we process the current record/batch
          readStream.pause();

          try {
            recordsToInsert.push(transformRow(row));
            totalRecordsProcessed++;

            // 2. Check if the batch limit is reached
            if (recordsToInsert.length >= BATCH_SIZE) {
              const startRecord = totalRecordsProcessed - BATCH_SIZE + 1;
              console.log(
                `   > Inserting Batch: ${startRecord} to ${totalRecordsProcessed}...`
              );

              // 3. Execute bulk insert
              await Sale.bulkCreate(recordsToInsert);

              // 4. Reset the batch array to free up memory
              recordsToInsert = [];
            }

            // 5. Resume the stream to read the next chunk
            readStream.resume();
          } catch (err) {
            console.error(
              "❌ Error during data processing/insertion:",
              err.message
            );
            readStream.destroy(err); // Stop the stream on error
          }
        })
        .on("end", async () => {
          // 6. Insert any remaining records (the final, partial batch)
          if (recordsToInsert.length > 0) {
            console.log(
              `   > Inserting Final Batch of ${recordsToInsert.length} records...`
            );
            await Sale.bulkCreate(recordsToInsert);
          }
          console.log(
            `\n✅ Seeding Complete. Total Records Processed: ${totalRecordsProcessed}`
          );
          resolve();
        })
        .on("error", (err) => {
          console.error("❌ Error reading CSV file:", err.message);
          reject(err);
        });
    });
  } catch (error) {
    console.error("❌ FAILED TO SEED DATABASE:", error.message);
    // Exit process with failure code
    process.exit(1);
  }
};

// Execute the seeding function
seedDatabase();
