import MapFactory from './mapFactory.js'
import {stringXML} from "./getXMLString.js";
import {parseXML, parseXML_v2} from "./parserXML.js";
import {DrawingIntersections} from "./intersectionDrawHandler.js";

const objectMap = MapFactory.getMap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap',
    opacity: 1
})

//Сделать перекрестки отдельными объектами (т.к. их может быть много)
//у каждого объекта будут храниться все дороги
//создать отдельный класс для отрисовки перекрестка
objectMap.map.setView([57.9657406, 56.2447505], 19)

//const array = parseXML_v2(stringXML)
//console.log(array)
L.marker([57.9657406, 56.2447505]).addTo(objectMap.map).bindPopup("<p>Перекресток</p>")
//const arrayOfIntersectionsData = parseXML(stringXML)
const arrayOfIntersectionsData = parseXML_v2(stringXML)
console.log(arrayOfIntersectionsData)

const drawingIntersection = new DrawingIntersections(arrayOfIntersectionsData, objectMap.map)
drawingIntersection.drawIntersections()

//intersectionDrawHandler(arrayOfIntersectionsData, objectMap.map)