# 🌋 byob-volcanoes 🌋  [![Build Status](https://travis-ci.org/hdechat/byob-volcanoes.svg?branch=master)](https://travis-ci.org/hdechat/byob-volcanoes)

## Application installation

First, clone down the repo `https://github.com/hdechat/byob-volcanoes.git`  
Run `npm i`  
Run `nodemon server.js`  
Visit `localhost:3000` to see the frontend

## API Endpoints

This database contains information about volcanoes. Each volcano has relational geological information, and the volcano is linked to its geo-info by its key `geological_info_id` 

### GET requests

`/api/v1/volcanoes`

Returns all the data corresponding to volcanoes.  
Example response:  

```js
{ volcanoes:
   [
     { id: 1,
       name: 'Vesuvius',
       country: 'Italy',
       geological_info_id: 1,
       created_at: '2018-07-13T18:42:20.027Z',
       updated_at: '2018-07-13T18:42:20.027Z',
       last_known_eruption: '1944 CE' },
     { id: 2,
       name: 'Maar',
       country: 'Germany',
       geological_info_id: 1,
       created_at: '2018-07-13T18:42:20.027Z',
       updated_at: '2018-07-13T18:42:20.027Z',
       last_known_eruption: '4040 CE' },
     { id: 3,
       name: 'Santorini',
       country: 'Greece',
       geological_info_id: 1,
       created_at: '2018-07-13T18:42:20.027Z',
       updated_at: '2018-07-13T18:42:20.027Z',
       last_known_eruption: '1950 CE' }
    ]
}
```

`/api/v1/geo-info`

Returns all the data corresponding to geo-info.  
Example response:

```js
{
   "geoInfo": [
       {
           "id": 1,
           "volcano_type": "cone",
           "rock_type": "basalt",
           "tectonic": "rift zone",
           "created_at": "2018-07-13T18:42:21.186Z",
           "updated_at": "2018-07-13T18:42:21.186Z"
       }
   ]
}
```

`api/v1/volcanoes/:name/`

Returns a volcano that matches the search parameter and all of its related information in geo-info.  
Example response: 
```js
{
   "id": 1,
   "name": "Vesuvius",
   "country": "Italy",
   "geological_info_id": 1,
   "created_at": "2018-07-13T18:42:21.187Z",
   "updated_at": "2018-07-13T18:42:21.187Z",
   "last_known_eruption": "1944 CE",
   "geoInfo": {
       "id": 1,
       "volcano_type": "cone",
       "rock_type": "basalt",
       "tectonic": "rift zone",
       "created_at": "2018-07-13T18:42:21.186Z",
       "updated_at": "2018-07-13T18:42:21.186Z"
   }
}
```

`/api/v1/volcanoes/country/:country`

Returns all of the names of volcanoes in a given country.  
Example response:  
```js
{
   "id": 1,
   "name": "Vesuvius",
   "country": "Italy",
   "geological_info_id": 1,
   "created_at": "2018-07-13T18:42:21.187Z",
   "updated_at": "2018-07-13T18:42:21.187Z",
   "last_known_eruption": "1944 CE",
   "geoInfo": {
       "id": 1,
       "volcano_type": "cone",
       "rock_type": "basalt",
       "tectonic": "rift zone",
       "created_at": "2018-07-13T18:42:21.186Z",
       "updated_at": "2018-07-13T18:42:21.186Z"
   }
}
```

### DELETE requests

`/api/v1/volcanoes/:id`

Removes the volcano that has the matching id. The request does not need a body.  
Does not return any data, and response code is 204 when successful.  

`/api/v1/geo-info/:id`

Removes all geo-info with matching id. The request does not need a body.  
Returns the number of volcanoes that were deleted, which were related to the geo info, and the number of geo-info with the parameter id.  
Example response:
```js
{
  "deletedVolcanoes" [
    2
  ],
  "deletedGeoInfo": 1
}
```

### POST requests

`/api/v1/volcanoes`

Adds a new volcano to the database. Request body must include `name`, `country` and `geological_info_id`.  
Returns the new volcano id.  
Example response:

```js
{
  "id": 35
}
```

`/api/v1/geo-info`

Adds new geological information to the database. Request body must include `volcano_type`, `rock_type` and `tectonic`.  
Example response: 
```js
{
   "volcano_type": "cone",
   "rock_type": "basalt",
   "tectonic": "subduction zone"
}
```

### PUT requests

`/api/v1/volcanoes/:id`

Puts new information in the database about the volcano. Request body must include `name`, `country`, `last_known_eruption` and `geological_info_id`.  
Example response: 
```js
{
   "id": 1,
   "name": "Vesuvius",
   "country": "Italy",
   "geological_info_id": 1,
   "created_at": "2018-07-13T18:42:21.187Z",
   "updated_at": "2018-07-13T18:42:21.187Z",
   "last_known_eruption": "1944 CE"
}
```

### PATCH requests

`/api/v1/geo-info/:id`

Updates geological information for the given geo-info id. Request body must include either `volcano_type`, `rock_type` or `tectonic`.  
Example response:
```js
{
  "id": 5,
  "volcano_type": "Pyroclastic cone(s)",
  "rock_type": "Basalt",
  "tectonic": "Intraplate",
  "created_at": "2018-07-13T18:58:56.691Z",
  "updated_at": "2018-07-13T18:58:56.691Z"
}
```

Built with 💗 by [Helen Dechat](https://github.com/hdechat) and [Krista Handel](https://github.com/meloncatty)
