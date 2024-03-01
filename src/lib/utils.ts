import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import readXlsxFile from 'read-excel-file';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



interface SpreadsheetRow {
  [key: string]: any; // Adjust according to your data
}

export const parseSpreadsheet = (file: File): Promise<SpreadsheetRow[]> => {
  return readXlsxFile(file).then((rows) => {
    const headers: string[] = rows[0].map((cell) => String(cell));
    const data: SpreadsheetRow[] = rows.slice(1).map((row) => {
      const rowData: SpreadsheetRow = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });
    return data;
  });
};


export const getColorMap = (data: SpreadsheetRow[], colorBy: string): Record<string, string> => {
  const uniqueValues = Array.from(new Set(data.map(row => row[colorBy])));
  const colors = ['blue', 'pink', 'purple', 'yellow']; // Extend this list as needed
  const colorMap: Record<string, string> = {};

  uniqueValues.forEach((value, index) => {
    colorMap[value] = colors[index % colors.length]; // Cycle through colors if there are more unique values than colors
  });

  return colorMap;
};
