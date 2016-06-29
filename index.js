/**
 * A helper to generate complex sql query statement.
 */

'use strict';

const Util = require('util');
const Moment = require('moment');

/**
 * @description Get full sql statement.
 * @param {Object} query A JSON object which supports three types of key:
 * table(required), where, limit, orderBy
 * e.g.
 * {
 *   table: 'table_name',
 *   where: {},
 *   limit: [],
 *   orderBy: []
 * }
 * @param {Object} opt setting of query: count, distinct, fields (only one can be set)
 * e.g.
 * {
 *   distincts: ['id', 'type'],
 *   count: false,
 *   fields: ['id', 'type']
 * }
 * @return {string} sql string
 */
exports.getSql = (query, opt) => {
  let sql = 'SELECT ';

  if (!opt) {
    sql += '*';
  } else {
    // check opt
    if (!_limitedValidProp(opt, ['fields', 'count', 'distincts'], 1)) {
      throw new TypeError('You can ONLY set ONE property of [\'fields\', \'count\', \'distincts\'] in opt!');
    }

    if (opt.fields) {
      if (opt.fields.constructor.name !== 'Array') {
        throw new TypeError('opt.fields MUST be an array!');
      }

      sql += opt.fields.join(',');
    }

    if (opt.count) {
      sql += 'COUNT(0)';
    }

    if (opt.distincts) {
      sql += 'DISTINCT ' + opt.distincts.join(',');
    }
  }

  if (!query.table) {
    throw new TypeError('Table name is required!');
  }
  sql += Util.format(' FROM `%s` ', query.table);

  if (query.where) {
    let where = _makeWhere(query.where);
    sql += where ? 'WHERE ' + where + ' ' : '';
  }

  if (query.groupBy) {
    let group = _makeOrder(query.groupBy);
    sql += group ? 'GROUP BY ' + group + ' ' : '';
  }

  // skip order and limit for count query
  if (opt && opt.count) {
    return sql.trim();
  }

  if (query.orderBy) {
    let order = _makeOrder(query.orderBy);
    sql += order ? 'ORDER BY ' + order + ' ' : '';
  }

  if (query.limit) {
    let limit = _makeLimit(query.limit);
    sql += limit ? 'LIMIT ' + limit + ' ' : '';
  }

  return sql.trim();
};

/**
 * @description Get limit clause of a query.
 * @param  {Number} page number
 * @param  {Number} size number of items in a page
 * @return {String} sql clause for 'SQL-Limit'
 */
exports.limit = (page, size) => {
  page = parseInt(page, 10) || 1;
  size = parseInt(size, 10) || 10;

  if (page < 0) {
    throw new TypeError('Sqlizer.limit: page must be a positive integer but got: ', page);
  }

  return [(page - 1) * size, size];
};

/**
 * @description Get count number of a count query.
 * @param  {QueryResult} countResult a result of executing a count query.
 * @return {Number} count number
 */
exports.getCount = (countResult) => {
  if (countResult && countResult[0]) {
    return parseInt(countResult[0]['COUNT(0)']);
  }
  return 0;
};

/**
 * @description Get where clause of a query.
 * @param  {Object} where conditions A JSON object which supports three types of key：
 * 1. field_name, 2. `$and`, 3. `$or`
 * Supported logical oprator: $eq / ===, $neq / !==, $gt(e) / >(=), $lt(e) / <(=), $like, $in
 * e.g.
 * conditions = {
  key1: 1,
  key2: {
    $or: {
      $neq: 1,
      $in: [2, 3, 4]
    }
  },
  key3: {
    $like: 'test'
  }
 * }
 * @return {String} sql clause for 'SQL-Where'
 */
exports.getWhere = (where) => {
  return _makeWhere(where);
};

/**
 * @description Generate a valid datetime string for mysql.
 * @param {DateTime|Date|String} date datetime in mysql or date in js
 * @return {String} formated datetime string
 */
