import { hasIn } from 'lodash';
import { i18n } from '@kbn/i18n';

import { calculateObjectHash } from '../../../../../src/plugins/kibana_utils/public';
import { PersistedState } from '../../../../../src/plugins/visualizations/public';
import { Adapters } from '../../../../../src/plugins/inspector/public';

import { IAggConfigs } from '../../../../../src/plugins/data/public/search/aggs';
import { ISearchSource } from '../../../../../src/plugins/data/public/search/search_source';
import {
  calculateBounds,
  Filter,
  getTime,
  IIndexPattern,
  isRangeFilter,
  Query,
  TimeRange,
} from '../../../../../src/plugins/data/common';
import { FilterManager } from '../../../../../src/plugins/data/public/query';
import { buildTabularInspectorData } from './build_tabular_inspector_data';
import { search } from '../../../../../src/plugins/data/public';

import { getFormatService as getFieldFormats } from '../../services';

/**
 * Clone of: ../../../../../src/plugins/data/public/search/expressions/esaggs.ts
 * Components: RequestHandlerParams and handleCourierRequest
 */
interface RequestHandlerParams {
  searchSource: ISearchSource;
  aggs: IAggConfigs;
  timeRange?: TimeRange;
  timeFields?: string[];
  indexPattern?: IIndexPattern;
  query?: Query;
  filters?: Filter[];
  forceFetch: boolean;
  filterManager: FilterManager;
  uiState?: PersistedState;
  partialRows?: boolean;
  inspectorAdapters: Adapters;
  metricsAtAllLevels?: boolean;
  visParams?: any;
  abortSignal?: AbortSignal;
}

export const handleCourierRequest = async ({
  searchSource,
  aggs,
  timeRange,
  timeFields,
  indexPattern,
  query,
  filters,
  forceFetch,
  partialRows,
  metricsAtAllLevels,
  inspectorAdapters,
  filterManager,
  abortSignal,
}: RequestHandlerParams) => {
  // Create a new search source that inherits the original search source
  // but has the appropriate timeRange applied via a filter.
  // This is a temporary solution until we properly pass down all required
  // information for the request to the request handler (https://github.com/elastic/kibana/issues/16641).
  // Using callParentStartHandlers: true we make sure, that the parent searchSource
  // onSearchRequestStart will be called properly even though we use an inherited
  // search source.
  const timeFilterSearchSource = searchSource.createChild({ callParentStartHandlers: true });
  const requestSearchSource = timeFilterSearchSource.createChild({ callParentStartHandlers: true });

  aggs.setTimeRange(timeRange as TimeRange);

  // For now we need to mirror the history of the passed search source, since
  // the request inspector wouldn't work otherwise.
  Object.defineProperty(requestSearchSource, 'history', {
    get() {
      return searchSource.history;
    },
    set(history) {
      return (searchSource.history = history);
    },
  });

  requestSearchSource.setField('aggs', function () {
    return aggs.toDsl(metricsAtAllLevels);
  });

  requestSearchSource.onRequestStart((paramSearchSource, options) => {
    return aggs.onSearchRequestStart(paramSearchSource, options);
  });

  // If timeFields have been specified, use the specified ones, otherwise use primary time field of index
  // pattern if it's available.
  const defaultTimeField = indexPattern?.getTimeField?.();
  const defaultTimeFields = defaultTimeField ? [defaultTimeField.name] : [];
  const allTimeFields = timeFields && timeFields.length > 0 ? timeFields : defaultTimeFields;

  // If a timeRange has been specified and we had at least one timeField available, create range
  // filters for that those time fields
  if (timeRange && allTimeFields.length > 0) {
    timeFilterSearchSource.setField('filter', () => {
      return allTimeFields
        .map((fieldName) => getTime(indexPattern, timeRange, { fieldName }))
        .filter(isRangeFilter);
    });
  }

  requestSearchSource.setField('filter', filters);
  requestSearchSource.setField('query', query);

  const reqBody = await requestSearchSource.getSearchRequestBody();

  const queryHash = calculateObjectHash(reqBody);
  // We only need to reexecute the query, if forceFetch was true or the hash of the request body has changed
  // since the last request
  const shouldQuery = forceFetch || (searchSource as any).lastQuery !== queryHash;

  if (shouldQuery) {
    inspectorAdapters.requests.reset();
    const request = inspectorAdapters.requests.start(
      i18n.translate('data.functions.esaggs.inspector.dataRequest.title', {
        defaultMessage: 'Data',
      }),
      {
        description: i18n.translate('data.functions.esaggs.inspector.dataRequest.description', {
          defaultMessage:
            'This request queries Elasticsearch to fetch the data for the visualization.',
        }),
      }
    );
    request.stats(search.getRequestInspectorStats(requestSearchSource));

    try {
      const response = await requestSearchSource.fetch({ abortSignal });

      (searchSource as any).lastQuery = queryHash;

      request.stats(search.getResponseInspectorStats(searchSource, response)).ok({ json: response });

      (searchSource as any).rawResponse = response;
    } catch (e) {
      // Log any error during request to the inspector
      request.error({ json: e });
      throw e;
    } finally {
      // Add the request body no matter if things went fine or not
      requestSearchSource.getSearchRequestBody().then((req: unknown) => {
        request.json(req);
      });
    }
  }

  // Note that rawResponse is not deeply cloned here, so downstream applications using courier
  // must take care not to mutate it, or it could have unintended side effects, e.g. displaying
  // response data incorrectly in the inspector.
  let resp = (searchSource as any).rawResponse;
  for (const agg of aggs.aggs) {
    if (hasIn(agg, 'type.postFlightRequest')) {
      resp = await agg.type.postFlightRequest(
        resp,
        aggs,
        agg,
        requestSearchSource,
        inspectorAdapters.requests,
        abortSignal
      );
    }
  }

  (searchSource as any).finalResponse = resp;

  const parsedTimeRange = timeRange ? calculateBounds(timeRange) : null;
  const tabifyParams = {
    metricsAtAllLevels,
    partialRows,
    timeRange: parsedTimeRange
      ? { from: parsedTimeRange.min, to: parsedTimeRange.max, timeFields: allTimeFields }
      : undefined,
  };

  const tabifyCacheHash = calculateObjectHash({ tabifyAggs: aggs, ...tabifyParams });
  // We only need to reexecute tabify, if either we did a new request or some input params to tabify changed
  const shouldCalculateNewTabify =
    shouldQuery || (searchSource as any).lastTabifyHash !== tabifyCacheHash;

  if (shouldCalculateNewTabify) {
    (searchSource as any).lastTabifyHash = tabifyCacheHash;
    (searchSource as any).tabifiedResponse = search.tabifyAggResponse(
      aggs,
      (searchSource as any).finalResponse,
      tabifyParams
    );
  }

  inspectorAdapters.data.setTabularLoader(
    () =>
      buildTabularInspectorData((searchSource as any).tabifiedResponse, {
        queryFilter: filterManager,
        deserializeFieldFormat: getFieldFormats().deserialize,
      }),
    { returnsFormattedValues: true }
  );

  return (searchSource as any).tabifiedResponse;
};
