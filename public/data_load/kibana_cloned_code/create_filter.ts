import { IAggConfig } from '../../../../../src/plugins/data/public/search/aggs';
import { TabbedTable } from '../../../../../src/plugins/data/public';
import { Filter } from '../../../../../src/plugins/data/common';

/**
 * Clone of: '../../../../../src/plugins/data/public/search/expressions/create_filter.ts'
 */

const getOtherBucketFilterTerms = (table: TabbedTable, columnIndex: number, rowIndex: number) => {
  if (rowIndex === -1) {
    return [];
  }

  // get only rows where cell value matches current row for all the fields before columnIndex
  const rows = table.rows.filter((row) => {
    return table.columns.every((column, i) => {
      return row[column.id] === table.rows[rowIndex][column.id] || i >= columnIndex;
    });
  });
  const terms = rows.map((row) => row[table.columns[columnIndex].id]);

  return [
    ...new Set(
      terms.filter((term) => {
        const notOther = term !== '__other__';
        const notMissing = term !== '__missing__';
        return notOther && notMissing;
      })
    ),
  ];
};

export const createFilter = (
  aggConfigs: IAggConfig[],
  table: TabbedTable,
  columnIndex: number,
  rowIndex: number,
  cellValue: any
) => {
  const column = table.columns[columnIndex];
  const aggConfig = aggConfigs[columnIndex];
  let filter: Filter[] = [];
  const value: any = rowIndex > -1 ? table.rows[rowIndex][column.id] : cellValue;
  if (value === null || value === undefined || !aggConfig.isFilterable()) {
    return;
  }
  if (aggConfig.type.name === 'terms' && aggConfig.params.otherBucket) {
    const terms = getOtherBucketFilterTerms(table, columnIndex, rowIndex);
    filter = aggConfig.createFilter(value, { terms });
  } else {
    filter = aggConfig.createFilter(value);
  }

  if (!filter) {
    return;
  }

  if (!Array.isArray(filter)) {
    filter = [filter];
  }

  return filter;
};
