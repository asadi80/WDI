// lib/parseExcelNC.js
import * as XLSX from "xlsx";

/**
 * Parse + validate NC EDX Excel file
 */
export function parseExcelNC(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  if (!rows.length) {
    throw new Error("Empty Excel file");
  }

  // 🔹 REQUIRED NC COLUMNS
  const REQUIRED_COLUMNS = [
    "WAFER_ID of NC EDX data",
    "X",
    "Y",
    "DEFECT_SIZE of NC EDX data"
  ];

  const header = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter(c => !header.includes(c));

  if (missing.length) {
    const err = new Error("Missing required NC columns");
    err.details = missing;
    throw err;
  }

  return rows;
}
