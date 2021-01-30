import { getFormatService } from './services';
import { IAggConfig, IFieldFormat, FieldFormatsContentType } from '../../../src/plugins/data/public';

/**
 * Returns the fieldFormatter function associated to aggConfig, for the requested contentType (html or text).
 * Returned fieldFormatter is a function, whose prototype is: fieldFormatter(value, options?)
 */
export function fieldFormatter(aggConfig: IAggConfig, contentType: FieldFormatsContentType) {
  const fieldFormat: IFieldFormat = getFormatService().deserialize(aggConfig.toSerializedFieldFormat());
  return fieldFormat.getConverterFor(contentType);
}
