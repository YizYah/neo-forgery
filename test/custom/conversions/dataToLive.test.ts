import test from 'ava';
import { dataToLive } from '../../../src/custom/response/dataToLive';
import { dataResponse, storedResponse } from '../data/ResultSamples';


test('dataToLive', t => {
  const results = dataToLive(dataResponse);

  // this makes sure that the fields converted
  t.is(results.records[0].get('app').properties.value, 'value1')
  t.is(results.records[1].get('app').properties.id, 'id2')

  // this tests the conversion of the neo4j int
  t.is(results.records[1].get('app').identity.low, 4497)
  t.is(results.records[1].get('app').identity.high, 0)

});

