# steamcommunity-inventory
A rate limit and response handler for steamcommunity inventories.

# V1.0.0
It's functional, it has bugs in it. Will appreciate all feedback I can get.

# Plans
Current [TODO](https://github.com/danocmx/node-steamcommunity-inventory/projects/1) list.
Includes what I want to add in near future and also includes issues so you can suggest stuff.

# DOCS
<a name="Inventory"></a>
## Vocabulary
| Param | Type | Descriptions |
| --- | --- | --- |
| steamID | <code>string</code> | Steam account identificator
| appID | <code>string</code> | Application identificator, eg: https://store.steampowered.com/app/440/Team_Fortress_2/
| contextID | <code>string</code> | Inventory context identificator, eg: https://steamcommunity.com/id/theglencoco/inventory/#440_2_8331418960 440 is AppID, 2 is contextID, last one is assetID

## Inventory
Handles inventory requests to SteamCommunity.

**Kind**: global class

* [Inventory](#Inventory)
    * [new Inventory([headers])](#new_Inventory_new)
    * [.setCookies(cookies)](#Inventory+setCookies)
    * [.get(options)](#Inventory+get)

<a name="new_Inventory_new"></a>

### new Inventory([headers])

| Param | Type | Description |
| --- | --- | --- |
| options.steamID | <code>string</code> | When passed with cookies,     you don't have to rely on rate limit, steam lets you request your inventory freely |
| options.method | <code>&#x27;new&#x27;</code> \| <code>&#x27;old&#x27;</code> | method we use for inventory |
| options.formatter | <code>function</code> | modifies econItem before being passed into then |
| [headers] | <code>Object</code> | HTTP headers |
| **For Rate limiting see**: https://github.com/SGrondin/bottleneck#constructor  |
| options.minTime | <code>number</code> |  |
| options.maxConcurent | <code>number</code> |  |
| options.reservoir | <code>number</code> |  |
| options.reservoirRefreshAmount | <code>number</code> |  |
| options.reservoirRefreshInverval | <code>number</code> |  |

<a name="Inventory+setCookies"></a>

### inventory.setCookies(cookies)
Sets cookies to instance
NOTE: Current version only accepts cookies in for like

**Kind**: instance method of [<code>Inventory</code>](#Inventory)
**See**: https://github.com/DoctorMcKay/node-steam-user#websession

| Param | Type |
| --- | --- |
| cookies | <code>Array.&lt;string&gt;</code> |

<a name="Inventory+get"></a>

### inventory.get(options)
A shorthand function used for requesting and limiting.

**Kind**: instance method of [<code>Inventory</code>](#Inventory)
**See**: Inventory.prototype.getViaNewEndpoint

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | See [old]() or [new]() |

<a name="Inventory+getViaOldEndpoint"></a>

### inventory.getViaOldEndpoint(steamID, appID, contextID, [start], [tradableOnly], [inventory]) ⇒ <code>Promise.&lt;Array.&lt;EconItem&gt;&gt;</code>
Gets inventory from old deprecated endpoint that has more data.

**Kind**: instance method of [<code>Inventory</code>](#Inventory)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| steamID | <code>string</code> |  |  |
| appID | <code>string</code> |  |  |
| contextID | <code>string</code> |  |  |
| [start] | <code>number</code> |  | From which item do we start. |
| [tradableOnly] | <code>boolean</code> | <code>true</code> |  |
| [inventory] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Only if you wanna append more items to it. Used for recursive. |

<a name="Inventory+getViaNewEndpoint"></a>

### inventory.getViaNewEndpoint(steamID, appID, contextID, [language]) ⇒ <code>Promise.&lt;Array.&lt;EconItem&gt;&gt;</code>
Gets inventory from new endpoint that has better rate limit but less data.

**Kind**: instance method of [<code>Inventory</code>](#Inventory)

| Param | Type | Default |
| --- | --- | --- |
| steamID | <code>string</code> |  |
| appID | <code>string</code> |  |
| contextID | <code>string</code> |  |
| [language] | <code>string</code> | <code>&quot;english&quot;</code> |