exports.toDatetimeStr = (date) => {
  return Moment(date).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * @description Convert format of keys of an object from snake-case to camel-case.
 * @param {Object|String} data string or keys of object are named in form of snake
 * @param {Number} depth to which level of keys should it process
 * @return {Object|String} string or keys of object are named in form of camel case
 */
exports.snakeToCamel = (data, depth) => {
  if (Util.isObject(data)) {
    if (typeof depth === 'undefined') {
      depth = 1;
    }
    return _processKeys(data, _camelize, depth);
  } else {
    return _camelize(data);
  }
};

/**
 * @description Convert format of keys of an object from camel-case to snake-case.
 * @param {Object|String} data string or keys of object are named in form of camel case
 * @param {Number} depth to which level of keys should it process
 * @return {Object|String} string or keys of object are named in form of snake
 */
exports.camelToSnake = (data, depth) => {
  if (Util.isObject(data)) {
    if (typeof depth === 'undefined') {
      depth = 1;
    }
    return _processKeys(data, _snakelize, depth);
  } else {
    return _snakelize(data);
  }
};

// snakelize a string formed in underscore
function _snakelize(key) {
  let separator = '_';
  let split = /(?=[A-Z])/;

  return key.split(split).join(separator).toLowerCase();
}

// camelize a string formed in underscore
function _camelize(key) {
  if (Util.isNumber(key)) {
    return key;
  }
  key = key.replace(/[\-_\s]+(.)?/g, (match, ch) => {
    return ch ? ch.toUpperCase() : '';
  });
  // Ensure 1st char is always lowercase
  return key.substr(0, 1).toLowerCase() + key.substr(1);
}

// camelize/snakelize keys of an object
function _processKeys(obj, processer, depth) {
  if (depth === 0 || !Util.isObject(obj)) {
    return obj;
  }

  let result = {};
  let keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    result[processer(keys[i])] = _processKeys(obj[keys[i]], processer, depth - 1);
  }

  return result;
}

// supported value of type: '$and', '$or', 'field_name'
function _makeWhere(conditions, type) {
  let keys = Object.keys(conditions);
  if (keys.length === 0) {
    return '';
  }

  type = type || 'and'; // set type as 'and' by default
  let parts = [];
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    switch (key) {
      case '$and':
        parts.push(_makeWhere(conditions[key]));
        break;
      case '$or':
        parts.push(_makeWhere(conditions[key], 'or'));
        break;
      default:
        // not a logic field
        let sql = _makeConditionField(conditions[key], key, 'and');
        parts.push(sql);
    }
  }

  let result = '';
  for (let i = 0; i < parts.length; i++) {
    if (i) {
      result += ' ' + type.toUpperCase() + ' ';
    }
    result += parts[i];
  }

  return '(' + result + ')';
}

