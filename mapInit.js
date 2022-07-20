import MapFactory from './mapFactory.js'
import {stringXML} from "./getXMLString.js";
import {parseXML} from "./parserXML.js";
import {intersectionDrawHandler} from "./intersectionDrawHandler.js";

const objectMap = MapFactory.getMap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap',
    opacity: 0.4
})

//Сделать перекрестки отдельными объектами (т.к. их может быть много)
//у каждого объекта будут храниться все дороги
//создать отдельный класс для отрисовки перекрестка
objectMap.map.setView([57.9657406, 56.2447505], 17)

const arrayOfIntersectionsData = parseXML(stringXML)
console.log(arrayOfIntersectionsData)

intersectionDrawHandler(arrayOfIntersectionsData, objectMap.map)