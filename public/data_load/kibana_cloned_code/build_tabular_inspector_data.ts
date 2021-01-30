import { set } from '@elastic/safer-lodash-set';
import { FormattedData } from '../../../../../src/plugins/inspector/public';
import { FormatFactory } from './utils';
import { TabbedTable } from '../../../../../src/plugins/data/public';
import { createFilter } from './create_filter';

/**
 * Clone of: '../../../../../src/plugins/data/public/search/expressions/build_tabular_inspector_data.ts'
 */


/**
 * @deprecated
 *
 * Do not use this function.
 *
 * @todo This function is used only by Courier. Courier will
 *   soon be removed, and this function will be deleted, too. If Courier is not removed,
 *   move this function inside Courier.
 *
 * ---
 *
 * This function builds tabular data from the response and attaches it to the
 * inspector. It will only be called when the data view in the inspector is opened.
 */
export async function buildTabularInspectorData(
  table: TabbedTable,
  {
    queryFilter,
    deserializeFieldFormat,
  }: {
    queryFilter: { addFilters: (filter: any) => void };
    deserializeFieldFormat: FormatFactory;
  }
) {
  const aggConfigs = table.columns.map((column) => column.aggConfig);
  const rows = table.rows.map((row) => {
    return table.columns.reduce<Record<string, FormattedData>>((prev, cur, colIndex) => {
      const value = row[cur.id];

      let format = cur.aggConfig.toSerializedFieldFormat();
      if (Object.keys(format).length < 1) {
        // If no format exists, fall back to string as a default
        format = { id: 'string' };
      }
      const fieldFormatter = deserializeFieldFormat(format);

      prev[`col-${colIndex}-${cur.aggConfig.id}`] = new FormattedData(
        value,
        fieldFormatter.convert(value)
      );
      return prev;
    }, {});
  });

  const columns = table.columns.map((col, colIndex) => {
    const field = col.aggConfig.getField();
    const isCellContentFilterable = col.aggConfig.isFilterable() && (!field || field.filterable);
    return {
      name: col.name,
      field: `col-${colIndex}-${col.aggConfig.id}`,
      filter:
        isCellContentFilterable &&
        ((value: { raw: unknown }) => {
          const rowIndex = rows.findIndex(
            (row) => row[`col-${colIndex}-${col.aggConfig.id}`].raw === value.raw
          );
          const filter = createFilter(aggConfigs, table, colIndex, rowIndex, value.raw);

          if (filter) {
            queryFilter.addFilters(filter);
          }
        }),
      filterOut:
        isCellContentFilterable &&
        ((value: { raw: unknown }) => {
          const rowIndex = rows.findIndex(
            (row) => row[`col-${colIndex}-${col.aggConfig.id}`].raw === value.raw
          );
          const filter = createFilter(aggConfigs, table, colIndex, rowIndex, value.raw);

          if (filter) {
            const notOther = value.raw !== '__other__';
            const notMissing = value.raw !== '__missing__';
            if (Array.isArray(filter)) {
              filter.forEach((f) => set(f, 'meta.negate', notOther && notMissing));
            } else {
              set(filter, 'meta.negate', notOther && notMissing);
            }
            queryFilter.addFilters(filter);
          }
        }),
    };
  });

  return { columns, rows };
}
