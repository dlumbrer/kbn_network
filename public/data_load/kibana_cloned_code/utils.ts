import { IFieldFormat } from '../../../../../src/plugins/data/common';

/**
 * Clone of: '../../../../../src/plugins/data/public/search/expressions/utils/serialize_agg_config.ts'
 * Component: serializeAggConfig
 */
export function serializeAggConfig(aggConfig) {
  return {
    type: aggConfig.type.name,
    indexPatternId: aggConfig.getIndexPattern().id,
    aggConfigParams: aggConfig.serialize().params,
  };
};

/**
 * Clone of: '../../../../../src/plugins/data/common/field_formats/utils.ts'
 * Component: FormatFactory
*/
export type FormatFactory = (mapping?) => IFieldFormat;
