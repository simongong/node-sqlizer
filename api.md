## Functions

<dl>
<dt><a href="#getSql">getSql(query, opt)</a> ⇒ <code>string</code></dt>
<dd><p>Get full sql statement.</p>
</dd>
<dt><a href="#limit">limit(page, size)</a> ⇒ <code>String</code></dt>
<dd><p>Get limit clause of a query.</p>
</dd>
<dt><a href="#getCount">getCount(countResult)</a> ⇒ <code>Number</code></dt>
<dd><p>Get count number of a count query.</p>
</dd>
<dt><a href="#getWhere">getWhere(where)</a> ⇒ <code>String</code></dt>
<dd><p>Get where clause of a query.</p>
</dd>
<dt><a href="#toDatetimeStr">toDatetimeStr(date)</a> ⇒ <code>String</code></dt>
<dd><p>Generate a valid datetime string for mysql.</p>
</dd>
<dt><a href="#snakeToCamel">snakeToCamel(data, depth)</a> ⇒ <code>Object</code> | <code>String</code></dt>
<dd><p>Convert format of keys of an object from snake-case to camel-case.</p>
</dd>
<dt><a href="#camelToSnake">camelToSnake(data, depth)</a> ⇒ <code>Object</code> | <code>String</code></dt>
<dd><p>Convert format of keys of an object from camel-case to snake-case.</p>
</dd>
</dl>

<a name="getSql"></a>

## getSql(query, opt) ⇒ <code>string</code>
Get full sql statement.

**Kind**: global function  
**Returns**: <code>string</code> - sql string  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>Object</code> | A JSON object which supports three types of key: table(required), where, limit, orderBy e.g. {   table: 'table_name',   where: {},   limit: [],   orderBy: [] } |
| opt | <code>Object</code> | setting of query: count, distinct, fields (only one can be set) e.g. {   distincts: ['id', 'type'],   count: false,   fields: ['id', 'type'] } |

<a name="limit"></a>

## limit(page, size) ⇒ <code>String</code>
Get limit clause of a query.

**Kind**: global function  
**Returns**: <code>String</code> - sql clause for 'SQL-Limit'  

| Param | Type | Description |
| --- | --- | --- |
| page | <code>Number</code> | number |
| size | <code>Number</code> | number of items in a page |

<a name="getCount"></a>

## getCount(countResult) ⇒ <code>Number</code>
Get count number of a count query.

**Kind**: global function  
**Returns**: <code>Number</code> - count number  

| Param | Type | Description |
| --- | --- | --- |
| countResult | <code>QueryResult</code> | a result of executing a count query. |

<a name="getWhere"></a>

## getWhere(where) ⇒ <code>String</code>
Get where clause of a query.

**Kind**: global function  
**Returns**: <code>String</code> - sql clause for 'SQL-Where'  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>Object</code> | conditions A JSON object which supports three types of key： 1. field_name, 2. `$and`, 3. `$or` Supported logical oprator: $eq / ===, $neq / !==, $gt(e) / >(=), $lt(e) / <(=), $like, $in e.g. conditions = {   key1: 1,   key2: {     $or: {       $neq: 1,       $in: [2, 3, 4]     }   },   key3: {     $like: 'test'   } } |

<a name="toDatetimeStr"></a>

## toDatetimeStr(date) ⇒ <code>String</code>
Generate a valid datetime string for mysql.

**Kind**: global function  
**Returns**: <code>String</code> - formated datetime string  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>DateTime</code> &#124; <code>Date</code> &#124; <code>String</code> | datetime in mysql or date in js |

<a name="snakeToCamel"></a>

## snakeToCamel(data, depth) ⇒ <code>Object</code> &#124; <code>String</code>
Convert format of keys of an object from snake-case to camel-case.

**Kind**: global function  
**Returns**: <code>Object</code> &#124; <code>String</code> - string or keys of object are named in form of camel case  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> &#124; <code>String</code> | string or keys of object are named in form of snake |
| depth | <code>Number</code> | to which level of keys should it process |

<a name="camelToSnake"></a>

## camelToSnake(data, depth) ⇒ <code>Object</code> &#124; <code>String</code>
Convert format of keys of an object from camel-case to snake-case.

**Kind**: global function  
**Returns**: <code>Object</code> &#124; <code>String</code> - string or keys of object are named in form of snake  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> &#124; <code>String</code> | string or keys of object are named in form of camel case |
| depth | <code>Number</code> | to which level of keys should it process |