function _makeConditionField(condition, field, type) {
  if (typeof condition !== 'object') {
    return '`' + field + '` = ' + _quotedValue(condition);
  }

  if (condition === null) {
    return '`' + field + '` IS NULL';
  }

  // condition is an object, handle it recursively
  let keys = Object.keys(condition);
  if (keys.length === 0) {
    return '';
  }

  let conditionStrings = [];

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i].toLowerCase();
    let value = condition[keys[i]];
    let symbol = null;

    if (key === '$and' || key === '$or') {
      // array supported
      // eg. $or: [ '127.0.0.1', 'localhost' ]
      if (!Util.isArray(value)) {
        value = [ value ];
      }
      let type = key.substr(1);
      let temp = [];
      for (let k = 0; k < value.length; k++) {
        temp.push(_makeConditionField(value[i], field, type));
      }

      let tempStr = '';
      for (let j = 0; j < temp.length; j++) {
        if (j) {
          tempStr += ' ' + type.toUpperCase() + ' ';
        }
        tempStr += temp[j];
      }
      conditionStrings.push(tempStr);
      continue;
    }

    switch (key) {
      case '$eq':
      case '===': symbol = '='; break;

      case '$neq':
      case '!==': symbol = '!='; break;

      case '$lt':
      case '<': symbol = '<'; break;

      case '$gt':
      case '>': symbol = '>'; break;

      case '$lte':
      case '<=': symbol = '<='; break;

      case '$gte':
      case '>=': symbol = '>='; break;

      case '$like': symbol = 'LIKE'; break;

      // in... (if necessary)
      case '$in': symbol = 'IN'; break;
      case '$notin': symbol = 'NOTIN'; break;

      default: break;
    }

    if (symbol) {
      if (symbol === 'IN') {
        let str = '`' + field + '` IN (';
        str += value.map(_quotedValue).join(', ');
        str += ')';
        conditionStrings.push(str);
        continue;
      }
      if (symbol === 'NOTIN') {
        let str = '`' + field + '` NOT IN (';
        str += value.map(_quotedValue).join(', ');
        str += ')';
        conditionStrings.push(str);
        continue;
      }

      if (symbol === 'LIKE') {
        let str = '`' + field + '` LIKE ';
        str += _escapeLikeValue(value);
        conditionStrings.push(str);
        continue;
      }

      if (value === null) {
        switch (symbol) {
          case '=':
            conditionStrings.push('`' + field + '` IS NULL');
            break;
          case '!=':
            conditionStrings.push('`' + field + '` IS NOT NULL');
            break;
          default:
            break;
        }
      }

      let cdt = Util.format('`%s` %s %s', field, symbol, _quotedValue(value));

      conditionStrings.push(cdt);
    }
  }

  // splice conditions
  let result = '';
  for (let i = 0; i < conditionStrings.length; i++) {
    if (i) {
      result += ' ' + type.toUpperCase() + ' ';
    }

    result += conditionStrings[i];
  }

  return '(' + result + ')';
}

function _makeLimit(conditions, upperOnly) {
  if (!Util.isArray(conditions)) {
    throw new TypeError('Type of limit should be array but got:', conditions);
  }

  let limit = _limitArrayToObject(conditions);

  if (upperOnly) {
    return limit.limit;
  }

  return limit.skip + ', ' + limit.limit;
}

function _limitArrayToObject(limitArray) {
  let obj = {
    skip: limitArray[0],
    limit: limitArray[1],
  };

  if (undefined === obj.limit) {
    obj.limit = obj.skip;
    obj.skip = 0;
  }
  if (undefined === obj.skip) {
    obj.skip = 0;
    obj.limit = 1;
  }

  obj.skip = parseInt(obj.skip);
  obj.limit = parseInt(obj.limit);

  return obj;
}

// a string or an array of string
function _makeOrder(conditions) {
  if (!conditions) {
    return '';
  }

  let order = '';
  if (Util.isString(conditions)) {
    order = conditions;
  }

  if (Util.isArray(conditions)) {
    order = conditions.join(',');
  }

  return order ? order : '';
}

function _escapeValue(value) {
  if (Buffer.isBuffer(value)) {
    return 'X"' + value.toString('hex') + '"';
  }

  if (typeof value === 'string') {
    value = value.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, (s) => {
      switch (s) {
        case '\0': return '\\0';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\b': return '\\b';
        case '\t': return '\\t';
        case '\x1a': return '\\Z';
        default: return '\\' + s;
      }
    });
  }

  return value;
}

function _quotedValue(value) {
  if (Util.isNumber(value) || Util.isBoolean(value)) {
    return value;
  }

  return '"' + _escapeValue(value) + '"';
}

function _escapeLikeValue(value) {
  if (Util.isNumber(value) || Util.isBoolean(value)) {
    return value;
  }
  let target = value.slice(1, -1);
  target = _escapeValue(target);
  target = target.replace(/[\_%]/g, '\\$&');
  return '"%' + target + '%"';
}

// check if numbers of properties in an object is as limited
function _limitedValidProp(obj, keys, limit) {
  keys.forEach((k) => obj[k] && limit--);

  return limit === 0 ? true : false;
}
