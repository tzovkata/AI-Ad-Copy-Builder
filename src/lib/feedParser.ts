import { FeedRow } from '@/types/feed';
import { v4 as uuidv4 } from 'uuid';

export const parseTSV = (content: string): { headers: string[], rows: FeedRow[] } => {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('Empty file');
  }

  const headers = lines[0].split('\t').map(h => h.trim());
  
  const rows: FeedRow[] = lines.slice(1).map((line, index) => {
    const values = line.split('\t');
    const row: FeedRow = {
      id: uuidv4(),
    } as FeedRow;

    headers.forEach((header, i) => {
      const normalizedHeader = header.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '_');
      row[normalizedHeader] = values[i] || '';
    });

    return row;
  }).filter(row => {
    const hasData = Object.values(row).some(val => val && val !== row.id);
    return hasData;
  });

  return { headers, rows };
};

export const exportToTSV = (headers: string[], rows: FeedRow[]): string => {
  const normalizedHeaders = headers.map(h => 
    h.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '_')
  );
  
  const headerLine = headers.join('\t');
  const dataLines = rows.map(row => {
    return normalizedHeaders.map(header => {
      const value = row[header] || '';
      return value.replace(/\t/g, ' ').replace(/\n/g, ' ');
    }).join('\t');
  });

  return [headerLine, ...dataLines].join('\n');
};