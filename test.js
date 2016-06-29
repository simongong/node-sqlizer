'use strict';

const expect = require('expect');
const Sqlizer = require('./index');

describe('test/service/sqlizer.test.js', function() {

  it('should get correct query sql', function() {
    let query = {
      table: 'test',
      where: {
        key1: 'value1',
        key2: {
          $or: {
            $neq: 'value2',
            $in: [2, 3, 4],
          },
        },
        key3: {
          $like: '%test%',
        },
      },
      limit: [10, 20],
      orderBy: 'key1 DESC',
    };
    let sqlizedQuery = Sqlizer.getSql(query);
    let expectedQuery = 'SELECT * FROM `test` WHERE (`key1` = "value1" AND ((`key2` != "value2" OR `key2` IN (2, 3, 4))) AND (`key3` LIKE "%test%")) ORDER BY key1 DESC LIMIT 10, 20';
    expect(sqlizedQuery).toEqual(expectedQuery);
  });

  it('should get correct query sql with fields', function() {
    let query = {
      table: 'test',
      where: {
        key1: 'value1',
        key2: {
          $or: {
            $neq: 'value2',
            $in: [2, 3, 4],
          },
        },
        key3: {
          $like: '%test%',
        },
      },
      limit: [10, 20],
      orderBy: 'key1 DESC',
    };
    let fields = ['id', 'type'];
    let sqlizedQuery = Sqlizer.getSql(query, {fields});
    let expectedQuery = 'SELECT id,type FROM `test` WHERE (`key1` = "value1" AND ((`key2` != "value2" OR `key2` IN (2, 3, 4))) AND (`key3` LIKE "%test%")) ORDER BY key1 DESC LIMIT 10, 20';
    expect(sqlizedQuery).toEqual(expectedQuery);
  });

  it('should get camelized object', function() {
    let snake = {
      a_b: 'test',
      c: 1,
      d_e: {
        f_gh: 2,
      },
    };
    let camelized = Sqlizer.snakeToCamel(snake);
    expect(camelized.aB).toExist();
    expect(camelized.c).toExist();
    expect(camelized.dE).toExist();
    expect(camelized.dE.fGh).toNotExist();

    let deepCamelized = Sqlizer.snakeToCamel(snake, 2);
    expect(deepCamelized.dE.fGh).toExist();
  });

  it('should get snakelized object', function() {
    let camel = {
      aB: 'test',
      c: 1,
      dE: {
        fGh: 2,
      },
    };
    let snakelized = Sqlizer.camelToSnake(camel);
    expect(snakelized.a_b).toExist();
    expect(snakelized.c).toExist();
    expect(snakelized.d_e).toExist();
    expect(snakelized.d_e.f_gh).toNotExist();

    let deepSnakelized = Sqlizer.camelToSnake(camel, 2);
    expect(deepSnakelized.d_e.f_gh).toExist();
  });
});
