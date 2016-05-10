# Node-Sqlizer

[![npm version](https://badge.fury.io/js/node-sqlizer.svg)](https://badge.fury.io/js/node-sqlizer)

Node-Sqlizer is a helper to generate complex sql query statement.

Originally inspired by functions in [Toshihiko](https://github.com/XadillaX/Toshihiko).

## Install

```
$ npm install --save node-sqlizer
```

## API
[API Doc](api.md)

#### Example

```js
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
// sqlizedQuery will be
// 'SELECT * FROM `test` WHERE (`key1` = "value1" AND ((`key2` != "value2" OR `key2` IN (2, 3, 4))) AND (`key3` LIKE "%test%")) ORDER BY key1 DESC LIMIT 10, 20'
```

## License

[MIT](LICENSE)
