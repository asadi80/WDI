import * as XLSX from "xlsx";
import { REQUIRED_COLUMNS } from "./requiredColumns";

/**
 * Normalize Excel column names
 * - trims spaces
 * - collapses multiple spaces
 */
function normalizeKey(key) {
  return key
    .replace(/\(nm\)/gi, "")   // remove (nm)
    .trim()
    .replace(/\s+/g, " ");
}

export function parseAndValidateExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  if (!rawRows.length) {
    throw new Error("Excel file is empty");
  }

  // 🔧 Normalize all column names
  const rows = rawRows.map(row =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        normalizeKey(key),
        value
      ])
    )
  );

  // 🔍 Validate required columns
  const missing = REQUIRED_COLUMNS.filter(
    col => !(col in rows[0])
  );

  if (missing.length) {
    const err = new Error("Missing required columns");
    err.details = missing;
    throw err;
  }

  return rows;
}
